// G-code and 3MF parser utility to extract print time and filament usage
import JSZip from 'jszip';

export interface GcodeData {
  printTimeHours: number;
  filamentWeightGrams: number;
  filamentLengthMm?: number;
}

/**
 * Parse raw G-code text content to extract print time and filament weight
 */
export function parseGcode(content: string): GcodeData {
  let filamentWeight = 0;
  let timeHours = 0;
  let filamentLengthMm = 0;

  // --- Filament weight patterns (supports various slicer formats) ---
  const weightPatterns = [
    /total filament weight\s*\[g\]\s*[:=]\s*([\d.]+)/i,
    /total filament used\s*\[g\]\s*[:=]\s*([\d.]+)/i,
    /filament used\s*\[g\]\s*[:=]\s*([\d.]+)/i,
    /total filament used\s*[:=]\s*([\d.]+)\s*g/i,
    /filament used\s*[:=]\s*([\d.]+)\s*g/i,
    /;\s*filament\s*used\s*\[g\]\s*=\s*([\d.]+)/i,
    /;\s*total\s*filament\s*weight\s*=\s*([\d.]+)/i,
  ];

  for (const pattern of weightPatterns) {
    const match = content.match(pattern);
    if (match) {
      filamentWeight = parseFloat(match[1]);
      break;
    }
  }

  // --- Filament length patterns ---
  const lengthPatterns = [
    /filament used\s*\[mm\]\s*=\s*([\d.]+)/i,
    /filament\s*used\s*[:=]\s*([\d.]+)\s*m(?!m)/i, // meters
    /filament\s*used\s*[:=]\s*([\d.]+)\s*mm/i,
  ];

  for (const pattern of lengthPatterns) {
    const match = content.match(pattern);
    if (match) {
      const value = parseFloat(match[1]);
      // Check if it's meters (convert to mm) or already mm
      if (pattern.source.includes('m(?!m)')) {
        filamentLengthMm = value * 1000;
      } else {
        filamentLengthMm = value;
      }
      break;
    }
  }

  // --- Time extraction ---
  let timeString: string | null = null;
  const timePatterns = [
    /estimated printing time\s*(?:\(normal mode\))?\s*[:=]\s*(.+)/i,
    /estimated time\s*[:=]\s*(.+)/i,
    /;\s*TIME:\s*(\d+)/i, // Cura seconds format
    /print time\s*[:=]\s*(.+)/i,
  ];

  for (const pattern of timePatterns) {
    const m = content.match(pattern);
    if (m) {
      timeString = m[1].trim();
      break;
    }
  }

  if (timeString) {
    // Pure seconds format (Cura)
    if (/^\d+$/.test(timeString)) {
      timeHours = parseInt(timeString, 10) / 3600;
    } else {
      // Format: 1h 1m 13s or 1h 1m or similar
      const h = timeString.match(/(\d+)\s*h/i);
      const m = timeString.match(/(\d+)\s*m(?!s)/i);
      const s = timeString.match(/(\d+)\s*s/i);
      const d = timeString.match(/(\d+)\s*d/i);

      timeHours =
        (d ? parseFloat(d[1]) * 24 : 0) +
        (h ? parseFloat(h[1]) : 0) +
        (m ? parseFloat(m[1]) / 60 : 0) +
        (s ? parseFloat(s[1]) / 3600 : 0);
    }
  }

  // If we have length but no weight, estimate weight
  // Assuming PLA: 1.24 g/cm³, 1.75mm filament diameter
  if (filamentLengthMm > 0 && filamentWeight === 0) {
    filamentWeight = filamentLengthMm * 0.00298;
  }

  return {
    printTimeHours: Math.round((timeHours || 0) * 100) / 100,
    filamentWeightGrams: Math.round((filamentWeight || 0) * 10) / 10,
    filamentLengthMm: Math.round(filamentLengthMm * 10) / 10,
  };
}

/**
 * Parse 3MF file (ZIP archive) to extract print data
 * Specifically looks for G-code files inside the Metadata folder
 */
export async function parse3mf(file: File): Promise<GcodeData> {
  try {
    const zip = await JSZip.loadAsync(file);
    const fileNames = Object.keys(zip.files);
    
    console.log('3MF archive contents:', fileNames);

    // Step 1: Look for G-code file inside Metadata folder
    const gcodePath = fileNames.find(
      (path) => path.toLowerCase().startsWith('metadata/') && path.toLowerCase().endsWith('.gcode')
    );

    if (gcodePath) {
      console.log('Found G-code in Metadata folder:', gcodePath);
      const gcodeText = await zip.files[gcodePath].async('string');
      const result = parseGcode(gcodeText);
      console.log('Extracted from G-code:', result);
      return result;
    }

    // Step 2: Look for any .gcode file anywhere in the archive
    const anyGcodePath = fileNames.find((path) => path.toLowerCase().endsWith('.gcode'));
    
    if (anyGcodePath) {
      console.log('Found G-code file:', anyGcodePath);
      const gcodeText = await zip.files[anyGcodePath].async('string');
      const result = parseGcode(gcodeText);
      console.log('Extracted from G-code:', result);
      return result;
    }

    // Step 3: Fallback - search JSON files for metadata (BambuStudio/OrcaSlicer)
    let printTimeHours = 0;
    let filamentWeightGrams = 0;

    for (const filename of fileNames) {
      if (zip.files[filename].dir) continue;
      
      const lowerFilename = filename.toLowerCase();
      
      // Check JSON files (plate_X.json, etc.)
      if (lowerFilename.endsWith('.json')) {
        try {
          const content = await zip.files[filename].async('string');
          const jsonData = JSON.parse(content);
          
          // BambuStudio/OrcaSlicer format
          if (jsonData.prediction !== undefined && printTimeHours === 0) {
            printTimeHours = jsonData.prediction / 3600;
          }
          if (jsonData.weight !== undefined && filamentWeightGrams === 0) {
            filamentWeightGrams = jsonData.weight;
          }
          if (jsonData.filament_used_g !== undefined && filamentWeightGrams === 0) {
            filamentWeightGrams = jsonData.filament_used_g;
          }
          if (jsonData.print_time !== undefined && printTimeHours === 0) {
            printTimeHours = jsonData.print_time / 3600;
          }
        } catch {
          // Not valid JSON, continue
        }
      }

      // Check XML files for metadata
      if (lowerFilename.endsWith('.xml') || lowerFilename.endsWith('.config')) {
        try {
          const content = await zip.files[filename].async('string');
          
          const timeMatch = content.match(/estimated[_-]?time["\s:=>]+(\d+)/i);
          if (timeMatch && printTimeHours === 0) {
            printTimeHours = parseInt(timeMatch[1]) / 3600;
          }

          const weightMatch = content.match(/filament[_-]?weight[_-]?total["\s:=>]+(\d+\.?\d*)/i);
          if (weightMatch && filamentWeightGrams === 0) {
            filamentWeightGrams = parseFloat(weightMatch[1]);
          }
        } catch {
          // Could not read file
        }
      }
    }

    console.log('Fallback extraction result:', { printTimeHours, filamentWeightGrams });

    return {
      printTimeHours: Math.round(printTimeHours * 100) / 100,
      filamentWeightGrams: Math.round(filamentWeightGrams * 10) / 10,
    };

  } catch (error) {
    console.error('Error parsing 3MF file:', error);
    return { printTimeHours: 0, filamentWeightGrams: 0 };
  }
}
