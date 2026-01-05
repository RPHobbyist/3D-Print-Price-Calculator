import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { RefreshCw, Timer, Weight } from "lucide-react";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PrintJobDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    job: any; // Type strictly if possible
    machines: any[];
    connections: any;
    onSend: (machineId: string, fileOrPath: any, options: any) => Promise<void>;
}

export function PrintJobDialog({
    open,
    onOpenChange,
    job,
    machines,
    connections,
    onSend,
}: PrintJobDialogProps) {
    const [selectedMachineId, setSelectedMachineId] = useState<string>("");
    const [isSending, setIsSending] = useState(false);

    // Print Options State
    const [options, setOptions] = useState({
        timelapse: true,
        bedLeveling: true,
        flowCalibration: true,
        useAms: true,
    });

    // Filter only connected machines
    const connectedMachines = machines.filter(
        (m) =>
            connections[m.dev_id]?.status === "connected"
    );

    const handleSend = async () => {
        if (!selectedMachineId) {
            toast.error("Please select a printer");
            return;
        }

        setIsSending(true);
        try {
            // Use the job's quote file path or similar
            // We assume job.quote has the necessary file info.
            // If the job object structure is known, use it.
            // job.quote.filePath might be needed?
            // Or we pass the file object if this was from a drag event?

            // Assuming job object has what we need or we pass it in.
            // For now, let's assume `job.file` or `job.quote.filePath` is available.
            // If not, we might need adjustments.

            const fileToPrint = job.file || job.quote?.filePath; // Adjust based on actual data

            if (!fileToPrint) {
                toast.error("No file found for this job");
                return;
            }

            await onSend(selectedMachineId, fileToPrint, options);
            onOpenChange(false);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSending(false);
        }
    };

    if (!job) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-green-500 rounded-sm" /> {/* Icon placeholder */}
                        Send to Printer storage
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-6 py-4">
                    {/* Thumbnail / Image Area */}
                    <div className="flex justify-center">
                        {/* Thumbnail if available, or placeholder */}
                        {job.quote?.thumbnail ? (
                            <img src={job.quote.thumbnail} alt="Thumbnail" className="w-48 h-48 object-contain" />
                        ) : (
                            <div className="w-48 h-48 bg-muted flex items-center justify-center rounded-lg text-muted-foreground">
                                No Preview
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex justify-center gap-12 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <Timer className="w-4 h-4" />
                            <span>{job.quote?.printTime || "0h 0m"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Weight className="w-4 h-4" />
                  //  Display grams if available
                            <span>{job.quote?.materialWeight || "0"} g</span>
                        </div>
                    </div>

                    <div className="text-center font-medium">
                        {job.customerName || job.id} { /* Or Job Name */}
                    </div>



                    {/* Printer Selection */}
                    <div className="flex items-center gap-2">
                        <span className="font-medium whitespace-nowrap w-16">Printer</span>
                        <Select value={selectedMachineId} onValueChange={setSelectedMachineId}>
                            <SelectTrigger className="flex-1">
                                <SelectValue placeholder="Select Printer" />
                            </SelectTrigger>
                            <SelectContent>
                                {connectedMachines.length === 0 ? (
                                    <SelectItem value="none" disabled>No printers connected</SelectItem>
                                ) : (
                                    connectedMachines.map((m) => (
                                        <SelectItem key={m.id} value={m.id}>
                                            {m.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" size="icon" className="shrink-0" onClick={() => { /* Refresh logic? */ }}>
                            <RefreshCw className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <DialogFooter className="sm:justify-between">
                    <div /> {/* Spacer */}
                    <Button
                        onClick={handleSend}
                        disabled={!selectedMachineId || isSending}
                        className="bg-green-600 hover:bg-green-700 text-white min-w-[100px]"
                    >
                        {isSending ? "Sending..." : "Send"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
