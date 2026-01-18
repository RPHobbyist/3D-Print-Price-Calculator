import { createContext } from "react";
import { QuoteData } from "@/types/quote";

export interface BatchQuoteContextType {
    batchItems: QuoteData[];
    addItem: (item: QuoteData) => void;
    removeItem: (index: number) => void;
    updateItem: (index: number, item: QuoteData) => void;
    clearBatch: () => void;
    batchTotals: {
        totalItems: number;
        totalQuantity: number;
        totalMaterialCost: number;
        totalMachineTimeCost: number;
        totalElectricityCost: number;
        totalLaborCost: number;
        totalOverheadCost: number;
        totalMarkup: number;
        grandTotal: number;
    };
}

export const BatchQuoteContext = createContext<BatchQuoteContextType | undefined>(undefined);
