import { useState, memo, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, FileSpreadsheet, Edit, Eye, Database, AlertTriangle, Copy, Printer, Search } from "lucide-react";
import { PrintJobDialog } from "@/components/print-management/PrintJobDialog";
import { QuoteData } from "@/types/quote";
import { BambuDevice, PrinterConnection, PrintOptions } from "@/types/printer";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { useCurrency } from "@/components/CurrencyProvider";

// New Hooks & Components
import { useQuotesFilter } from "@/hooks/useQuotesFilter";
import { QuotesToolbar } from "@/components/saved-quotes/QuotesToolbar";
import { QuoteDetailsDialog } from "@/components/saved-quotes/QuoteDetailsDialog";

interface SavedQuotesTableProps {
  quotes: QuoteData[];
  onDeleteQuote: (index: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  onDuplicateQuote?: (index: number) => void;
}

const SavedQuotesTable = memo(({ quotes, onDeleteQuote, onUpdateNotes, onDuplicateQuote }: SavedQuotesTableProps) => {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [viewingQuote, setViewingQuote] = useState<QuoteData | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const [sendingQuote, setSendingQuote] = useState<QuoteData | null>(null);
  const [printers, setPrinters] = useState<BambuDevice[]>([]);
  const [connections, setConnections] = useState<Record<string, PrinterConnection>>({});

  // Use Custom Hook for Filtering & Sorting
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    sortOrder,
    setSortOrder,
    filteredAndSortedQuotes
  } = useQuotesFilter(quotes);

  const fetchPrinters = useCallback(async () => {
    if ('electronAPI' in window) {
      try {
        const devices = await window.electronAPI.bambu.getDevices();
        setPrinters(devices);
        const conns = await window.electronAPI.printer.getConnectedPrinters();
        const connMap = conns.reduce((acc: Record<string, PrinterConnection>, c: PrinterConnection) => ({ ...acc, [c.serial]: c }), {});
        setConnections(connMap);
      } catch (e) {
        console.error("Failed to fetch printers", e);
      }
    }
  }, []);

  useEffect(() => {
    if (sendingQuote) {
      fetchPrinters();
    }
  }, [sendingQuote, fetchPrinters]);

  const handleSendFileConfirm = async (machineId: string, fileOrPath: File | string, options: PrintOptions) => {
    const conn = connections[machineId];
    if (!conn) {
      toast.error("Printer not connected");
      return;
    }

    try {
      const filePath = typeof fileOrPath === 'string' ? fileOrPath : (fileOrPath as File & { path: string }).path;

      toast.info("Uploading file...");
      await window.electronAPI.printer.sendFile({ ip: conn.ip, filePath });

      toast.info(`Starting print...`);
      await window.electronAPI.printer.startPrint({ ip: conn.ip, fileName: filePath, options });

      toast.success("Print started successfully!");
      setSendingQuote(null);
    } catch (error) {
      const err = error as Error;
      console.error(err);
      toast.error(`Error: ${err.message}`);
    }
  };

  const { currency, formatPrice } = useCurrency();

  const exportToExcel = useCallback(() => {
    if (quotes.length === 0) {
      toast.error("No quotes to export");
      return;
    }

    const exportData = quotes.map((quote, index) => ({
      "S.No": index + 1,
      "Project Name": quote.projectName,
      "Client": quote.clientName || "",
      "Print Type": quote.printType,
      "Colour": quote.printColour,
      "Material": quote.parameters.materialName,
      "Machine": quote.parameters.machineName,
      "Material Cost": formatPrice(quote.materialCost),
      "Machine Time Cost": formatPrice(quote.machineTimeCost),
      "Electricity Cost": formatPrice(quote.electricityCost),
      "Labor Cost": formatPrice(quote.laborCost),
      "Consumables Cost": quote.parameters.consumablesTotal ? formatPrice(quote.parameters.consumablesTotal) : formatPrice(0),
      "Overhead Cost": formatPrice(quote.overheadCost),
      "Subtotal": formatPrice(quote.subtotal),
      "Markup": formatPrice(quote.markup),
      "Total Price": formatPrice(quote.totalPrice),
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
  }, [quotes, formatPrice]);

  const handleEditClick = useCallback((index: number) => {
    setEditingIndex(index);
    setEditNotes(quotes[index].notes || "");
  }, [quotes]);

  const handleSaveNotes = useCallback(() => {
    if (editingIndex !== null) {
      onUpdateNotes(editingIndex, editNotes);
      setEditingIndex(null);
      setEditNotes("");
    }
  }, [editingIndex, editNotes, onUpdateNotes]);

  const handleDeleteConfirm = useCallback(() => {
    if (deleteIndex !== null) {
      onDeleteQuote(deleteIndex);
      setDeleteIndex(null);
    }
  }, [deleteIndex, onDeleteQuote]);

  if (quotes.length === 0) {
    return (
      <Card className="p-10 shadow-card bg-card border-dashed border-2 border-border animate-fade-in">
        <div className="flex flex-col items-center justify-center text-center gap-5">
          <div className="p-5 bg-gradient-subtle rounded-2xl shadow-card">
            <Database className="w-10 h-10 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">No Saved Quotes</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm">
              Calculate and save quotes to see them here. All quotes are stored permanently in the database.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-elevated bg-card overflow-hidden border-border animate-fade-in">
        <div className="bg-gradient-primary p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Database className="w-5 h-5 text-primary-foreground" />
            <h2 className="text-xl font-bold text-primary-foreground">
              Saved Quotes
              <span className="ml-2 text-sm font-normal opacity-75">
                ({filteredAndSortedQuotes.length} / {quotes.length})
              </span>
            </h2>
          </div>
          <Button
            onClick={exportToExcel}
            variant="secondary"
            size="sm"
            className="bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground border-0 shadow-card whitespace-nowrap"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Export to Excel
          </Button>
        </div>

        {/* New Quotes Toolbar */}
        <QuotesToolbar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          filterType={filterType}
          setFilterType={setFilterType}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-12 font-semibold text-foreground">S.No</TableHead>
                <TableHead className="font-semibold text-foreground">Project Name</TableHead>
                <TableHead className="font-semibold text-foreground">Client</TableHead>
                <TableHead className="font-semibold text-foreground">Type</TableHead>
                <TableHead className="font-semibold text-foreground">Colour</TableHead>
                <TableHead className="font-semibold text-foreground">Material</TableHead>
                <TableHead className="font-semibold text-foreground">Machine</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Total ({currency.symbol})</TableHead>
                <TableHead className="font-semibold text-foreground">Notes</TableHead>
                <TableHead className="text-right font-semibold text-foreground">Date</TableHead>
                <TableHead className="w-36 font-semibold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedQuotes.length > 0 ? (
                filteredAndSortedQuotes.map((quote, index) => {
                  const originalIndex = quotes.findIndex(q => q.id === quote.id);

                  return (
                    <TableRow
                      key={quote.id || index}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
                      <TableCell className="font-semibold text-foreground">{quote.projectName}</TableCell>
                      <TableCell className="text-muted-foreground">{quote.clientName || "-"}</TableCell>
                      <TableCell>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${quote.printType === "FDM"
                          ? "bg-primary/10 text-primary"
                          : "bg-accent/10 text-accent"
                          }`}>
                          {quote.printType}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{quote.printColour || "-"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{quote.parameters.materialName}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{quote.parameters.machineName}</TableCell>
                      <TableCell className="text-right font-bold text-foreground tabular-nums">
                        {formatPrice(quote.totalPrice)}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate text-sm text-muted-foreground">
                        {quote.notes || "-"}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                        {quote.createdAt ? new Date(quote.createdAt).toLocaleDateString() : "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setViewingQuote(quote)}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10 h-8 w-8"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {onDuplicateQuote && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (originalIndex !== -1) onDuplicateQuote(originalIndex);
                              }}
                              className="text-muted-foreground hover:text-success hover:bg-success/10 h-8 w-8"
                              title="Duplicate quote"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}

                          {quote.filePath && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSendingQuote(quote)}
                              className="text-muted-foreground hover:text-green-600 hover:bg-green-600/10 h-8 gap-1 px-2"
                              title="Print Plate"
                            >
                              <Printer className="w-4 h-4" />
                              <span className="text-xs font-medium">Print</span>
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (originalIndex !== -1) handleEditClick(originalIndex);
                            }}
                            className="text-muted-foreground hover:text-accent hover:bg-accent/10 h-8 w-8"
                            title="Edit notes"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              if (originalIndex !== -1) setDeleteIndex(originalIndex);
                            }}
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-8 w-8"
                            title="Delete quote"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>

                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={11} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Search className="w-8 h-8 mb-2 opacity-20" />
                      <p>No quotes match your search filters.</p>
                      <Button variant="link" onClick={() => { setSearchQuery(""); setFilterType("all"); }}>
                        Clear Filters
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table >
        </div >
      </Card >

      {/* Delete Confirmation Dialog */}
      < Dialog open={deleteIndex !== null} onOpenChange={(open) => !open && setDeleteIndex(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirm Delete
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Are you sure you want to delete the quote "{deleteIndex !== null && quotes[deleteIndex]?.projectName}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteIndex(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete Quote
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Edit Notes Dialog */}
      < Dialog open={editingIndex !== null} onOpenChange={(open) => !open && setEditingIndex(null)}>
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
            className="min-h-[120px] bg-background border-input focus:ring-2 focus:ring-ring"
          />
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEditingIndex(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNotes} className="bg-gradient-primary text-primary-foreground">
              Save Notes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog >

      {/* Use QuoteDetailsDialog Component */}
      <QuoteDetailsDialog
        quote={viewingQuote}
        open={viewingQuote !== null}
        onOpenChange={(open) => !open && setViewingQuote(null)}
      />

      {/* Print Job Dialog (Bambu Style) */}
      <PrintJobDialog
        open={!!sendingQuote}
        onOpenChange={(open) => !open && setSendingQuote(null)}
        job={{ quote: sendingQuote }}
        machines={printers}
        connections={connections}
        onSend={handleSendFileConfirm}
      />
    </>
  );
});

SavedQuotesTable.displayName = "SavedQuotesTable";

export default SavedQuotesTable;
