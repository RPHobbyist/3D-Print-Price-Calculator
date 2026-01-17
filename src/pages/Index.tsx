import { useState, useCallback, memo, lazy, Suspense, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Printer, RotateCcw, Settings, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import FDMCalculatorTable from "@/components/calculator/FDMCalculatorTable";
import ResinCalculatorTable from "@/components/calculator/ResinCalculatorTable";
import QuoteSummary from "@/components/quotes/QuoteSummary";
import BatchSummary from "@/components/quotes/BatchSummary";
const SavedQuotesTable = lazy(() => import("@/components/quotes/SavedQuotesTable"));
const QuotesDashboard = lazy(() => import("@/components/dashboard/QuotesDashboard").then(module => ({ default: module.QuotesDashboard })));
import { useNavigate, Link } from "react-router-dom";
import { SYSTEM_CONFIG } from "@/lib/core/core-system";
import { NavLink } from "@/components/layout/NavLink";
import { Footer } from "@/components/layout/Footer";

import { CurrencySelector } from "@/components/shared/CurrencySelector";
import { QuoteData } from "@/types/quote";
import { useSavedQuotes } from "@/hooks/useSavedQuotes";
import { useBatchQuote } from "@/contexts/BatchQuoteContext";
import { toast } from "sonner";

import WhatsNewDialog from "@/components/feedback/WhatsNewDialog";
import { FeedbackDialog } from "@/components/feedback/FeedbackDialog";

const Index = memo(() => {
  const navigate = useNavigate();
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
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

  const { clearBatch } = useBatchQuote();

  const handleReset = useCallback(() => {
    setQuoteData(null);
    clearBatch();
    setResetKey(prev => prev + 1);
  }, [clearBatch]);

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

  useEffect(() => {
    // Check if user has seen the new CRM announcement
    const hasSeenNewCRM = localStorage.getItem("crm-feature-seen-v1");
    if (!hasSeenNewCRM) {
      setTimeout(() => {
        toast.info("New Feature: CRM! 🚀", {
          description: "Manage detailed customer profiles, track order history, and view analytics.",
          action: {
            label: "Check it out",
            onClick: () => navigate("/settings?tab=customers"),
          },
          cancel: {
            label: "Close",
            onClick: () => { },
          },
          duration: 8000,
        });
        localStorage.setItem("crm-feature-seen-v1", "true");
      }, 1500);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Glow effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none" />

      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50 shadow-card">
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
              <a href={SYSTEM_CONFIG.vendorLink} target="_blank" rel="noopener noreferrer" className="hover-lift flex-shrink-0">
                <img src={SYSTEM_CONFIG.logo} alt={SYSTEM_CONFIG.vendor} className="h-8 sm:h-10 md:h-12 w-auto object-contain" />
              </a>
              <div className="text-center sm:text-left">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground tracking-tight">{SYSTEM_CONFIG.appName}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  by <a href={SYSTEM_CONFIG.vendorLink} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">{SYSTEM_CONFIG.vendor}</a> • Professional pricing for FDM & Resin
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
              <CurrencySelector />

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-8 px-3 bg-background hover:bg-muted text-xs sm:text-sm border-input"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-2" />
                Reset
              </Button>

              <Button variant="outline" size="sm" asChild className="h-8 px-3 bg-background hover:bg-muted text-xs sm:text-sm border-input">
                <Link to="/settings">
                  <Settings className="w-3.5 h-3.5 mr-2" />
                  Settings
                </Link>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {

                  setShowFeedback(true);
                }}
                className="h-8 px-3 bg-background hover:bg-muted text-xs sm:text-sm border-input"
              >
                Feedback
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWhatsNew(true)}
                className="h-8 px-3 bg-background hover:bg-muted text-xs sm:text-sm border-input animate-breathe-yellow"
              >
                What's New
              </Button>
            </div>
          </div>
        </div>
      </header>


      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 relative">
        {/* Stats Dashboard */}
        {stats.totalQuotes > 0 && (
          <div className="mb-8">
            <Suspense fallback={<div className="h-32 bg-card/50 rounded-xl animate-pulse" />}>
              <QuotesDashboard stats={stats} />
            </Suspense>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_380px] gap-4 sm:gap-8">
          {/* Calculator Section */}
          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-elevated border-border bg-card overflow-hidden hover-glow">
              <Tabs defaultValue="fdm" className="w-full">
                <div className="border-b border-border px-3 sm:px-6 pt-4 sm:pt-6 pb-4">
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
          <div className="lg:sticky lg:top-24 h-fit animate-fade-in stagger-2 space-y-6">
            <QuoteSummary quoteData={quoteData} onSaveQuote={handleSaveQuote} />

            {/* Batch Queue */}
            <BatchSummary />
          </div>
        </div>

        {/* Saved Quotes Section */}
        <div className="mt-10 animate-fade-in stagger-3">
          {loading ? (
            <Card className="p-10 shadow-card">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                </div>
                <span className="text-muted-foreground font-medium">Loading saved quotes...</span>
              </div>
            </Card>
          ) : (
            <Suspense fallback={
              <Card className="p-10 shadow-card">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  </div>
                  <span className="text-muted-foreground font-medium">Loading component...</span>
                </div>
              </Card>
            }>
              <SavedQuotesTable
                quotes={quotes}
                onDeleteQuote={handleDeleteQuote}
                onUpdateNotes={handleUpdateNotes}
                onDuplicateQuote={handleDuplicateQuote}
              />
            </Suspense>
          )}
        </div>
      </main>

      <Footer />

      {/* Dialogs */}
      <WhatsNewDialog externalOpen={showWhatsNew} onExternalOpenChange={setShowWhatsNew} />
      <FeedbackDialog open={showFeedback} onOpenChange={setShowFeedback} />
    </div>
  );
});

Index.displayName = "Index";

export default Index;
