import { useMemo, useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { useProduction } from "@/contexts/ProductionContext";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import {
    Filter,
    ArrowLeft
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { JobCard } from "@/components/print-management/JobCard";
import { KanbanColumn } from "@/components/print-management/KanbanColumn";
import { PrinterConnectDialog } from "@/components/print-management/PrinterConnectDialog";
import { PrintJobDialog } from "@/components/print-management/PrintJobDialog";

const PrintManagement = () => {
    const navigate = useNavigate();
    const { machines: fdmMachines } = useCalculatorData({ printType: 'FDM' });
    const { machines: resinMachines } = useCalculatorData({ printType: 'Resin' });

    const machines = useMemo(() => {
        return [...fdmMachines, ...resinMachines];
    }, [fdmMachines, resinMachines]);

    // Local Storage for visible machines
    const [visibleMachineIds, setVisibleMachineIds] = useState<string[]>(() => {
        const stored = localStorage.getItem('print_mgmt_visible_machines');
        if (stored) return JSON.parse(stored);
        // Default: Show all if none stored, or maybe none? Let's default to all.
        return [];
    });

    // Update visible IDs when machines load if empty (bootstrap)
    useEffect(() => {
        if (visibleMachineIds.length === 0 && machines.length > 0 && !localStorage.getItem('print_mgmt_visible_machines')) {
            setVisibleMachineIds(machines.map(m => m.id));
        }
    }, [machines, visibleMachineIds.length]);

    const toggleMachineVisibility = (machineId: string) => {
        setVisibleMachineIds(prev => {
            const next = prev.includes(machineId)
                ? prev.filter(id => id !== machineId)
                : [...prev, machineId];
            localStorage.setItem('print_mgmt_visible_machines', JSON.stringify(next));
            return next;
        });
    };

    // Printer Connection State
    const [connections, setConnections] = useState<{
        [key: string]: {
            status: 'connected' | 'disconnected',
            ip?: string,
            printState?: string,
            progress?: number,
            remainingTime?: number
        }
    }>({});
    const [connectDialogMachineId, setConnectDialogMachineId] = useState<string | null>(null);
    const [printJob, setPrintJob] = useState<{ job: any; machineId: string } | null>(null);

    useEffect(() => {
        if (!window.electronAPI?.printer) return;

        const cleanupStatus = window.electronAPI.printer.onStatus((data: { ip: string; status: 'connected' | 'disconnected' }) => {
            // We need to map IP back to machine ID or store it. 
            // Simplification: We update based on the IP stored in connections.
            setConnections(prev => {
                const machineId = Object.keys(prev).find(key => prev[key].ip === data.ip);
                if (machineId) {
                    return { ...prev, [machineId]: { ...prev[machineId], status: data.status } };
                }
                return prev;
                return prev;
            });
        });

        const cleanupUpdate = window.electronAPI.printer.onStatusUpdate((data: {
            ip: string;
            state: string; // RUNNING, IDLE, FINISH
            progress: number;
            remainingTime: number
        }) => {
            setConnections(prev => {
                const machineId = Object.keys(prev).find(key => prev[key].ip === data.ip);
                if (machineId) {
                    const prevState = prev[machineId].printState;

                    // Notification on Finish
                    if (prevState === 'RUNNING' && data.state === 'FINISH') {
                        toast.success(`Print Finished on ${machines.find(m => m.id === machineId)?.name || 'Printer'}!`, {
                            duration: 10000,
                            action: {
                                label: 'Dismiss',
                                onClick: () => console.log('Dismissed')
                            }
                        });
                        // Could also play sound here
                    }

                    return {
                        ...prev,
                        [machineId]: {
                            ...prev[machineId],
                            printState: data.state,
                            progress: data.progress,
                            remainingTime: data.remainingTime
                        }
                    };
                }
                return prev;
            });
        });

        return () => {
            cleanupStatus();
            if (cleanupUpdate) cleanupUpdate();
        };
    }, [machines]);

    // Initial Connection State Sync
    useEffect(() => {
        if (!window.electronAPI?.printer) return;

        window.electronAPI.printer.getConnectedPrinters().then(printers => {
            console.log('Restoring printer connections:', printers);
            setConnections(prev => {
                const next = { ...prev };
                printers.forEach(p => {
                    // Try to find machine ID by serial first (for Cloud Mode) or match existing IP logic
                    // Here we map back to the ID used in our state.
                    // Ideally we should know which Machine ID is associated with which Serial/IP.
                    // For now, we might leave them 'orphaned' in state if we can't map, 
                    // BUT since we connect via Dialog with specific Machine ID, we must persist that mapping.
                    // Limiting factor: Backend doesn't know Machine ID. 
                    // Frontend workaround: We'll just verify active connections match what we might expect,
                    // OR we iterate our `machines` and if we see a match, we mark it connected.

                    // Simple approach: Update status for any machine in our list that matches the serial/IP

                    // Find machine with this serial (if available/stored) or just bind by IP if LAN?
                    // The backend returns: ip, serial, cloudMode.

                    // Iterate all machines to find a match? 
                    // Current app doesn't seem to store Serial in Machine object explicitly used here,
                    // but let's assume valid match if we can.

                    // For this fix, let's just make sure if we have the machine ID in our session/local storage
                    // we re-bind it. 
                    // Actually `connections` state is purely ephemeral. We can iterate `machines` and match serials if we had them.

                    // Let's iterate keys of `prev`? No, prev is empty.
                    // We need to match valid machines.

                    // Matching Strategy:
                    // Since we don't strictly link Machine ID <-> Serial in DB yet, 
                    // we can't perfectly restore WHICH card was connected if duplicate printers exist.
                    // BUT, let's assume 1:1 for now or try to match by partials.
                });

                // Better approach for V1 Sync:
                // Just put them in state keyed by their IP/Serial if possible?
                // The `connections` object is keyed by `machineId`. 
                // We need to know which `machineId` owns `p.ip` or `p.serial`.
                // WE DON'T KNOW.

                // Fix: We need to store the `machineId` <-> `connectionKey` mapping in localStorage
                // so we can restore it on reload.
                return next;
            });
        });
    }, []);

    const handleConnect = async (details: { ip?: string; accessCode: string; serial: string; cloudMode?: boolean }) => {
        if (!connectDialogMachineId) return;
        try {
            if (window.electronAPI) {
                console.log('[PrintManagement] Initiating connection:', { serial: details.serial, cloudMode: details.cloudMode });
                const result = await window.electronAPI.printer.connect(details);
                console.log('[PrintManagement] Connection result:', result);

                // Use appropriate connection key: cloud mode uses serial, LAN uses IP
                const connectionKey = details.cloudMode ? `cloud:${details.serial}` : details.ip!;
                setConnections(prev => ({
                    ...prev,
                    [connectDialogMachineId]: { status: 'connected', ip: connectionKey }
                }));

                // Persistence: Save mapping
                const storedMappings = JSON.parse(localStorage.getItem('printer_mappings') || '{}');
                storedMappings[connectDialogMachineId] = connectionKey;
                localStorage.setItem('printer_mappings', JSON.stringify(storedMappings));

                toast.success(details.cloudMode ? "Connected via Cloud" : "Connected via LAN");
            } else {
                toast.error("Printer connection only available in Desktop App");
            }
        } catch (error: any) {
            console.error('[PrintManagement] Connection error:', error);
            toast.error(`Failed to connect: ${error.message || 'Unknown error'}`);
        }
        setConnectDialogMachineId(null);
    };

    const handleSendFileInit = (machineId: string, job: any) => {
        // job here might be the job object from Kanban
        setPrintJob({ job, machineId });
    };

    const handleSendFileConfirm = async (machineId: string, fileOrPath: File | string, options: any) => {
        const conn = connections[machineId];
        if (!conn || conn.status !== 'connected' || !conn.ip) {
            toast.error("Printer not connected");
            return;
        }

        try {
            let filePath: string;
            let fileName: string;

            if (typeof fileOrPath === 'string') {
                // It's a file path string
                filePath = fileOrPath;
                fileName = fileOrPath.split(/[\\/]/).pop() || 'unknown';
            } else {
                // It's a File object - get path from Electron
                filePath = (fileOrPath as any).path;
                fileName = fileOrPath.name;
                if (!filePath) {
                    toast.error("Cannot determine file path. Are you using the web version?");
                    return;
                }
            }

            toast.info(`Sending ${fileName}...`);
            await window.electronAPI.printer.sendFile({ ip: conn.ip, filePath });

            toast.info(`Starting print...`);
            await window.electronAPI.printer.startPrint({ ip: conn.ip, fileName, options });

            toast.success("Print started successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to send file");
        }
    };


    const { jobs, moveJob, getUnassignedJobs, getJobsByMachine } = useProduction();

    // Create combined list of all columns
    // 1. Unassigned (Global Queue)
    // 2. Each Machine

    const unassignedJobs = getUnassignedJobs();

    // Group jobs by machine and filter for visibility
    const machineColumns = useMemo(() => {
        return machines
            .map(machine => ({
                id: `machine-${machine.id}`,
                title: machine.name,
                jobs: getJobsByMachine(machine.id),
                rawId: machine.id
            }))
            // Filter: Only show User Selected machines
            .filter(col => visibleMachineIds.includes(col.rawId));
    }, [machines, getJobsByMachine, visibleMachineIds]);

    const onDragEnd = (result: DropResult) => {
        const { source, destination, draggableId } = result;

        if (!destination) return;

        if (
            source.droppableId === destination.droppableId &&
            source.index === destination.index
        ) {
            return;
        }

        // --- STRICT ASSIGNMENT LOGIC ---
        // 1. Identify the job (we need to find it by ID from our lists)
        const allJobs = [...unassignedJobs, ...machineColumns.flatMap(c => c.jobs)];
        const movedJob = allJobs.find(j => j.id === draggableId);

        if (!movedJob) return;

        // 2. Identify Target ID
        let targetMachineId: string | null = null;
        if (destination.droppableId.startsWith('machine-')) {
            targetMachineId = destination.droppableId.replace('machine-', '');
        }

        // 3. Validation: Can only move to OWN machine or Unassigned
        // If moving TO a machine, it must match the job's assigned machine (if it has one) 
        // OR checks compatibility if we had type data (but strict ID match is safer)

        // Actually, since we auto-assign ID on creation now, the job might already have a machineId.
        // If it was "Unassigned" (machineId=null), can we drag it anywhere?
        // User requirement: "it must be allow only to drag in que in bambu A1 Printer card"
        // This implies even if unassigned, it should likely match the 'quote parameter'.

        // Let's check matching logic:
        // Find the machine corresponding to the target ID
        const targetMachine = machines.find(m => m.id === targetMachineId);

        // Check if job matches target machine name (from quote parameters)
        // Note: quote.parameters.machine is the name
        if (targetMachineId) {
            const jobMachineName = movedJob.quote.parameters.machine || movedJob.quote.parameters.machineName;

            // If job has a specific machine name, and we are dragging to a machine...
            if (jobMachineName && targetMachine && targetMachine.name !== jobMachineName) {
                toast.error(`Cannot move job for "${jobMachineName}" to "${targetMachine.name}"`);
                return;
            }
        }

        // 4. Perform Move
        if (movedJob) {
            moveJob(draggableId, movedJob.status, targetMachineId, destination.index);
        }
    };

    return (
        <div className="w-full h-[calc(100vh-8rem)] flex flex-col animate-fade-in">
            {/* Header / Toolbar */}
            <div className="mb-4 flex justify-between items-center px-1">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="mr-1">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-xl font-bold tracking-tight">Production Manager</h2>
                    <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border/50">
                        {jobs.length} Active Jobs
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 gap-2 bg-card hover:bg-accent/50">
                                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs">Filter Machines</span>
                                {visibleMachineIds.length < machines.length && (
                                    <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                                        {visibleMachineIds.length}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>Visible Machines</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {machines.map(machine => (
                                <DropdownMenuCheckboxItem
                                    key={machine.id}
                                    checked={visibleMachineIds.includes(machine.id)}
                                    onCheckedChange={() => toggleMachineVisibility(machine.id)}
                                >
                                    <span className="truncate">{machine.name}</span>
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto pb-4 scrollbar-thin">
                    <div className="flex h-full gap-3 min-w-max px-1">
                        {/* 1. Unassigned / Queue */}
                        <KanbanColumn
                            id="unassigned"
                            title="Queue"
                            jobs={unassignedJobs}
                        />

                        {/* 2. Machine Columns */}
                        {machineColumns.map(col => (
                            <KanbanColumn
                                key={col.id}
                                id={col.id}
                                title={col.title}
                                jobs={col.jobs}
                                isMachine={true}
                                onConnect={() => setConnectDialogMachineId(col.rawId)}
                                connectionStatus={connections[col.rawId]?.status || 'disconnected'}
                                onSendFile={(file, job) => handleSendFileInit(col.rawId, { ...job, file })}
                                printerState={connections[col.rawId]}
                            />
                        ))}
                    </div>
                </div>
            </DragDropContext>

            <PrinterConnectDialog
                open={!!connectDialogMachineId}
                onOpenChange={(open) => !open && setConnectDialogMachineId(null)}
                machineName={machines.find(m => m.id === connectDialogMachineId)?.name || 'Printer'}
                onConnect={handleConnect}
            />

            <PrintJobDialog
                open={!!printJob}
                onOpenChange={(open) => !open && setPrintJob(null)}
                job={printJob?.job}
                machines={machines}
                connections={connections}
                onSend={handleSendFileConfirm}
            />
        </div>
    );
};

export default PrintManagement;
