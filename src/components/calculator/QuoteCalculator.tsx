import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calculator, Sparkles } from "lucide-react";

interface QuoteCalculatorProps {
  loading: boolean;
  onCalculate: () => void;
  children: React.ReactNode;
  uploadSection?: React.ReactNode;
}

export const QuoteCalculator = memo(({ loading, onCalculate, children, uploadSection }: QuoteCalculatorProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <Sparkles className="w-8 h-8 text-primary animate-spin" />
          <span className="text-muted-foreground">Loading calculator...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {uploadSection}

      <div className="border border-border rounded-xl overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-1/3 font-semibold">Parameter</TableHead>
              <TableHead className="font-semibold">Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{children}</TableBody>
        </Table>
      </div>

      <Button
        onClick={onCalculate}
        className="w-full bg-gradient-accent hover:opacity-90 transition-all shadow-elevated hover:shadow-card text-accent-foreground font-semibold"
        size="lg"
      >
        <Calculator className="w-5 h-5 mr-2" />
        Calculate Quote
      </Button>
    </div>
  );
});

QuoteCalculator.displayName = "QuoteCalculator";
