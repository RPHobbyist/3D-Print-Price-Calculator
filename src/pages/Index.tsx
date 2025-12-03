import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Printer } from "lucide-react";
import FDMCalculatorTable from "@/components/FDMCalculatorTable";
import ResinCalculatorTable from "@/components/ResinCalculatorTable";
import QuoteSummary from "@/components/QuoteSummary";
import SavedQuotesTable from "@/components/SavedQuotesTable";
import { NavLink } from "@/components/NavLink";

export interface QuoteData {
  materialCost: number;
  machineTimeCost: number;
  electricityCost: number;
  laborCost: number;
  overheadCost: number;
  subtotal: number;
  markup: number;
  totalPrice: number;
  printType: "FDM" | "Resin";
  projectName: string;
  printColour: string;
  parameters: Record<string, any>;
  createdAt?: string;
  notes?: string;
}

const Index = () => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [savedQuotes, setSavedQuotes] = useState<QuoteData[]>([]);

  const handleSaveQuote = (quote: QuoteData) => {
    const quoteWithTimestamp = {
      ...quote,
      createdAt: new Date().toISOString(),
      notes: "",
    };
    setSavedQuotes((prev) => [...prev, quoteWithTimestamp]);
  };

  const handleUpdateQuoteNotes = (index: number, notes: string) => {
    setSavedQuotes((prev) =>
      prev.map((quote, i) => (i === index ? { ...quote, notes } : quote))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-accent p-3 rounded-xl shadow-card">
                <Calculator className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">3D Print Quote Calculator</h1>
                <p className="text-sm text-muted-foreground">Professional pricing estimation for FDM & Resin printing</p>
              </div>
            </div>
            <NavLink to="/settings">Settings</NavLink>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Calculator Section */}
          <div className="space-y-6">
            <Card className="shadow-elevated border-border bg-card">
              <Tabs defaultValue="fdm" className="w-full">
                <div className="border-b border-border px-6 pt-6">
                  <TabsList className="bg-secondary">
                    <TabsTrigger value="fdm" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Printer className="w-4 h-4 mr-2" />
                      FDM Printing
                    </TabsTrigger>
                    <TabsTrigger value="resin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                      <Printer className="w-4 h-4 mr-2" />
                      Resin Printing
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="fdm" className="p-6 mt-0">
                  <FDMCalculatorTable onCalculate={setQuoteData} />
                </TabsContent>

                <TabsContent value="resin" className="p-6 mt-0">
                  <ResinCalculatorTable onCalculate={setQuoteData} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Quote Summary Section */}
          <div className="lg:sticky lg:top-24 h-fit">
            <QuoteSummary quoteData={quoteData} onSaveQuote={handleSaveQuote} />
          </div>
        </div>

        {/* Saved Quotes Section */}
        <div className="mt-8">
          <SavedQuotesTable 
            quotes={savedQuotes} 
            onDeleteQuote={(index) => setSavedQuotes((prev) => prev.filter((_, i) => i !== index))}
            onUpdateNotes={handleUpdateQuoteNotes}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
