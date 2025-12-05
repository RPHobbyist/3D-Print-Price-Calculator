import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Printer, Sparkles } from "lucide-react";
import FDMCalculatorTable from "@/components/FDMCalculatorTable";
import ResinCalculatorTable from "@/components/ResinCalculatorTable";
import QuoteSummary from "@/components/QuoteSummary";
import SavedQuotesTable from "@/components/SavedQuotesTable";
import { NavLink } from "@/components/NavLink";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface QuoteData {
  id?: string;
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedQuotes();
  }, []);

  const loadSavedQuotes = async () => {
    try {
      const { data, error } = await supabase
        .from("saved_quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const quotes: QuoteData[] = (data || []).map((row: any) => ({
        id: row.id,
        materialCost: Number(row.material_cost),
        machineTimeCost: Number(row.machine_time_cost),
        electricityCost: Number(row.electricity_cost),
        laborCost: Number(row.labor_cost),
        overheadCost: Number(row.overhead_cost),
        subtotal: Number(row.subtotal),
        markup: Number(row.markup),
        totalPrice: Number(row.total_price),
        printType: row.print_type as "FDM" | "Resin",
        projectName: row.project_name,
        printColour: row.print_colour || "",
        parameters: (typeof row.parameters === 'object' && row.parameters !== null) ? row.parameters : {},
        createdAt: row.created_at,
        notes: row.notes || "",
      }));

      setSavedQuotes(quotes);
    } catch (error: any) {
      toast.error("Failed to load saved quotes");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuote = async (quote: QuoteData) => {
    try {
      const { data, error } = await supabase
        .from("saved_quotes")
        .insert({
          project_name: quote.projectName,
          print_type: quote.printType,
          print_colour: quote.printColour,
          material_cost: quote.materialCost,
          machine_time_cost: quote.machineTimeCost,
          electricity_cost: quote.electricityCost,
          labor_cost: quote.laborCost,
          overhead_cost: quote.overheadCost,
          subtotal: quote.subtotal,
          markup: quote.markup,
          total_price: quote.totalPrice,
          parameters: quote.parameters,
          notes: "",
        })
        .select()
        .single();

      if (error) throw error;

      const newQuote: QuoteData = {
        id: data.id,
        materialCost: Number(data.material_cost),
        machineTimeCost: Number(data.machine_time_cost),
        electricityCost: Number(data.electricity_cost),
        laborCost: Number(data.labor_cost),
        overheadCost: Number(data.overhead_cost),
        subtotal: Number(data.subtotal),
        markup: Number(data.markup),
        totalPrice: Number(data.total_price),
        printType: data.print_type as "FDM" | "Resin",
        projectName: data.project_name,
        printColour: data.print_colour || "",
        parameters: (typeof data.parameters === 'object' && data.parameters !== null && !Array.isArray(data.parameters)) 
          ? (data.parameters as Record<string, any>) 
          : {},
        createdAt: data.created_at,
        notes: data.notes || "",
      };

      setSavedQuotes((prev) => [newQuote, ...prev]);
    } catch (error: any) {
      toast.error("Failed to save quote permanently");
    }
  };

  const handleDeleteQuote = async (index: number) => {
    const quote = savedQuotes[index];
    if (!quote.id) return;

    try {
      const { error } = await supabase
        .from("saved_quotes")
        .delete()
        .eq("id", quote.id);

      if (error) throw error;

      setSavedQuotes((prev) => prev.filter((_, i) => i !== index));
      toast.success("Quote deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete quote");
    }
  };

  const handleUpdateQuoteNotes = async (index: number, notes: string) => {
    const quote = savedQuotes[index];
    if (!quote.id) return;

    try {
      const { error } = await supabase
        .from("saved_quotes")
        .update({ notes })
        .eq("id", quote.id);

      if (error) throw error;

      setSavedQuotes((prev) =>
        prev.map((q, i) => (i === index ? { ...q, notes } : q))
      );
    } catch (error: any) {
      toast.error("Failed to update notes");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Glow effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-50 shadow-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-accent p-3 rounded-2xl shadow-elevated hover-lift">
                <Calculator className="w-7 h-7 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">3D Print Quote Calculator</h1>
                <p className="text-sm text-muted-foreground">Professional pricing estimation for FDM & Resin printing</p>
              </div>
            </div>
            <NavLink to="/settings">Settings</NavLink>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 relative">
        <div className="grid lg:grid-cols-[1fr_380px] gap-8">
          {/* Calculator Section */}
          <div className="space-y-6 animate-fade-in">
            <Card className="shadow-elevated border-border bg-card overflow-hidden hover-glow">
              <Tabs defaultValue="fdm" className="w-full">
                <div className="border-b border-border px-6 pt-6">
                  <TabsList className="bg-secondary/50 p-1.5 rounded-xl">
                    <TabsTrigger 
                      value="fdm" 
                      className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card rounded-lg px-6 py-2.5 transition-all duration-200"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      FDM Printing
                    </TabsTrigger>
                    <TabsTrigger 
                      value="resin" 
                      className="data-[state=active]:bg-gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-card rounded-lg px-6 py-2.5 transition-all duration-200"
                    >
                      <Printer className="w-4 h-4 mr-2" />
                      Resin Printing
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="fdm" className="p-6 mt-0 animate-fade-in">
                  <FDMCalculatorTable onCalculate={setQuoteData} />
                </TabsContent>

                <TabsContent value="resin" className="p-6 mt-0 animate-fade-in">
                  <ResinCalculatorTable onCalculate={setQuoteData} />
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
              quotes={savedQuotes} 
              onDeleteQuote={handleDeleteQuote}
              onUpdateNotes={handleUpdateQuoteNotes}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;