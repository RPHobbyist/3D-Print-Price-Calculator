import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Save } from "lucide-react";
import { QuoteData } from "@/pages/Index";
import { toast } from "sonner";

interface QuoteSummaryProps {
  quoteData: QuoteData | null;
  onSaveQuote: (quote: QuoteData) => void;
}

const QuoteSummary = ({ quoteData, onSaveQuote }: QuoteSummaryProps) => {
  const handleExport = () => {
    if (!quoteData) return;

    const quoteText = `
3D PRINT QUOTE - ${quoteData.printType} Printing
==========================================
Project: ${quoteData.projectName}
Colour: ${quoteData.printColour || "N/A"}

COST BREAKDOWN:
- Material Cost:        ₹${quoteData.materialCost.toFixed(2)}
- Machine Time:         ₹${quoteData.machineTimeCost.toFixed(2)}
- Electricity:          ₹${quoteData.electricityCost.toFixed(2)}
- Labor:                ₹${quoteData.laborCost.toFixed(2)}
- Overhead:             ₹${quoteData.overheadCost.toFixed(2)}

SUBTOTAL:               ₹${quoteData.subtotal.toFixed(2)}
Profit Markup:          ₹${quoteData.markup.toFixed(2)}

==========================================
TOTAL PRICE:            ₹${quoteData.totalPrice.toFixed(2)}
==========================================

Generated: ${new Date().toLocaleString()}
    `.trim();

    const blob = new Blob([quoteText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quote-${quoteData.projectName}-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Quote exported successfully!");
  };

  const handleSave = () => {
    if (!quoteData) return;
    onSaveQuote(quoteData);
    toast.success("Quote saved successfully!");
  };

  if (!quoteData) {
    return (
      <Card className="p-6 shadow-card bg-card">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-secondary rounded-full p-4 mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Quote Yet</h3>
          <p className="text-sm text-muted-foreground">
            Fill in the parameters and click Calculate to generate a quote
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated bg-card overflow-hidden">
      <div className="bg-gradient-primary p-6 text-primary-foreground">
        <h2 className="text-2xl font-bold mb-1">Quote Summary</h2>
        <p className="text-sm opacity-90">{quoteData.printType} Printing - {quoteData.projectName}</p>
        {quoteData.printColour && (
          <p className="text-sm opacity-75">Colour: {quoteData.printColour}</p>
        )}
      </div>

      <div className="p-6 space-y-6">
        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground">Cost Breakdown</h3>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Material Cost</span>
              <span className="font-medium text-foreground">₹{quoteData.materialCost.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between text-muted-foreground">
              <span>Machine Time</span>
              <span className="font-medium text-foreground">₹{quoteData.machineTimeCost.toFixed(2)}</span>
            </div>
            
            {quoteData.electricityCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Electricity</span>
                <span className="font-medium text-foreground">₹{quoteData.electricityCost.toFixed(2)}</span>
              </div>
            )}
            
            {quoteData.laborCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Labor</span>
                <span className="font-medium text-foreground">₹{quoteData.laborCost.toFixed(2)}</span>
              </div>
            )}
            
            {quoteData.overheadCost > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Overhead</span>
                <span className="font-medium text-foreground">₹{quoteData.overheadCost.toFixed(2)}</span>
              </div>
            )}
          </div>

          <Separator />

          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Subtotal</span>
            <span className="font-semibold text-foreground">₹{quoteData.subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Profit Markup</span>
            <span className="font-medium text-foreground">₹{quoteData.markup.toFixed(2)}</span>
          </div>

          <Separator />

          {/* Total */}
          <div className="bg-gradient-accent rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-accent-foreground font-semibold">Total Price</span>
              <span className="text-2xl font-bold text-accent-foreground">
                ₹{quoteData.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <Button 
            onClick={handleSave} 
            className="w-full bg-gradient-primary hover:opacity-90"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Quote
          </Button>
          
          <Button 
            onClick={handleExport} 
            variant="outline" 
            className="w-full"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Quote
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default QuoteSummary;