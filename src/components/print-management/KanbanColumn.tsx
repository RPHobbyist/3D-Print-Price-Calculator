import { memo } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";
import { ProductionJob } from "@/contexts/ProductionContext";
import { Printer, Package } from "lucide-react";
import { JobCard } from "./JobCard";

interface KanbanColumnProps {
    title: string;
    id: string;
    jobs: ProductionJob[];
    isMachine?: boolean;
}

export const KanbanColumn = memo(({
    title,
    id,
    jobs,
    isMachine = false
}: KanbanColumnProps) => {
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
