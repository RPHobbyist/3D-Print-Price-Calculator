import { useMemo, useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { useProduction } from "@/contexts/ProductionContext";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import {
    Filter
} from "lucide-react";
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

const PrintManagement = () => {
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
                            />
                        ))}
                    </div>
                </div>
            </DragDropContext>
        </div>
    );
};

export default PrintManagement;
