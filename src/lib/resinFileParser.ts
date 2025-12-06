// Resin file parser for .cxdlpv4 and other resin printer formats

export interface ResinFileData {
  printTimeHours: number;
  resinVolumeMl: number;
  layerCount?: number;
  printerModel?: string;
}

/**
 * Parse .cxdlpv4 file (Creality Halot resin printer format)
 * This is a binary format with header containing print metadata
 * 
 * Header structure (based on reverse engineering):
 * - Magic bytes at start: "CXSW3DV2" or similar
 * - Print time in seconds at various offsets
 * - Volume in mm³ or ml
 * - Layer information
 */
export async function parseCxdlpv4(file: File): Promise<ResinFileData> {
  try {
    const buffer = await file.arrayBuffer();
    const dataView = new DataView(buffer);
    const uint8Array = new Uint8Array(buffer);
    
    console.log('File size:', buffer.byteLength);
    
    // Read magic bytes to identify file version
    const magicBytes = String.fromCharCode(...uint8Array.slice(0, 8));
    console.log('Magic bytes:', magicBytes);
    
    let printTimeSeconds = 0;
    let resinVolumeMl = 0;
    let layerCount = 0;
    let printerModel = '';

    // CXDLP v4 format header offsets (based on format analysis)
    // The format typically has:
    // - Magic header (8 bytes)
    // - Version info
    // - Print parameters at known offsets
    
    // Try to find print time (usually stored as float or uint32 in seconds)
    // Common offsets for different versions: 0x3C, 0x40, 0x44, 0x48
    const timeOffsets = [0x3C, 0x40, 0x44, 0x48, 0x4C, 0x50, 0x54, 0x58, 0x5C, 0x60];
    
    for (const offset of timeOffsets) {
      if (offset + 4 <= buffer.byteLength) {
        // Try as float (little-endian)
        const floatVal = dataView.getFloat32(offset, true);
        // Print time should be reasonable (1 minute to 100 hours)
        if (floatVal >= 60 && floatVal <= 360000) {
          printTimeSeconds = floatVal;
          console.log(`Found potential print time at offset 0x${offset.toString(16)}:`, floatVal, 'seconds');
          break;
        }
        
        // Try as uint32
        const uint32Val = dataView.getUint32(offset, true);
        if (uint32Val >= 60 && uint32Val <= 360000) {
          printTimeSeconds = uint32Val;
          console.log(`Found potential print time (uint32) at offset 0x${offset.toString(16)}:`, uint32Val, 'seconds');
          break;
        }
      }
    }

    // Volume offsets (in ml or mm³)
    const volumeOffsets = [0x64, 0x68, 0x6C, 0x70, 0x74, 0x78, 0x7C, 0x80];
    
    for (const offset of volumeOffsets) {
      if (offset + 4 <= buffer.byteLength) {
        const floatVal = dataView.getFloat32(offset, true);
        // Volume should be reasonable (0.1ml to 5000ml)
        if (floatVal >= 0.1 && floatVal <= 5000) {
          resinVolumeMl = floatVal;
          console.log(`Found potential volume at offset 0x${offset.toString(16)}:`, floatVal, 'ml');
          break;
        }
      }
    }

    // Layer count (usually uint32)
    const layerOffsets = [0x24, 0x28, 0x2C, 0x30, 0x34, 0x38];
    
    for (const offset of layerOffsets) {
      if (offset + 4 <= buffer.byteLength) {
        const uint32Val = dataView.getUint32(offset, true);
        // Layer count should be reasonable (1 to 10000)
        if (uint32Val >= 1 && uint32Val <= 10000) {
          layerCount = uint32Val;
          console.log(`Found potential layer count at offset 0x${offset.toString(16)}:`, uint32Val);
          break;
        }
      }
    }

    // Alternative approach: scan for recognizable patterns
    // Look for a sequence that looks like timing data
    if (printTimeSeconds === 0 || resinVolumeMl === 0) {
      console.log('Scanning file for patterns...');
      
      for (let i = 0; i < Math.min(buffer.byteLength - 4, 512); i += 4) {
        const floatVal = dataView.getFloat32(i, true);
        
        // Look for print time (in seconds, 1min to 100hrs)
        if (printTimeSeconds === 0 && floatVal >= 60 && floatVal <= 360000 && Number.isFinite(floatVal)) {
          // Verify it's not a position coordinate (those are usually smaller)
          const prevVal = i >= 4 ? dataView.getFloat32(i - 4, true) : 0;
          const nextVal = i + 8 <= buffer.byteLength ? dataView.getFloat32(i + 4, true) : 0;
          
          // Print time usually stands alone, not near other similar values
          if (Math.abs(prevVal - floatVal) > 100 || Math.abs(nextVal - floatVal) > 100) {
            printTimeSeconds = floatVal;
            console.log(`Pattern scan - print time at offset ${i}:`, floatVal);
          }
        }
        
        // Look for volume (in ml, 0.1 to 1000)
        if (resinVolumeMl === 0 && floatVal >= 0.1 && floatVal <= 1000 && Number.isFinite(floatVal)) {
          // Volume values are typically stored near print time
          if (printTimeSeconds > 0 && Math.abs(i - 0x60) < 0x40) {
            resinVolumeMl = floatVal;
            console.log(`Pattern scan - volume at offset ${i}:`, floatVal);
          }
        }
      }
    }

    // Try to extract printer model from text region (if any)
    // Some formats include ASCII strings for printer name
    const textDecoder = new TextDecoder('ascii');
    const headerText = textDecoder.decode(uint8Array.slice(0, Math.min(512, buffer.byteLength)));
    
    // Look for common printer model patterns
    const printerPatterns = [
      /HALOT[- ]?(MAGE|ONE|SKY|RAY|MAX|LITE)[- ]?(\d*K?)?(\s*PRO)?/i,
      /CREALITY[- ]?([\w\s]+)/i,
      /ELEGOO[- ]?([\w\s]+)/i,
      /ANYCUBIC[- ]?([\w\s]+)/i,
    ];
    
    for (const pattern of printerPatterns) {
      const match = headerText.match(pattern);
      if (match) {
        printerModel = match[0].replace(/\0/g, '').trim();
        console.log('Found printer model:', printerModel);
        break;
      }
    }

    const result: ResinFileData = {
      printTimeHours: Math.round((printTimeSeconds / 3600) * 100) / 100,
      resinVolumeMl: Math.round(resinVolumeMl * 10) / 10,
      layerCount: layerCount > 0 ? layerCount : undefined,
      printerModel: printerModel || undefined,
    };

    console.log('CXDLPV4 parse result:', result);
    return result;

  } catch (error) {
    console.error('Error parsing cxdlpv4 file:', error);
    return { printTimeHours: 0, resinVolumeMl: 0 };
  }
}

/**
 * Main parser function that routes to the appropriate parser based on file extension
 */
export async function parseResinFile(file: File): Promise<ResinFileData> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.cxdlpv4')) {
    return parseCxdlpv4(file);
  }
  
  // Add more format support here as needed
  // e.g., .ctb, .cbddlp, .photon, etc.
  
  console.warn('Unsupported resin file format:', fileName);
  return { printTimeHours: 0, resinVolumeMl: 0 };
}
