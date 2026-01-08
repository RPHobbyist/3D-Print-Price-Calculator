import { Search, Filter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterType, SortOrder } from "@/hooks/useQuotesFilter";

interface QuotesToolbarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterType: FilterType;
    setFilterType: (type: FilterType) => void;
    sortOrder: SortOrder;
    setSortOrder: (order: SortOrder) => void;
}

export const QuotesToolbar = ({
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    sortOrder,
    setSortOrder,
}: QuotesToolbarProps) => {
    return (
        <div className="p-4 border-b border-border bg-muted/20 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Search projects or clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background"
                />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <div className="flex items-center gap-2 min-w-[140px]">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <Select value={filterType} onValueChange={(v: FilterType) => setFilterType(v)}>
                        <SelectTrigger className="bg-background w-full">
                            <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="FDM">FDM Only</SelectItem>
                            <SelectItem value="Resin">Resin Only</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 min-w-[160px]">
                    <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
                    <Select value={sortOrder} onValueChange={(v: SortOrder) => setSortOrder(v)}>
                        <SelectTrigger className="bg-background w-full">
                            <SelectValue placeholder="Sort By" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="price-high">Highest Price</SelectItem>
                            <SelectItem value="price-low">Lowest Price</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
};
