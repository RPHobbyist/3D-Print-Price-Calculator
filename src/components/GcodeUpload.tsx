import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileCode, Loader2 } from "lucide-react";
import { ThumbnailPreview } from "./shared/ThumbnailPreview";
import { stripFileExtension } from "@/lib/utils";
import { parseGcode, parse3mf, GcodeData } from "@/lib/gcodeParser";
import { toast } from "sonner";

interface GcodeUploadProps {
  onDataExtracted: (data: GcodeData) => void;
}

const GcodeUpload = ({ onDataExtracted }: GcodeUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  /**
   * Handles file selection from the input.
   * Validates extension, parses content, and extracts thumbnail.
   */
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    const validExtensions = ['.gcode', '.gco', '.g', '.3mf'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      toast.error("Please upload a valid file (.gcode, .gco, .g, or .3mf)");
      return;
    }

    setIsLoading(true);

    try {
      let data: GcodeData;

      if (fileExtension === '.3mf') {
        // Parse 3MF file (ZIP archive with XML metadata)
        data = await parse3mf(file);
      } else {
        // Parse G-code file
        const content = await file.text();
        data = parseGcode(content);
      }

      if (data.printTimeHours === 0 && data.filamentWeightGrams === 0) {
        toast.warning("Could not extract data from file. Please enter values manually.");
        return;
      }

      // Strip the extension (e.g. .gcode) so the UI shows a clean Project Name
      const cleanName = stripFileExtension(file.name);
      // Get file path from Electron (File object has .path property in Electron)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filePath = (file as any).path || '';
      console.log('📁 GcodeUpload - File path extracted:', filePath);
      console.log('📁 GcodeUpload - File name:', file.name);
      onDataExtracted({ ...data, fileName: cleanName, filePath });

      // Update local preview state if a thumbnail was found
      if (data.thumbnail) {
        setPreviewImage(data.thumbnail);
      } else {
        setPreviewImage(null);
      }

      const extractedInfo = [];
      if (data.printTimeHours > 0) extractedInfo.push(`Print Time: ${data.printTimeHours}h`);
      if (data.filamentWeightGrams > 0) extractedInfo.push(`Filament: ${data.filamentWeightGrams}g`);
      if (data.printerModel) extractedInfo.push(`Printer: ${data.printerModel}`);

      toast.success(`Extracted: ${extractedInfo.join(', ')}`);
    } catch (error) {
      console.error('File parsing error:', error);
      toast.error("Failed to parse file");
    } finally {
      setIsLoading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".gcode,.gco,.g,.3mf"
        onChange={handleFileChange}
        className="hidden"
        disabled={isLoading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="flex items-center gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <FileCode className="w-4 h-4" />
          </>
        )}
        {isLoading ? 'Parsing...' : 'Upload G-code / 3MF'}
      </Button>

      <ThumbnailPreview src={previewImage || ""} className="ml-2" />
    </div>
  );
};

export default GcodeUpload;
