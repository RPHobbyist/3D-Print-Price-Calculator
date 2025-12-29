import { useState, useCallback, memo } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, Sparkles, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import FDMCalculatorTable from "@/components/FDMCalculatorTable";
import ResinCalculatorTable from "@/components/ResinCalculatorTable";
import QuoteSummary from "@/components/QuoteSummary";
import SavedQuotesTable from "@/components/SavedQuotesTable";
import { QuotesDashboard } from "@/components/dashboard/QuotesDashboard";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/logo.png";
import { NavLink } from "@/components/NavLink";
import { Footer } from "@/components/Footer";
import { CurrencySelector } from "@/components/CurrencySelector";
import { QuoteData } from "@/types/quote";
import { useSavedQuotes } from "@/hooks/useSavedQuotes";

const Index = memo(() => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const {
    quotes,
    loading,
    stats,
    saveQuote,
    deleteQuote,
    updateNotes,
    duplicateQuote,
    refetch,
  } = useSavedQuotes();

  const handleReset = useCallback(() => {
    setQuoteData(null);
    setResetKey(prev => prev + 1);
  }, []);

  const handleSaveQuote = useCallback(async (quote: QuoteData) => {
    await saveQuote(quote);
  }, [saveQuote]);

  const handleDeleteQuote = useCallback(async (index: number) => {
    const quote = quotes[index];
    if (quote.id) {
      await deleteQuote(quote.id);
    }
  }, [quotes, deleteQuote]);

  const handleUpdateNotes = useCallback(async (index: number, notes: string) => {
    const quote = quotes[index];
    if (quote.id) {
      await updateNotes(quote.id, notes);
    }
  }, [quotes, updateNotes]);

  const handleDuplicateQuote = useCallback(async (index: number) => {
    const quote = quotes[index];
    await duplicateQuote(quote);
  }, [quotes, duplicateQuote]);

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
      {/* Glow effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50 shadow-card">
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              <a href="https://linktr.ee/RPHobbyist" target="_blank" rel="noopener noreferrer" className="hover-lift flex-shrink-0">
                <img src={logo} alt="Rp Hobbyist" className="h-8 sm:h-10 md:h-12 w-auto object-contain" />
              </a>
              <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">3D Print Price Calculator</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  by <a href="https://linktr.ee/RPHobbyist" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">Rp Hobbyist</a> • Professional pricing for FDM & Resin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <CurrencySelector />
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="hover:bg-secondary text-xs sm:text-sm"
              >
                <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Reset
              </Button>
              <NavLink to="/settings">Settings</NavLink>
            </div>
          </div>
        </div>
      </header>


      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative">
        {/* Stats Dashboard */}
        {stats.totalQuotes > 0 && (
          <div className="mb-8">
            <QuotesDashboard stats={stats} />
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_380px] gap-4 sm:gap-8">
          {/* Calculator Section */}
          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-elevated border-border bg-card overflow-hidden hover-glow">
              <Tabs defaultValue="fdm" className="w-full">
                <div className="border-b border-border px-3 sm:px-6 pt-4 sm:pt-6">
                  <TabsList className="bg-secondary/50 p-1 sm:p-1.5 rounded-xl w-full sm:w-auto">
                    <TabsTrigger
                      value="fdm"
                      className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card rounded-lg px-3 sm:px-6 py-2 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      FDM Printing
                    </TabsTrigger>
                    <TabsTrigger
                      value="resin"
                      className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card rounded-lg px-3 sm:px-6 py-2 sm:py-2.5 transition-all duration-200 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      <Printer className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      Resin Printing
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="fdm" className="p-3 sm:p-6 mt-0 animate-fade-in">
                  <FDMCalculatorTable key={`fdm-${resetKey}`} onCalculate={setQuoteData} />
                </TabsContent>

                <TabsContent value="resin" className="p-3 sm:p-6 mt-0 animate-fade-in">
                  <ResinCalculatorTable key={`resin-${resetKey}`} onCalculate={setQuoteData} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Quote Summary Section */}
          <div className="lg:sticky lg:top-24 h-fit animate-fade-in stagger-2">
            <QuoteSummary quoteData={quoteData} onSaveQuote={handleSaveQuote} />
          </div>
        </div>

        {/* Saved Quotes Section */}
        <div className="mt-10 animate-fade-in stagger-3">
          {loading ? (
            <Card className="p-10 shadow-card">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-primary animate-pulse-soft" />
                </div>
                <span className="text-muted-foreground font-medium">Loading saved quotes...</span>
              </div>
            </Card>
          ) : (
            <SavedQuotesTable
              quotes={quotes}
              onDeleteQuote={handleDeleteQuote}
              onUpdateNotes={handleUpdateNotes}
              onDuplicateQuote={handleDuplicateQuote}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
});

Index.displayName = "Index";

export default Index;
