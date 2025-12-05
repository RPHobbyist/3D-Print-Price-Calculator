import JSZip from "jszip";

// Define the data interface
export interface GcodeData {
  printTimeHours: number;
  filamentWeightGrams: number;
}

/* -----------------------------------------------------------
    PARSE RAW G-CODE TEXT (Fixed and Improved)
------------------------------------------------------------ */
export function parseGcode(content: string): GcodeData {
  let filamentWeight = 0;
  let timeHours = 0;

  // --- 1. Filament Weight Extraction ---
  const weightPatterns = [
    /total filament weight\s*\[g\]\s*[:=]\s*([\d.]+)/i,
    /total filament used\s*\[g\]\s*[:=]\s*([\d.]+)/i,
    /filament used\s*\[g\]\s*[:=]\s*([\d.]+)/i,
    /total filament used\s*[:=]\s*([\d.]+)\s*g/i,
    /filament used\s*[:=]\s*([\d.]+)\s*g/i,
  ];

  for (const pattern of weightPatterns) {
    const match = content.match(pattern);
    if (match) {
      filamentWeight = parseFloat(match[1]);
      break;
    }
  }

  // --- 2. Time String Extraction ---
  let timeString: string | null = null;
  const timePatterns = [
    // Estimated time formats (e.g., 1h 45m 30s)
    /estimated printing time\s*[:=]\s*(.+)/i,
    /estimated time\s*[:=]\s*(.+)/i,
    // Cura/PrusaSlicer seconds format
    /; *TIME:\s*(\d+)/i,
  ];

  for (const pattern of timePatterns) {
    const m = content.match(pattern);
    if (m) {
      timeString = m[1].trim();
      break;
    }
  }

  // --- 3. Time Conversion (Bug Fixed Here) ---
  if (timeString) {
    if (/^\d+$/.test(timeString)) {
      // Format: Seconds (e.g., "5400")
      timeHours = parseInt(timeString, 10) / 3600;
    } else {
      // Format: 1h 1m 13s (Using the isolated timeString, not the whole content)
      
      // Look for one or more digits followed by the unit (h, m, s)
      const hMatch = timeString.match(/(\d+)\s*h/i);
      const mMatch = timeString.match(/(\d+)\s*m/i);
      const sMatch = timeString.match(/(\d+)\s*s/i);

      const h = hMatch ? parseFloat(hMatch[1]) : 0;
      const m = mMatch ? parseFloat(mMatch[1]) : 0;
      const s = sMatch ? parseFloat(sMatch[1]) : 0;

      // Convert all to hours
      timeHours = h + m / 60 + s / 3600;
    }
  }

  return {
    printTimeHours: timeHours || 0,
    filamentWeightGrams: filamentWeight || 0,
  };
}

// --- Assuming 'File' is available in your environment ---

/* -----------------------------------------------------------
    PARSE 3MF (Logic remains sound, requires JSZip/File for execution)
------------------------------------------------------------ */
export async function parse3mf(file: File): Promise<GcodeData> {
  // Use JSZip to load the file data
  const zip = await JSZip.loadAsync(file);

  // Find the G-code file path, common in PrusaSlicer/Bambu Studio 3MFs
  const gcodePath = Object.keys(zip.files).find(
    (p) => p.startsWith("Metadata/") && p.endsWith(".gcode")
  );

  if (!gcodePath) {
    return { printTimeHours: 0, filamentWeightGrams: 0 };
  }

  // Read the G-code text content from the zip
  const gcodeText = await zip.files[gcodePath].async("string");

  // Reuse the parser function
  return parseGcode(gcodeText);
}
