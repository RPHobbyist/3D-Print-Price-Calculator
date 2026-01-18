import { createContext } from "react";
import { QuoteData } from "@/types/quote";
import { ProductionJob, JobStatus } from "@/types/production";

export interface ProductionContextType {
    jobs: ProductionJob[];
    addJob: (quote: QuoteData, machineId?: string | null) => void;
    updateJob: (jobId: string, updates: Partial<ProductionJob>) => void;
    moveJob: (jobId: string, newStatus: JobStatus, newMachineId: string | null, newIndex?: number) => void;
    removeJob: (jobId: string) => void;
    clearCompleted: () => void;
    getJobsByMachine: (machineId: string) => ProductionJob[];
    getUnassignedJobs: () => ProductionJob[];
}

export const ProductionContext = createContext<ProductionContextType | undefined>(undefined);
