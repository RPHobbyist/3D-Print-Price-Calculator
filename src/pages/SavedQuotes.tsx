
import SavedQuotesTable from "@/components/SavedQuotesTable";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { CurrencySelector } from "@/components/CurrencySelector";

const SavedQuotes = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="border-b bg-card/80 backdrop-blur top-0 z-50 sticky">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate('/')}
                            className="rounded-full hover:bg-muted"
                        >
                            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
                        </Button>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Saved Quotes
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <CurrencySelector />
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="container mx-auto px-4 py-8">
                <SavedQuotesTable />
            </main>
        </div>
    );
};

export default SavedQuotes;
