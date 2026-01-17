import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileBox, Loader2, CheckCircle2 } from "lucide-react";
import { parse3mf } from "@/lib/parsers/gcodeParser";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SurfaceAreaUploadProps {
    onSurfaceAreaDetected: (areaMm2: number) => void;
    className?: string;
}

export const SurfaceAreaUpload = ({ onSurfaceAreaDetected, className }: SurfaceAreaUploadProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [lastUploadedFile, setLastUploadedFile] = useState<string | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate extension
        if (!file.name.toLowerCase().endsWith('.3mf')) {
            toast.error("Please upload a valid .3mf file");
            return;
        }

        setIsLoading(true);

        try {
            const data = await parse3mf(file);

            if (data.surfaceAreaMm2 && data.surfaceAreaMm2 > 0) {
                onSurfaceAreaDetected(data.surfaceAreaMm2);
                setLastUploadedFile(file.name);
                toast.success(`Extracted surface area: ${(data.surfaceAreaMm2 / 100).toFixed(2)} cm²`);
            } else {
                // More descriptive error
                if (data.printTimeHours > 0 || data.filamentWeightGrams > 0) {
                    toast.warning("Parsed 3MF metadata but could not find 3D model geometry for surface area.");
                } else {
                    toast.error("Could not read surface area. Ensure this is a valid 3MF containing a 3D model.");
                }
            }
        } catch (error) {
            console.error('Error parsing 3MF for surface area:', error);
            toast.error("Failed to parse 3MF file");
        } finally {
            setIsLoading(false);
            // Reset input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className={cn("", className)}>
            <input
                ref={fileInputRef}
                type="file"
                accept=".3mf"
                onChange={handleFileChange}
                className="hidden"
                disabled={isLoading}
            />

            <div className="flex items-center gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="h-8 gap-2 border-dashed"
                >
                    {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                        <Upload className="w-3.5 h-3.5" />
                    )}
                    <span className="text-xs">Upload 3MF</span>
                </Button>

            </div>
        </div>
    );
};
