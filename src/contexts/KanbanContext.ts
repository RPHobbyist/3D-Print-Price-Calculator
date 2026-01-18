import { createContext } from "react";
import { QuoteData, QuoteStatus } from "@/types/quote";

export interface KanbanContextType {
    columns: Record<QuoteStatus, QuoteData[]>;
    moveQuote: (quoteId: string, newStatus: QuoteStatus) => void;
    refreshBoard: () => void;
}

export const KanbanContext = createContext<KanbanContextType | undefined>(undefined);
