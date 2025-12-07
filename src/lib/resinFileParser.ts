// Resin file parser for .cxdlpv4 and other resin printer formats

export interface ResinFileData {
  printTimeHours: number;
  resinVolumeMl: number;
  layerCount?: number;
  printerModel?: string;
}

/**
 * Read a null-terminated string with a Big Endian length prefix
 */
function readNullTerminatedString(dataView: DataView, offset: number): { value: string; bytesRead: number } {
  // Read the length (4 bytes, Big Endian)
  const length = dataView.getUint32(offset, false);
  
  if (length === 0 || length > 256) {
    return { value: '', bytesRead: 4 };
  }
  
  const bytes = new Uint8Array(dataView.buffer, offset + 4, length);
  let str = '';
  for (let i = 0; i < bytes.length; i++) {
    if (bytes[i] === 0) break;
    str += String.fromCharCode(bytes[i]);
  }
  
  return { value: str, bytesRead: 4 + length };
}

/**
 * Parse .cxdlpv4 file (Creality Halot resin printer format)
 * Based on UVtools CrealityCXDLPv4File.cs format specification
 * 
 * Header structure:
 * - MagicSize (4 bytes, Big Endian)
 * - Magic (9 bytes) - "CXSW3DV2"
 * - Version (2 bytes, Big Endian)
 * - PrinterModel (null-terminated string with Big Endian length prefix)
 * - ResolutionX (2 bytes)
 * - ResolutionY (2 bytes)
 * - BedSizeX/Y/Z (3 floats)
 * - PrintHeight (float)
 * - LayerHeight (float)
 * - BottomLayersCount (4 bytes)
 * - PreviewSmallOffsetAddress (4 bytes)
 * - LayersDefinitionOffsetAddress (4 bytes)
 * - LayerCount (4 bytes)
 * - PreviewLargeOffsetAddress (4 bytes)
 * - PrintTime (4 bytes) - seconds
 * - ... more fields
 * 
 * PrintParameters section (at PrintParametersOffsetAddress):
 * - Various lift/speed settings
 * - VolumeMl (float) at offset 20 within the section
 */
export async function parseCxdlpv4(file: File): Promise<ResinFileData> {
  try {
    const buffer = await file.arrayBuffer();
    const dataView = new DataView(buffer);
    
    console.log('File size:', buffer.byteLength);
    
    let offset = 0;
    
    // Read magic size (4 bytes, Big Endian)
    const magicSize = dataView.getUint32(offset, false);
    offset += 4;
    console.log('Magic size:', magicSize);
    
    // Read magic string
    const magicBytes = new Uint8Array(buffer, offset, magicSize);
    const magic = String.fromCharCode(...magicBytes).replace(/\0/g, '');
    offset += magicSize;
    console.log('Magic:', magic);
    
    // Validate magic
    if (!magic.startsWith('CXSW3D')) {
      console.warn('Invalid magic, trying alternative parsing...');
      return parseGenericBinary(buffer);
    }
    
    // Read version (2 bytes, Big Endian)
    const version = dataView.getUint16(offset, false);
    offset += 2;
    console.log('Version:', version);
    
    // Read printer model (null-terminated string with length prefix)
    const printerModelResult = readNullTerminatedString(dataView, offset);
    const printerModel = printerModelResult.value;
    offset += printerModelResult.bytesRead;
    console.log('Printer model:', printerModel);
    
    // Read ResolutionX and ResolutionY (2 bytes each)
    const resolutionX = dataView.getUint16(offset, true);
    offset += 2;
    const resolutionY = dataView.getUint16(offset, true);
    offset += 2;
    console.log('Resolution:', resolutionX, 'x', resolutionY);
    
    // Read BedSizeX, BedSizeY, BedSizeZ (3 floats, 4 bytes each)
    const bedSizeX = dataView.getFloat32(offset, true);
    offset += 4;
    const bedSizeY = dataView.getFloat32(offset, true);
    offset += 4;
    const bedSizeZ = dataView.getFloat32(offset, true);
    offset += 4;
    console.log('Bed size:', bedSizeX, bedSizeY, bedSizeZ);
    
    // Read PrintHeight (float)
    const printHeight = dataView.getFloat32(offset, true);
    offset += 4;
    console.log('Print height:', printHeight);
    
    // Read LayerHeight (float)
    const layerHeight = dataView.getFloat32(offset, true);
    offset += 4;
    console.log('Layer height:', layerHeight);
    
    // Read BottomLayersCount (4 bytes)
    const bottomLayersCount = dataView.getUint32(offset, true);
    offset += 4;
    console.log('Bottom layers:', bottomLayersCount);
    
    // Read PreviewSmallOffsetAddress (4 bytes)
    const previewSmallOffset = dataView.getUint32(offset, true);
    offset += 4;
    
    // Read LayersDefinitionOffsetAddress (4 bytes)
    const layersDefOffset = dataView.getUint32(offset, true);
    offset += 4;
    
    // Read LayerCount (4 bytes)
    const layerCount = dataView.getUint32(offset, true);
    offset += 4;
    console.log('Layer count:', layerCount);
    
    // Read PreviewLargeOffsetAddress (4 bytes)
    const previewLargeOffset = dataView.getUint32(offset, true);
    offset += 4;
    
    // Read PrintTime (4 bytes) - in seconds
    const printTimeSeconds = dataView.getUint32(offset, true);
    offset += 4;
    console.log('Print time (seconds):', printTimeSeconds);
    
    // Skip ProjectorType (4 bytes)
    offset += 4;
    
    // Read PrintParametersOffsetAddress (4 bytes)
    const printParamsOffset = dataView.getUint32(offset, true);
    offset += 4;
    console.log('Print params offset:', printParamsOffset);
    
    // Read VolumeMl from PrintParameters section
    // VolumeMl is at offset 20 within PrintParameters (after 5 floats)
    let volumeMl = 0;
    if (printParamsOffset > 0 && printParamsOffset + 24 < buffer.byteLength) {
      // Skip first 5 floats (BottomLiftHeight, BottomLiftSpeed, LiftHeight, LiftSpeed, RetractSpeed)
      volumeMl = dataView.getFloat32(printParamsOffset + 20, true);
      console.log('Volume (ml):', volumeMl);
    }
    
    // Validate and return
    const printTimeHours = printTimeSeconds > 0 && printTimeSeconds < 360000 
      ? Math.round((printTimeSeconds / 3600) * 100) / 100 
      : 0;
    
    const validVolume = volumeMl > 0 && volumeMl < 10000 
      ? Math.round(volumeMl * 10) / 10 
      : 0;
    
    const result: ResinFileData = {
      printTimeHours,
      resinVolumeMl: validVolume,
      layerCount: layerCount > 0 && layerCount < 100000 ? layerCount : undefined,
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
 * Fallback parser for files that don't match expected format
 */
function parseGenericBinary(buffer: ArrayBuffer): ResinFileData {
  const dataView = new DataView(buffer);
  const uint8Array = new Uint8Array(buffer);
  
  let printTimeSeconds = 0;
  let resinVolumeMl = 0;
  let layerCount = 0;
  let printerModel = '';

  // Scan header for text patterns (printer model)
  const textDecoder = new TextDecoder('ascii');
  const headerText = textDecoder.decode(uint8Array.slice(0, Math.min(512, buffer.byteLength)));
  
  const printerPatterns = [
    /HALOT[- ]?(MAGE|ONE|SKY|RAY|MAX|LITE)[- ]?(\d*K?)?(\s*PRO)?/i,
    /CL-\d+[A-Z]*/i,
  ];
  
  for (const pattern of printerPatterns) {
    const match = headerText.match(pattern);
    if (match) {
      printerModel = match[0].replace(/\0/g, '').trim();
      break;
    }
  }

  // Scan for reasonable numeric values
  for (let i = 0; i < Math.min(buffer.byteLength - 4, 1024); i += 4) {
    const uint32Val = dataView.getUint32(i, true);
    const floatVal = dataView.getFloat32(i, true);
    
    // Look for print time (60 seconds to 100 hours)
    if (printTimeSeconds === 0 && uint32Val >= 60 && uint32Val <= 360000) {
      printTimeSeconds = uint32Val;
    }
    
    // Look for layer count (10 to 50000)
    if (layerCount === 0 && uint32Val >= 10 && uint32Val <= 50000) {
      layerCount = uint32Val;
    }
    
    // Look for volume (0.1ml to 5000ml as float)
    if (resinVolumeMl === 0 && Number.isFinite(floatVal) && floatVal >= 0.1 && floatVal <= 5000) {
      resinVolumeMl = floatVal;
    }
  }

  return {
    printTimeHours: Math.round((printTimeSeconds / 3600) * 100) / 100,
    resinVolumeMl: Math.round(resinVolumeMl * 10) / 10,
    layerCount: layerCount > 0 ? layerCount : undefined,
    printerModel: printerModel || undefined,
  };
}

/**
 * Main parser function that routes to the appropriate parser based on file extension
 */
export async function parseResinFile(file: File): Promise<ResinFileData> {
  const fileName = file.name.toLowerCase();
  
  if (fileName.endsWith('.cxdlpv4')) {
    return parseCxdlpv4(file);
  }
  
  console.warn('Unsupported resin file format:', fileName);
  return { printTimeHours: 0, resinVolumeMl: 0 };
}