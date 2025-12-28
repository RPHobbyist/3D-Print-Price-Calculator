import { memo, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FileText, Download, Save, Sparkles, FileDown } from "lucide-react";
import { QuoteData } from "@/types/quote";
import { toast } from "sonner";
import { useCurrency } from "@/components/CurrencyProvider";
import { printQuotePDF } from "@/lib/pdfGenerator";

interface QuoteSummaryProps {
  quoteData: QuoteData | null;
  onSaveQuote: (quote: QuoteData) => void;
}

const QuoteSummary = memo(({ quoteData, onSaveQuote }: QuoteSummaryProps) => {
  const { currency, formatPrice } = useCurrency();

  const handleExport = useCallback(() => {
    if (!quoteData) return;

    const quoteText = `
3D PRINT QUOTE - ${quoteData.printType} Printing
==========================================
Project: ${quoteData.projectName}
Colour: ${quoteData.printColour || "N/A"}

COST BREAKDOWN:
- Material Cost:        ${formatPrice(quoteData.materialCost)}
- Machine Time:         ${formatPrice(quoteData.machineTimeCost)}
- Electricity:          ${formatPrice(quoteData.electricityCost)}
- Labor:                ${formatPrice(quoteData.laborCost)}
- Overhead:             ${formatPrice(quoteData.overheadCost)}

SUBTOTAL:               ${formatPrice(quoteData.subtotal)}
Profit Markup:          ${formatPrice(quoteData.markup)}

==========================================
TOTAL PRICE:            ${formatPrice(quoteData.totalPrice)}
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
  }, [quoteData, formatPrice]);

  const handleSave = useCallback(() => {
    if (!quoteData) return;
    onSaveQuote(quoteData);
  }, [quoteData, onSaveQuote]);

  const handlePDF = useCallback(() => {
    if (!quoteData) return;
    try {
      printQuotePDF(quoteData, currency.symbol);
      toast.success("PDF opened for printing. Use 'Save as PDF' in print dialog.");
    } catch (error) {
      console.error("PDF error:", error);
      toast.error("Failed to generate PDF. Please allow popups.");
    }
  }, [quoteData, currency.symbol]);

  if (!quoteData) {
    return (
      <Card className="p-6 shadow-card bg-card border-dashed border-2 border-border animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gradient-subtle rounded-2xl p-5 mb-5 shadow-card">
            <FileText className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No Quote Yet</h3>
          <p className="text-sm text-muted-foreground max-w-[200px]">
            Fill in the parameters and click Calculate to generate a quote
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="shadow-elevated bg-card overflow-hidden animate-scale-in hover-glow">
      <div className="bg-gradient-primary p-6 text-primary-foreground relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-foreground/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 animate-pulse-soft" />
            <h2 className="text-xl font-bold">Quote Summary</h2>
          </div>
          <p className="text-sm opacity-90 font-medium">{quoteData.printType} Printing</p>
          <p className="text-sm opacity-75 mt-1">Project: {quoteData.projectName}</p>
          {quoteData.printColour && (
            <p className="text-sm opacity-65">Colour: {quoteData.printColour}</p>
          )}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Cost Breakdown */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wide">Cost Breakdown</h3>

          <div className="space-y-2.5 text-sm">
            <CostRow label="Material Cost" value={quoteData.materialCost} />
            <CostRow label="Machine Time" value={quoteData.machineTimeCost} />
            {quoteData.electricityCost > 0 && (
              <CostRow label="Electricity" value={quoteData.electricityCost} />
            )}
            {quoteData.laborCost > 0 && (
              <CostRow label="Labor" value={quoteData.laborCost} />
            )}
            {quoteData.overheadCost > 0 && (
              <CostRow label="Overhead" value={quoteData.overheadCost} />
            )}
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between text-sm">
            <span className="font-medium text-foreground">Subtotal</span>
            <span className="font-semibold text-foreground">{formatPrice(quoteData.subtotal)}</span>
          </div>

          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Profit Markup</span>
            <span className="font-medium text-foreground">+{formatPrice(quoteData.markup)}</span>
          </div>

          {quoteData.quantity > 1 && (
            <>
              <Separator className="my-4" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Quantity</span>
                <span className="font-medium text-foreground">{quoteData.quantity} units</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Unit Price</span>
                <span className="font-medium text-foreground">{formatPrice(quoteData.unitPrice)}</span>
              </div>
            </>
          )}

          <Separator className="my-4" />

          {/* Total */}
          <div className="bg-gradient-accent rounded-xl p-4 shadow-card">
            <div className="flex justify-between items-center">
              <span className="text-accent-foreground font-semibold">
                {quoteData.quantity > 1 ? `Total (${quoteData.quantity} units)` : 'Total Price'}
              </span>
              <span className="text-2xl font-bold text-accent-foreground">
                {formatPrice(quoteData.totalPrice)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <Button
            onClick={handleSave}
            className="w-full bg-gradient-primary hover:opacity-90 transition-all shadow-card hover:shadow-elevated"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Quote
          </Button>

          <Button
            onClick={handlePDF}
            variant="outline"
            className="w-full hover:bg-secondary transition-colors"
          >
            <FileDown className="w-4 h-4 mr-2" />
            Export as PDF
          </Button>

          <Button
            onClick={handleExport}
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground hover:text-foreground"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as Text
          </Button>
        </div>
      </div>
    </Card>
  );
});

QuoteSummary.displayName = "QuoteSummary";

const CostRow = memo(({ label, value }: { label: string; value: number }) => {
  const { formatPrice } = useCurrency();
  return (
    <div className="flex justify-between text-muted-foreground group">
      <span className="group-hover:text-foreground transition-colors">{label}</span>
      <span className="font-medium text-foreground tabular-nums">{formatPrice(value)}</span>
    </div>
  );
});

CostRow.displayName = "CostRow";

export default QuoteSummary;
