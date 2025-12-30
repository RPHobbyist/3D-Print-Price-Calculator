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
    AlertCircle,
    Package,
    Factory,
    Filter
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
                    className={`group relative bg-card rounded-sm border border-border hover:border-primary/50 transition-all mb-1.5 shadow-sm overflow-hidden ${snapshot.isDragging ? "shadow-xl rotate-1 z-50 ring-2 ring-primary/20 scale-105" : ""
                        }`}
                    style={provided.draggableProps.style}
                >
                    {/* Status Stripe */}
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${job.priority === 'high' ? 'bg-red-500' :
                        job.priority === 'low' ? 'bg-blue-400' : 'bg-transparent group-hover:bg-primary/50'
                        }`} />

                    <div className="p-2 pl-3">
                        <div className="flex justify-between items-start gap-2 mb-1">
                            <h4 className="font-semibold text-xs leading-tight truncate select-none">{job.quote.projectName}</h4>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-5 w-5 -mr-1 -mt-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                        <MoreVertical className="w-3 h-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => removeJob(job.id)} className="text-destructive text-xs">
                                        Remove Job
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-medium mb-2">
                            <Badge variant="outline" className="text-[10px] py-0 h-4 px-1 rounded-[2px] border-border/60 bg-muted/50 text-muted-foreground">
                                {job.quote.printType}
                            </Badge>
                            <span>{job.quote.quantity} units</span>
                            {job.priority !== 'normal' && (
                                <Badge variant="secondary" className={`text-[10px] py-0 h-4 px-1 rounded-[2px] ${job.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                    }`}>
                                    {job.priority}
                                </Badge>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-1 pt-1.5 border-t border-border/40">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3 opacity-70" />
                                <span className="font-mono">{calculateTotalTime(job.quote.parameters.printTime, job.quote.quantity)}</span>
                            </div>
                            <div className="flex items-center justify-end font-mono text-xs font-semibold text-foreground/90">
                                {formatPrice(job.quote.totalPrice)}
                            </div>
                        </div>
                    </div>
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
        <div className="flex flex-col h-full bg-muted/40 rounded-md border border-border/60 min-w-[260px] w-[260px] overflow-hidden">
            {/* Header */}
            <div className={`px-3 py-2 border-b border-border/60 flex justify-between items-center bg-card/50 backdrop-blur-sm ${isMachine ? '' : 'bg-muted/60'}`}>
                <div className="flex items-center gap-2 min-w-0">
                    {isMachine && jobs.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(34,197,94,0.5)] flex-shrink-0" />}
                    {isMachine && jobs.length === 0 && <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 flex-shrink-0" />}

                    <h3 className="font-semibold text-xs uppercase tracking-wide text-foreground/80 truncate" title={title}>
                        {title}
                    </h3>
                </div>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5 font-mono min-w-[20px] justify-center bg-muted text-muted-foreground border border-border/50">
                    {jobs.length}
                </Badge>
            </div>

            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 p-2 overflow-y-auto scrollbar-thin transition-colors ${snapshot.isDraggingOver ? "bg-primary/5 ring-inset ring-2 ring-primary/10" : ""
                            }`}
                    >
                        {jobs.map((job, index) => (
                            <JobCard key={job.id} job={job} index={index} />
                        ))}
                        {provided.placeholder}

                        {jobs.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-muted-foreground/30 text-xs">
                                {isMachine ? <Printer className="w-8 h-8 mb-2 opacity-20" /> : <Package className="w-8 h-8 mb-2 opacity-20" />}
                                <p>Empty Slot</p>
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
        <div className="w-full flex flex-col h-[calc(100vh-80px)] bg-neutral-50/50 dark:bg-neutral-900/20">
            {/* Toolbar */}
            <div className="h-14 border-b bg-card flex items-center justify-between px-6 shadow-sm z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-md">
                        <Factory className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-sm font-bold text-foreground leading-none">Production Manager</h1>
                        <p className="text-[10px] text-muted-foreground mt-0.5 font-medium uppercase tracking-wider">
                            {machines.length} Machines • {jobs.length} Active Jobs
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-medium border-dashed">
                                <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                                Machine Filter
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

                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <span className="sr-only">Settings</span>
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Board Area */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden bg-background/50">
                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="flex gap-4 p-6 h-full items-start min-w-max">

                        {/* Global Queue Column */}
                        <KanbanColumn
                            id="unassigned"
                            title="Queue"
                            jobs={unassignedJobs}
                        />

                        <Separator orientation="vertical" className="h-[90%] my-auto mx-2 bg-border/40" />

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
        </div>
    );
};

export default PrintManagement;
