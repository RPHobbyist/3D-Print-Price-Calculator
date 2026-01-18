import { QuoteData } from "./quote";

export type JobStatus = 'queued' | 'printing' | 'post_processing' | 'completed';
export type JobPriority = 'low' | 'normal' | 'high';

export interface ProductionJob {
    id: string;
    quote: QuoteData;
    status: JobStatus;
    machineId: string | null; // null means unassigned/global queue
    priority: JobPriority;
    createdAt: string;
    startedAt?: string;
    completedAt?: string;
    notes?: string;
    // For sorting within the same status/machine
    order: number;
}
