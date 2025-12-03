import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, FileSpreadsheet, Edit, Eye } from "lucide-react";
import { QuoteData } from "@/pages/Index";
import { toast } from "sonner";
import * as XLSX from "xlsx";

interface SavedQuotesTableProps {
  quotes: QuoteData[];
  onDeleteQuote: (index: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
}

const SavedQuotesTable = ({ quotes, onDeleteQuote, onUpdateNotes }: SavedQuotesTableProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [viewingQuote, setViewingQuote] = useState<QuoteData | null>(null);

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
      "Notes": quote.notes || "",
      "Created At": quote.createdAt ? new Date(quote.createdAt).toLocaleString() : "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Quotes");

    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 15),
    }));
    worksheet["!cols"] = colWidths;

    XLSX.writeFile(workbook, `3d-print-quotes-${Date.now()}.xlsx`);
    toast.success("Quotes exported to Excel!");
  };

  const handleEditClick = (index: number) => {
    setEditingIndex(index);
    setEditNotes(quotes[index].notes || "");
  };

  const handleSaveNotes = () => {
    if (editingIndex !== null) {
      onUpdateNotes(editingIndex, editNotes);
      setEditingIndex(null);
      setEditNotes("");
      toast.success("Notes updated successfully!");
    }
  };

  if (quotes.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="shadow-elevated bg-card overflow-hidden">
        <div className="bg-gradient-primary p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-primary-foreground">Saved Quotes ({quotes.length})</h2>
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
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{quote.projectName}</TableCell>
                  <TableCell>{quote.printType}</TableCell>
                  <TableCell>{quote.printColour || "-"}</TableCell>
                  <TableCell>{quote.parameters.materialName}</TableCell>
                  <TableCell>{quote.parameters.machineName}</TableCell>
                  <TableCell className="text-right font-semibold">₹{quote.totalPrice.toFixed(2)}</TableCell>
                  <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                    {quote.notes || "-"}
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setViewingQuote(quote)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteQuote(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Edit Notes Dialog */}
      <Dialog open={editingIndex !== null} onOpenChange={(open) => !open && setEditingIndex(null)}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Edit Notes - {editingIndex !== null && quotes[editingIndex]?.projectName}</DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Add additional details or notes for this quote..."
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            className="min-h-[120px] bg-background"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIndex(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes}>Save Notes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Quote Details Dialog */}
      <Dialog open={viewingQuote !== null} onOpenChange={(open) => !open && setViewingQuote(null)}>
        <DialogContent className="bg-card max-w-lg">
          <DialogHeader>
            <DialogTitle>Quote Details - {viewingQuote?.projectName}</DialogTitle>
          </DialogHeader>
          {viewingQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Print Type:</span>
                  <p className="font-medium">{viewingQuote.printType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Colour:</span>
                  <p className="font-medium">{viewingQuote.printColour || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Material:</span>
                  <p className="font-medium">{viewingQuote.parameters.materialName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Machine:</span>
                  <p className="font-medium">{viewingQuote.parameters.machineName}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <h4 className="font-semibold">Cost Breakdown</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Material Cost:</span>
                  <span className="text-right">₹{viewingQuote.materialCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Machine Time:</span>
                  <span className="text-right">₹{viewingQuote.machineTimeCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Electricity:</span>
                  <span className="text-right">₹{viewingQuote.electricityCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Labor:</span>
                  <span className="text-right">₹{viewingQuote.laborCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Overhead:</span>
                  <span className="text-right">₹{viewingQuote.overheadCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-right">₹{viewingQuote.subtotal.toFixed(2)}</span>
                  <span className="text-muted-foreground">Markup:</span>
                  <span className="text-right">₹{viewingQuote.markup.toFixed(2)}</span>
                  <span className="font-semibold">Total Price:</span>
                  <span className="text-right font-bold text-lg">₹{viewingQuote.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              {viewingQuote.notes && (
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{viewingQuote.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SavedQuotesTable;