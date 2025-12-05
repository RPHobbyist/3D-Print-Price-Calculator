import JSZip from "jszip";

export interface GcodeData {
  printTimeHours: number;
  filamentWeightGrams: number;
}

/* -----------------------------------------------------------
   PARSE RAW G-CODE TEXT (Your original function improved)
------------------------------------------------------------ */
export function parseGcode(content: string): GcodeData {
  let filamentWeight = 0;
  let timeHours = 0;

  // --- FIXED: supports your actual file format ---
  const weightPatterns = [
    /total filament weight\s*\[g\]\s*[:=]\s*([\d.]+)/i,
    /total filament used\s*\[g\]\s*[:=]\s*([\d.]+)/i,
    /filament used\s*\[g\]\s*[:=]\s*([\d.]+)/i,
    /total filament used\s*[:=]\s*([\d.]+)\s*g/i,
    /filament used\s*[:=]\s*([\d.]+)\s*g/i
  ];

  for (const pattern of weightPatterns) {
    const match = content.match(pattern);
    if (match) {
      filamentWeight = parseFloat(match[1]);
      break;
    }
  }

  // --- FIXED: time extraction more robust ---
  let timeString: string | null = null;
  const timePatterns = [
    /estimated printing time\s*[:=]\s*(.+)/i,
    /estimated time\s*[:=]\s*(.+)/i,
    /; *TIME:\s*(\d+)/i // Cura seconds
  ];

  for (const pattern of timePatterns) {
    const m = content.match(pattern);
    if (m) {
      timeString = m[1].trim();
      break;
    }
  }

  if (timeString) {
    if (/^\d+$/.test(timeString)) {
      // Cura seconds format
      timeHours = parseInt(timeString, 10) / 3600;
    } else {
      // Format: 1h 1m 13s
      const h = content.match(/(\d+)h/);
      const m = content.match(/(\d+)m/);
      const s = content.match(/(\d+)s/);

      timeHours =
        (h ? parseFloat(h[1]) : 0) +
        (m ? parseFloat(m[1]) / 60 : 0) +
        (s ? parseFloat(s[1]) / 3600 : 0);
    }
  }

  return {
    printTimeHours: timeHours || 0,
    filamentWeightGrams: filamentWeight || 0
  };
}

/* -----------------------------------------------------------
   PARSE 3MF (Your original logic but fixed + supports .Gcode.3mf)
------------------------------------------------------------ */
export async function parse3mf(file: File): Promise<GcodeData> {
  const zip = await JSZip.loadAsync(file);

  // --- FIXED: correctly find gcode inside Metadata/ ---
  const gcodePath = Object.keys(zip.files).find(
    (p) => p.startsWith("Metadata/") && p.endsWith(".gcode")
  );

  if (!gcodePath) {
    return { printTimeHours: 0, filamentWeightGrams: 0 };
  }

  // --- read gcode text ---
  const gcodeText = await zip.files[gcodePath].async("string");

  // --- reuse your original parser ---
  return parseGcode(gcodeText);
}
