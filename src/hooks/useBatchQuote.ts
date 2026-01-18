import { useContext } from "react";
import { BatchQuoteContext } from "@/contexts/BatchQuoteContext";

export const useBatchQuote = () => {
    const context = useContext(BatchQuoteContext);
    if (!context) {
        throw new Error('useBatchQuote must be used within a BatchQuoteProvider');
    }
    return context;
};
