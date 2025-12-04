import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, FileSpreadsheet, Edit, Eye, Database } from "lucide-react";
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
    return (
      <Card className="p-8 shadow-card bg-card border-dashed border-2 border-border">
        <div className="flex flex-col items-center justify-center text-center gap-4">
          <div className="p-4 bg-muted rounded-full">
            <Database className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">No Saved Quotes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Calculate and save quotes to see them here. All quotes are stored permanently.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-elevated bg-card overflow-hidden border-border">
        <div className="bg-gradient-primary p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-primary-foreground" />
            <h2 className="text-xl font-bold text-primary-foreground">Saved Quotes ({quotes.length})</h2>
          </div>
          <Button
            onClick={exportToExcel}
            variant="secondary"
            size="sm"
            className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12 font-semibold">S.No</TableHead>
                <TableHead className="font-semibold">Project Name</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold">Colour</TableHead>
                <TableHead className="font-semibold">Material</TableHead>
                <TableHead className="font-semibold">Machine</TableHead>
                <TableHead className="text-right font-semibold">Total (₹)</TableHead>
                <TableHead className="font-semibold">Notes</TableHead>
                <TableHead className="text-right font-semibold">Date</TableHead>
                <TableHead className="w-28 font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotes.map((quote, index) => (
                <TableRow key={quote.id || index} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                  <TableCell className="font-semibold text-foreground">{quote.projectName}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      quote.printType === "FDM" 
                        ? "bg-primary/10 text-primary" 
                        : "bg-accent/10 text-accent"
                    }`}>
                      {quote.printType}
                    </span>
                  </TableCell>
                  <TableCell>{quote.printColour || "-"}</TableCell>
                  <TableCell className="text-sm">{quote.parameters.materialName}</TableCell>
                  <TableCell className="text-sm">{quote.parameters.machineName}</TableCell>
                  <TableCell className="text-right font-bold text-foreground">₹{quote.totalPrice.toFixed(2)}</TableCell>
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
                        className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(index)}
                        className="text-muted-foreground hover:text-accent hover:bg-accent/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteQuote(index)}
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
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
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit Notes - {editingIndex !== null && quotes[editingIndex]?.projectName}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Add additional details or notes for this quote..."
            value={editNotes}
            onChange={(e) => setEditNotes(e.target.value)}
            className="min-h-[120px] bg-background border-input"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingIndex(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} className="bg-gradient-primary text-primary-foreground">
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Quote Details Dialog */}
      <Dialog open={viewingQuote !== null} onOpenChange={(open) => !open && setViewingQuote(null)}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">Quote Details - {viewingQuote?.projectName}</DialogTitle>
          </DialogHeader>
          {viewingQuote && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Print Type:</span>
                  <p className="font-medium text-foreground">{viewingQuote.printType}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Colour:</span>
                  <p className="font-medium text-foreground">{viewingQuote.printColour || "-"}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Material:</span>
                  <p className="font-medium text-foreground">{viewingQuote.parameters.materialName}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Machine:</span>
                  <p className="font-medium text-foreground">{viewingQuote.parameters.machineName}</p>
                </div>
              </div>

              <div className="border-t border-border pt-4 space-y-3">
                <h4 className="font-semibold text-foreground">Cost Breakdown</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Material Cost:</span>
                  <span className="text-right text-foreground">₹{viewingQuote.materialCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Machine Time:</span>
                  <span className="text-right text-foreground">₹{viewingQuote.machineTimeCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Electricity:</span>
                  <span className="text-right text-foreground">₹{viewingQuote.electricityCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Labor:</span>
                  <span className="text-right text-foreground">₹{viewingQuote.laborCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Overhead:</span>
                  <span className="text-right text-foreground">₹{viewingQuote.overheadCost.toFixed(2)}</span>
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="text-right text-foreground">₹{viewingQuote.subtotal.toFixed(2)}</span>
                  <span className="text-muted-foreground">Markup:</span>
                  <span className="text-right text-foreground">₹{viewingQuote.markup.toFixed(2)}</span>
                </div>
                <div className="bg-gradient-accent rounded-lg p-4 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-accent-foreground">Total Price:</span>
                    <span className="text-2xl font-bold text-accent-foreground">₹{viewingQuote.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {viewingQuote.notes && (
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold mb-2 text-foreground">Notes</h4>
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