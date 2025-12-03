import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Trash2, FileSpreadsheet } from "lucide-react";
import { QuoteData } from "@/pages/Index";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface SavedQuotesTableProps {
  quotes: QuoteData[];
  onDeleteQuote: (index: number) => void;
}

const SavedQuotesTable = ({ quotes, onDeleteQuote }: SavedQuotesTableProps) => {
  const exportToExcel = () => {
    if (quotes.length === 0) {
      toast.error("No quotes to export");
      return;
    }

    const exportData = quotes.map((quote, index) => ({
      "S.No": index + 1,
      "Project Name": quote.projectName,
      "Print Type": quote.printType,
      "Colour": quote.printColour,
      "Material": quote.parameters.materialName,
      "Machine": quote.parameters.machineName,
      "Material Cost (₹)": quote.materialCost.toFixed(2),
      "Machine Time Cost (₹)": quote.machineTimeCost.toFixed(2),
      "Electricity Cost (₹)": quote.electricityCost.toFixed(2),
      "Labor Cost (₹)": quote.laborCost.toFixed(2),
      "Overhead Cost (₹)": quote.overheadCost.toFixed(2),
      "Subtotal (₹)": quote.subtotal.toFixed(2),
      "Markup (₹)": quote.markup.toFixed(2),
      "Total Price (₹)": quote.totalPrice.toFixed(2),
      "Created At": quote.createdAt ? new Date(quote.createdAt).toLocaleString() : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quotes");

    // Auto-size columns
    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `3d-print-quotes-${Date.now()}.xlsx`);
    toast.success("Quotes exported to Excel!");
  };

  if (quotes.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-elevated bg-card overflow-hidden">
      <div className="bg-gradient-primary p-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-primary-foreground">Saved Quotes</h2>
        <Button
          onClick={exportToExcel}
          variant="secondary"
          size="sm"
          className="bg-background/20 hover:bg-background/30 text-primary-foreground"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">S.No</TableHead>
              <TableHead>Project Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Colour</TableHead>
              <TableHead>Material</TableHead>
              <TableHead>Machine</TableHead>
              <TableHead className="text-right">Total (₹)</TableHead>
              <TableHead className="text-right">Date</TableHead>
              <TableHead className="w-12">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell className="font-medium">{quote.projectName}</TableCell>
                <TableCell>{quote.printType}</TableCell>
                <TableCell>{quote.printColour}</TableCell>
                <TableCell>{quote.parameters.materialName}</TableCell>
                <TableCell>{quote.parameters.machineName}</TableCell>
                <TableCell className="text-right font-semibold">₹{quote.totalPrice.toFixed(2)}</TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "-"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteQuote(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default SavedQuotesTable;