import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuoteData, QuoteStats } from "@/types/quote";
import { toast } from "sonner";

interface UseSavedQuotesReturn {
  quotes: QuoteData[];
  loading: boolean;
  error: string | null;
  stats: QuoteStats;
  saveQuote: (quote: QuoteData) => Promise<void>;
  deleteQuote: (id: string) => Promise<void>;
  updateNotes: (id: string, notes: string) => Promise<void>;
  duplicateQuote: (quote: QuoteData) => Promise<void>;
  refetch: () => Promise<void>;
}

const mapRowToQuote = (row: any): QuoteData => ({
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
  parameters: typeof row.parameters === 'object' && row.parameters !== null ? row.parameters : {},
  createdAt: row.created_at,
  notes: row.notes || "",
});

export const useSavedQuotes = (): UseSavedQuotesReturn => {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("saved_quotes")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setQuotes((data || []).map(mapRowToQuote));
    } catch (err: any) {
      const errorMessage = err.message || "Failed to load saved quotes";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  const stats = useMemo((): QuoteStats => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const totalRevenue = quotes.reduce((sum, q) => sum + q.totalPrice, 0);
    const recentQuotes = quotes.filter(q => 
      q.createdAt && new Date(q.createdAt) >= weekAgo
    ).length;

    return {
      totalQuotes: quotes.length,
      totalRevenue,
      avgQuoteValue: quotes.length > 0 ? totalRevenue / quotes.length : 0,
      fdmCount: quotes.filter(q => q.printType === "FDM").length,
      resinCount: quotes.filter(q => q.printType === "Resin").length,
      recentQuotes,
    };
  }, [quotes]);

  const saveQuote = useCallback(async (quote: QuoteData) => {
    try {
      const { data, error: insertError } = await supabase
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
          notes: quote.notes || "",
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setQuotes(prev => [mapRowToQuote(data), ...prev]);
      toast.success("Quote saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save quote");
      throw err;
    }
  }, []);

  const deleteQuote = useCallback(async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from("saved_quotes")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      setQuotes(prev => prev.filter(q => q.id !== id));
      toast.success("Quote deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete quote");
      throw err;
    }
  }, []);

  const updateNotes = useCallback(async (id: string, notes: string) => {
    try {
      const { error: updateError } = await supabase
        .from("saved_quotes")
        .update({ notes })
        .eq("id", id);

      if (updateError) throw updateError;

      setQuotes(prev => 
        prev.map(q => q.id === id ? { ...q, notes } : q)
      );
      toast.success("Notes updated successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to update notes");
      throw err;
    }
  }, []);

  const duplicateQuote = useCallback(async (quote: QuoteData) => {
    const duplicatedQuote: QuoteData = {
      ...quote,
      id: undefined,
      projectName: `${quote.projectName} (Copy)`,
      createdAt: undefined,
      notes: "",
    };
    await saveQuote(duplicatedQuote);
  }, [saveQuote]);

  return {
    quotes,
    loading,
    error,
    stats,
    saveQuote,
    deleteQuote,
    updateNotes,
    duplicateQuote,
    refetch: fetchQuotes,
  };
};
