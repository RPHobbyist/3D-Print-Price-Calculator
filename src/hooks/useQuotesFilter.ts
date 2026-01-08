import { useState, useMemo } from "react";
import { QuoteData } from "@/types/quote";

export type SortOrder = "newest" | "oldest" | "price-high" | "price-low";
export type FilterType = "all" | "FDM" | "Resin";

export const useQuotesFilter = (quotes: QuoteData[]) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<FilterType>("all");
    const [sortOrder, setSortOrder] = useState<SortOrder>("newest");

    const filteredAndSortedQuotes = useMemo(() => {
        let result = [...quotes];

        // Filter by type
        if (filterType !== "all") {
            result = result.filter(q => q.printType === filterType);
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(q =>
                q.projectName.toLowerCase().includes(query) ||
                (q.clientName && q.clientName.toLowerCase().includes(query)) ||
                (q.notes && q.notes.toLowerCase().includes(query))
            );
        }

        // Sort
        result.sort((a, b) => {
            switch (sortOrder) {
                case "newest":
                    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                case "oldest":
                    return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
                case "price-high":
                    return b.totalPrice - a.totalPrice;
                case "price-low":
                    return a.totalPrice - b.totalPrice;
                default:
                    return 0;
            }
        });

        return result;
    }, [quotes, filterType, searchQuery, sortOrder]);

    return {
        searchQuery,
        setSearchQuery,
        filterType,
        setFilterType,
        sortOrder,
        setSortOrder,
        filteredAndSortedQuotes
    };
};
