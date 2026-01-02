import { memo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductionJob } from "@/contexts/ProductionContext"; // Ensure export
import { useProduction } from "@/contexts/ProductionContext";
import { useCurrency } from "@/components/CurrencyProvider";
import {
    Clock,
    MoreVertical,
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { calculateTotalTime } from "@/lib/utils";

interface JobCardProps {
    job: ProductionJob;
    index: number;
}

export const JobCard = memo(({ job, index }: JobCardProps) => {
    const { formatPrice } = useCurrency();
    const { removeJob } = useProduction();

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
