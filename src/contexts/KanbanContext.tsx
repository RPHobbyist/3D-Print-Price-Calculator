import { useState, useCallback, ReactNode, useMemo } from 'react';
import { QuoteData, QuoteStatus } from '@/types/quote';
import { updateQuoteStatus } from '@/lib/core/sessionStorage';
import { toast } from 'sonner';
import { KanbanContext } from '@/contexts/KanbanContext';

interface KanbanProviderProps {
    children: ReactNode;
    quotes: QuoteData[];
    onQuoteUpdate: () => void;
}

export const KanbanProvider = ({ children, quotes, onQuoteUpdate }: KanbanProviderProps) => {

    // Derived state: Columns
    const columns = useMemo(() => {
        const cols: Record<QuoteStatus, QuoteData[]> = {
            PENDING: [],
            APPROVED: [],
            PRINTING: [],
            POST_PROCESSING: [],
            DONE: [],
            DISPATCHED: [],
            DELIVERED: [],
            FAILED: []
        };

        quotes.forEach(quote => {
            const status = quote.status || 'PENDING';
            if (cols[status]) {
                cols[status].push(quote);
            } else {
                // Fallback for unknown status
                cols['PENDING'].push(quote);
            }
        });

        return cols;
    }, [quotes]);

    const moveQuote = useCallback((quoteId: string, newStatus: QuoteStatus) => {
        // 1. Update in storage
        updateQuoteStatus(quoteId, newStatus);

        // 2. Refetch to update UI
        onQuoteUpdate();

        // 3. Feedback (Simulating advanced logic without inventory block)
        if (newStatus === 'PRINTING') {
            const quote = quotes.find(q => q.id === quoteId);
            toast.info(`Started production for ${quote?.projectName || 'Item'}`, { duration: 2000 });
        } else if (newStatus === 'DELIVERED') {
            toast.success("Order Delivered!", { description: "Order has been marked as delivered." });
        } else if (newStatus === 'DISPATCHED') {
            toast.info("Order Dispatched", { description: "Order is on its way!" });
        }
    }, [onQuoteUpdate, quotes]);

    return (
        <KanbanContext.Provider value={{ columns, moveQuote, refreshBoard: onQuoteUpdate }}>
            {children}
        </KanbanContext.Provider>
    );
};
