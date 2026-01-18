import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { OrderList } from "@/components/kanban/OrderList";
import { KanbanProvider } from "@/contexts/KanbanProvider";
import { useSavedQuotes } from "@/hooks/useSavedQuotes";

const OrderManagement = memo(() => {
    const navigate = useNavigate();
    const {
        quotes,
        loading,
        refetch,
    } = useSavedQuotes();

    // Calculate stats
    const totalOrders = quotes.length;
    const completed = quotes.filter(q => q.status === 'DONE').length;

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto p-6 max-w-5xl">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate('/')}
                        className="h-8 w-8"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-semibold">Order Management</h1>
                        <p className="text-sm text-muted-foreground">
                            {totalOrders} orders · {completed} completed
                        </p>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <KanbanProvider quotes={quotes} onQuoteUpdate={refetch}>
                        <OrderList />
                    </KanbanProvider>
                )}
            </div>
        </div>
    );
});

export default OrderManagement;
