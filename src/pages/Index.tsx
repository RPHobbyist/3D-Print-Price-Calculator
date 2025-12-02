import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Printer } from "lucide-react";
import FDMCalculator from "@/components/FDMCalculator";
import ResinCalculator from "@/components/ResinCalculator";
import QuoteSummary from "@/components/QuoteSummary";

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
  parameters: Record<string, any>;
}

const Index = () => {
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-accent p-3 rounded-xl shadow-card">
              <Calculator className="w-6 h-6 text-accent-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">3D Print Quote Calculator</h1>
              <p className="text-sm text-muted-foreground">Professional pricing estimation for FDM & Resin printing</p>
            </div>
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
                  <FDMCalculator onCalculate={setQuoteData} />
                </TabsContent>

                <TabsContent value="resin" className="p-6 mt-0">
                  <ResinCalculator onCalculate={setQuoteData} />
                </TabsContent>
              </Tabs>
            </Card>
          </div>

          {/* Quote Summary Section */}
          <div className="lg:sticky lg:top-24 h-fit">
            <QuoteSummary quoteData={quoteData} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
