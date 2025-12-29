import { memo, useMemo, useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useProduction, ProductionJob, JobStatus } from "@/contexts/ProductionContext";
import { useCalculatorData } from "@/hooks/useCalculatorData";
import { useCurrency } from "@/components/CurrencyProvider";
import {
    Printer,
    Clock,
    MoreVertical,
    Trash2,
    ArrowRight,
    GripVertical,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

const calculateTotalTime = (timeStr: string | undefined, quantity: number): string => {
    if (!timeStr) return '0h';
    if (quantity <= 1) return timeStr;

    // Parse time string
    let totalMinutes = 0;

    // Handle "1h 30m" format
    if (timeStr.includes('h') && timeStr.includes('m')) {
        const hMatch = timeStr.match(/(\d+(\.\d+)?)h/);
        const mMatch = timeStr.match(/(\d+(\.\d+)?)m/);
        if (hMatch) totalMinutes += parseFloat(hMatch[1]) * 60;
        if (mMatch) totalMinutes += parseFloat(mMatch[1]);
    }
    // Handle "1.5h" or "45m" formats
    else if (timeStr.includes('h')) {
        const h = parseFloat(timeStr.replace('h', ''));
        if (!isNaN(h)) totalMinutes = h * 60;
    } else if (timeStr.includes('m')) {
        const m = parseFloat(timeStr.replace('m', ''));
        if (!isNaN(m)) totalMinutes = m;
    } else {
        // Fallback if just a number (assume hours?) or unknown
        const val = parseFloat(timeStr);
        if (!isNaN(val)) totalMinutes = val * 60;
    }

    // Multiply by quantity
    totalMinutes *= quantity;

    // Format back to string
    const hours = Math.floor(totalMinutes / 60);
    const mins = Math.round(totalMinutes % 60);

    if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
    if (hours > 0) return `${hours}h`;
    return `${mins}m`;
};

const JobCard = memo(({ job, index }: { job: ProductionJob; index: number }) => {
    const { formatPrice } = useCurrency();
    const { removeJob, updateJob } = useProduction();

    return (
        <Draggable draggableId={job.id} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`group bg-card border rounded-lg p-3 shadow-sm hover:shadow-md transition-all mb-2 ${snapshot.isDragging ? "shadow-lg rotate-2 z-50 ring-2 ring-primary/20" : ""
                        }`}
                    style={provided.draggableProps.style}
                >
                    <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{job.quote.projectName}</h4>
                            <p className="text-xs text-muted-foreground truncate">
                                {job.quote.printType} • {job.quote.quantity} units
                            </p>
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 -mr-2">
                                    <MoreVertical className="w-3 h-3" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => removeJob(job.id)} className="text-destructive">
                                    <Trash2 className="w-3 h-3 mr-2" />
                                    Remove
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{calculateTotalTime(job.quote.parameters.printTime, job.quote.quantity)}</span>
                        </div>
                        <div className="flex items-center gap-1 justify-end font-medium text-foreground">
                            {formatPrice(job.quote.totalPrice)}
                        </div>
                    </div>

                    {job.priority !== 'normal' && (
                        <Badge
                            variant="outline"
                            className={`mt-2 text-[10px] w-full justify-center py-0 h-4 ${job.priority === 'high'
                                ? 'border-red-200 text-red-600 bg-red-50'
                                : 'border-blue-200 text-blue-600 bg-blue-50'
                                }`}
                        >
                            {job.priority.toUpperCase()}
                        </Badge>
                    )}
                </div>
            )}
        </Draggable>
    );
});

JobCard.displayName = "JobCard";

const KanbanColumn = memo(({
    title,
    id,
    jobs,
    isMachine = false
}: {
    title: string;
    id: string;
    jobs: ProductionJob[];
    isMachine?: boolean;
}) => {
    return (
        <div className="flex flex-col h-full bg-muted/30 rounded-xl border border-border/50 min-w-[280px] w-[280px]">
            <div className={`p-3 border-b border-border/50 flex justify-between items-center ${isMachine ? 'bg-primary/5' : ''}`}>
                <div className="flex items-center gap-2">
                    {isMachine ? <Printer className="w-4 h-4 text-primary" /> : <AlertCircle className="w-4 h-4 text-muted-foreground" />}
                    <h3 className="font-semibold text-sm">{title}</h3>
                </div>
                <Badge variant="secondary" className="text-xs">{jobs.length}</Badge>
            </div>

            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 overflow-y-auto min-h-[150px] transition-colors ${snapshot.isDraggingOver ? "bg-primary/5" : ""
                            }`}
                    >
                        {jobs.map((job, index) => (
                            <JobCard key={job.id} job={job} index={index} />
                        ))}
                        {provided.placeholder}

                        {jobs.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-24 text-muted-foreground/40 text-xs border-2 border-dashed border-border/50 rounded-lg m-1">
                                <p>Drag jobs here</p>
                            </div>
                        )}
                    </div>
                )}
            </Droppable>
        </div>
    );
});

KanbanColumn.displayName = "KanbanColumn";

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
    }, [machines.length, visibleMachineIds.length]);

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

        // Determine new status/machine based on destination ID
        let newStatus: JobStatus = 'queued'; // Default

        if (destination.droppableId === 'unassigned') {
            // Allow moving back to unassigned? Yes.
            targetMachineId = null;
            newStatus = 'queued';
        } else if (destination.droppableId.startsWith('machine-')) {
            // Keep targetMachineId as set above
            newStatus = 'queued';
        }

        moveJob(draggableId, newStatus, targetMachineId, destination.index);
        toast.success('Job moved');
    };

    return (
        <div className="w-full p-6 h-[calc(100vh-80px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6 px-2">
                <div>
                    <h1 className="text-2xl font-bold">Print Production Board</h1>
                    <p className="text-muted-foreground">Manage queues and track active jobs</p>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="ml-auto">
                            <Filter className="w-4 h-4 mr-2" />
                            Filter Machines
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Visible Machines</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {machines.map(machine => (
                            <DropdownMenuCheckboxItem
                                key={machine.id}
                                checked={visibleMachineIds.includes(machine.id)}
                                onCheckedChange={() => toggleMachineVisibility(machine.id)}
                            >
                                {machine.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                        {machines.length === 0 && <div className="p-2 text-xs text-muted-foreground">No machines found</div>}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">

                    {/* Global Queue Column */}
                    <KanbanColumn
                        id="unassigned"
                        title="Unassigned Queue"
                        jobs={unassignedJobs}
                    />

                    <Separator orientation="vertical" className="h-full mx-2 hidden sm:block" />

                    {/* Machine Columns */}
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
            </DragDropContext>
        </div>
    );
};

export default PrintManagement;
