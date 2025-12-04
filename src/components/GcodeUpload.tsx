import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileCode } from "lucide-react";
import { parseGcode, GcodeData } from "@/lib/gcodeParser";
import { toast } from "sonner";

interface GcodeUploadProps {
  onDataExtracted: (data: GcodeData) => void;
}

const GcodeUpload = ({ onDataExtracted }: GcodeUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file extension
    const validExtensions = ['.gcode', '.gco', '.g'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast.error("Please upload a valid G-code file (.gcode, .gco, .g)");
      return;
    }

    try {
      const content = await file.text();
      const data = parseGcode(content);

      if (data.printTimeHours === 0 && data.filamentWeightGrams === 0) {
        toast.warning("Could not extract data from G-code. Please enter values manually.");
        return;
      }

      onDataExtracted(data);
      
      const extractedInfo = [];
      if (data.printTimeHours > 0) extractedInfo.push(`Print Time: ${data.printTimeHours}h`);
      if (data.filamentWeightGrams > 0) extractedInfo.push(`Filament: ${data.filamentWeightGrams}g`);
      
      toast.success(`Extracted: ${extractedInfo.join(', ')}`);
    } catch (error) {
      toast.error("Failed to parse G-code file");
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".gcode,.gco,.g"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="flex items-center gap-2 border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-all"
      >
        <Upload className="w-4 h-4" />
        <FileCode className="w-4 h-4" />
        Upload G-code
      </Button>
    </div>
  );
};

export default GcodeUpload;