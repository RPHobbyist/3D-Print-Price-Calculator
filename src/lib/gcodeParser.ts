// G-code and 3MF parser utility to extract print time and filament usage
import JSZip from 'jszip';

export interface GcodeData {
  printTimeHours: number;
  filamentWeightGrams: number;
  filamentLengthMm: number;
}

export const parseGcode = (content: string): GcodeData => {
  let printTimeHours = 0;
  let filamentWeightGrams = 0;
  let filamentLengthMm = 0;

  const lines = content.split('\n');

  for (const line of lines) {
    const trimmedLine = line.trim().toUpperCase();

    // Parse print time - various formats
    // PrusaSlicer: ; estimated printing time (normal mode) = 2h 30m 15s
    // Cura: ;TIME:9015 (in seconds)
    // Other: ;Print time: 2:30:15
    
    if (trimmedLine.includes('TIME:') || trimmedLine.includes('TIME =')) {
      const timeMatch = trimmedLine.match(/TIME[:\s=]+(\d+)/i);
      if (timeMatch) {
        const seconds = parseInt(timeMatch[1]);
        printTimeHours = seconds / 3600;
      }
    }

    // PrusaSlicer format: ; estimated printing time
    if (trimmedLine.includes('ESTIMATED PRINTING TIME')) {
      const timeMatch = line.match(/(\d+)H\s*(\d+)M\s*(\d+)S/i) ||
                        line.match(/(\d+)H\s*(\d+)M/i) ||
                        line.match(/(\d+)M\s*(\d+)S/i) ||
                        line.match(/(\d+)H/i);
      
      if (timeMatch) {
        let hours = 0, minutes = 0, seconds = 0;
        
        if (line.match(/(\d+)H\s*(\d+)M\s*(\d+)S/i)) {
          const m = line.match(/(\d+)H\s*(\d+)M\s*(\d+)S/i)!;
          hours = parseInt(m[1]);
          minutes = parseInt(m[2]);
          seconds = parseInt(m[3]);
        } else if (line.match(/(\d+)H\s*(\d+)M/i)) {
          const m = line.match(/(\d+)H\s*(\d+)M/i)!;
          hours = parseInt(m[1]);
          minutes = parseInt(m[2]);
        } else if (line.match(/(\d+)M\s*(\d+)S/i)) {
          const m = line.match(/(\d+)M\s*(\d+)S/i)!;
          minutes = parseInt(m[1]);
          seconds = parseInt(m[2]);
        } else if (line.match(/(\d+)H/i)) {
          const m = line.match(/(\d+)H/i)!;
          hours = parseInt(m[1]);
        }
        
        printTimeHours = hours + (minutes / 60) + (seconds / 3600);
      }
    }

    // Parse filament used
    // PrusaSlicer: ; filament used [mm] = 12345.67
    // Cura: ;Filament used: 12.345m
    // Generic: ;FILAMENT_USED:12345
    
    if (trimmedLine.includes('FILAMENT USED') || trimmedLine.includes('FILAMENT_USED')) {
      // Check for meters
      const metersMatch = line.match(/(\d+\.?\d*)\s*M(?!M)/i);
      if (metersMatch) {
        filamentLengthMm = parseFloat(metersMatch[1]) * 1000;
      }
      
      // Check for mm
      const mmMatch = line.match(/\[MM\]\s*=\s*(\d+\.?\d*)/i) || 
                      line.match(/(\d+\.?\d*)\s*MM/i);
      if (mmMatch) {
        filamentLengthMm = parseFloat(mmMatch[1]);
      }
    }

    // Parse filament weight if available
    // PrusaSlicer: ; filament used [g] = 123.45
    if (trimmedLine.includes('FILAMENT USED') && trimmedLine.includes('[G]')) {
      const weightMatch = line.match(/\[G\]\s*=\s*(\d+\.?\d*)/i);
      if (weightMatch) {
        filamentWeightGrams = parseFloat(weightMatch[1]);
      }
    }

    // Alternative: ; total filament weight = 123.45g
    if (trimmedLine.includes('FILAMENT WEIGHT') || trimmedLine.includes('TOTAL WEIGHT')) {
      const weightMatch = line.match(/(\d+\.?\d*)\s*G/i);
      if (weightMatch) {
        filamentWeightGrams = parseFloat(weightMatch[1]);
      }
    }
  }

  // If we have length but no weight, estimate weight
  // Assuming PLA: 1.24 g/cm³, 1.75mm filament diameter
  // Volume per mm of filament = π × (0.875)² × 1 = 2.405 mm³
  // Weight per mm = 2.405 × 1.24 / 1000 = 0.00298 g
  if (filamentLengthMm > 0 && filamentWeightGrams === 0) {
    filamentWeightGrams = filamentLengthMm * 0.00298;
  }

  return {
    printTimeHours: Math.round(printTimeHours * 100) / 100,
    filamentWeightGrams: Math.round(filamentWeightGrams * 10) / 10,
    filamentLengthMm: Math.round(filamentLengthMm * 10) / 10,
  };
};

export const parse3mf = async (file: File): Promise<GcodeData> => {
  let printTimeHours = 0;
  let filamentWeightGrams = 0;
  let filamentLengthMm = 0;

  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);
    
    console.log('3MF file contents:', Object.keys(contents.files));

    for (const [filename, zipEntry] of Object.entries(contents.files)) {
      if (zipEntry.dir) continue;
      
      const lowerFilename = filename.toLowerCase();
      console.log('Processing file:', filename);
      
      // Read all text-based files to search for metadata
      try {
        const content = await zipEntry.async('string');
        
        // Log first 500 chars for debugging
        if (content.length > 0) {
          console.log(`File ${filename} preview:`, content.substring(0, 500));
        }

        // BambuStudio/OrcaSlicer: Look for plate_X.json files with prediction data
        if (lowerFilename.endsWith('.json')) {
          try {
            const jsonData = JSON.parse(content);
            console.log('JSON data found:', JSON.stringify(jsonData).substring(0, 1000));
            
            // Check for prediction/time fields
            if (jsonData.prediction !== undefined) {
              printTimeHours = jsonData.prediction / 3600;
              console.log('Found prediction time:', printTimeHours);
            }
            if (jsonData.weight !== undefined) {
              filamentWeightGrams = jsonData.weight;
              console.log('Found weight:', filamentWeightGrams);
            }
            // BambuStudio format
            if (jsonData.filament_used_g !== undefined) {
              filamentWeightGrams = jsonData.filament_used_g;
            }
            if (jsonData.print_time !== undefined) {
              printTimeHours = jsonData.print_time / 3600;
            }
          } catch (e) {
            // Not valid JSON, continue
          }
        }

        // Look for XML metadata (PrusaSlicer style)
        if (lowerFilename.endsWith('.xml') || lowerFilename.endsWith('.config') || lowerFilename.endsWith('.model')) {
          // Extract estimated_time from XML
          const timeMatch = content.match(/estimated[_-]?time["\s:=>]+(\d+)/i) ||
                           content.match(/print[_-]?time["\s:=>]+(\d+)/i) ||
                           content.match(/<metadata\s+name="estimated_time"[^>]*>(\d+)</i);
          if (timeMatch && printTimeHours === 0) {
            printTimeHours = parseInt(timeMatch[1]) / 3600;
            console.log('Found time in XML:', printTimeHours);
          }

          // Extract filament weight
          const weightMatch = content.match(/filament[_-]?weight[_-]?total["\s:=>]+(\d+\.?\d*)/i) ||
                             content.match(/filament[_-]?used[_-]?g["\s:=>]+(\d+\.?\d*)/i) ||
                             content.match(/<metadata\s+name="filament_weight_total"[^>]*>(\d+\.?\d*)</i);
          if (weightMatch && filamentWeightGrams === 0) {
            filamentWeightGrams = parseFloat(weightMatch[1]);
            console.log('Found weight in XML:', filamentWeightGrams);
          }

          // Extract filament length
          const lengthMatch = content.match(/filament[_-]?total["\s:=>]+(\d+\.?\d*)/i) ||
                             content.match(/filament[_-]?used[_-]?mm["\s:=>]+(\d+\.?\d*)/i);
          if (lengthMatch && filamentLengthMm === 0) {
            filamentLengthMm = parseFloat(lengthMatch[1]);
            console.log('Found length in XML:', filamentLengthMm);
          }
        }

        // Check for embedded gcode
        if (lowerFilename.endsWith('.gcode')) {
          console.log('Found embedded gcode');
          const gcodeData = parseGcode(content);
          if (gcodeData.printTimeHours > 0 && printTimeHours === 0) {
            printTimeHours = gcodeData.printTimeHours;
          }
          if (gcodeData.filamentWeightGrams > 0 && filamentWeightGrams === 0) {
            filamentWeightGrams = gcodeData.filamentWeightGrams;
          }
          if (gcodeData.filamentLengthMm > 0 && filamentLengthMm === 0) {
            filamentLengthMm = gcodeData.filamentLengthMm;
          }
        }

        // Generic search in any file for common patterns
        const genericTimeMatch = content.match(/[";]estimated[_\s]?(?:printing[_\s]?)?time["\s:=]+(\d+)/i);
        if (genericTimeMatch && printTimeHours === 0) {
          printTimeHours = parseInt(genericTimeMatch[1]) / 3600;
        }

        const genericWeightMatch = content.match(/[";](?:total[_\s]?)?filament[_\s]?weight[_\s]?(?:total)?["\s:=]+(\d+\.?\d*)/i);
        if (genericWeightMatch && filamentWeightGrams === 0) {
          filamentWeightGrams = parseFloat(genericWeightMatch[1]);
        }

        // BambuStudio/OrcaSlicer specific patterns in config files
        const bambuTimeMatch = content.match(/;?\s*time[_\s]?=\s*(\d+)/i) ||
                              content.match(/prediction["\s:=]+(\d+)/i);
        if (bambuTimeMatch && printTimeHours === 0) {
          printTimeHours = parseInt(bambuTimeMatch[1]) / 3600;
        }

        const bambuWeightMatch = content.match(/;?\s*(?:filament[_\s]?)?weight["\s:=]+(\d+\.?\d*)/i);
        if (bambuWeightMatch && filamentWeightGrams === 0) {
          filamentWeightGrams = parseFloat(bambuWeightMatch[1]);
        }

      } catch (e) {
        // Binary file, skip
        console.log('Could not read file as text:', filename);
      }
    }

    // If we have length but no weight, estimate weight
    if (filamentLengthMm > 0 && filamentWeightGrams === 0) {
      filamentWeightGrams = filamentLengthMm * 0.00298;
    }

  } catch (error) {
    console.error('Error parsing 3MF file:', error);
  }

  console.log('Final extracted data:', { printTimeHours, filamentWeightGrams, filamentLengthMm });

  return {
    printTimeHours: Math.round(printTimeHours * 100) / 100,
    filamentWeightGrams: Math.round(filamentWeightGrams * 10) / 10,
    filamentLengthMm: Math.round(filamentLengthMm * 10) / 10,
  };
};
