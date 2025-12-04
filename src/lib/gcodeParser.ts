// G-code parser utility to extract print time and filament usage

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
