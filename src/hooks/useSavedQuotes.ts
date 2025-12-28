import { useState, useEffect, useCallback, useMemo } from "react";
import { QuoteData, QuoteStats } from "@/types/quote";
import { toast } from "sonner";
import * as sessionStore from "@/lib/sessionStorage";

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

export const useSavedQuotes = (): UseSavedQuotesReturn => {
  const [quotes, setQuotes] = useState<QuoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchQuotes = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = sessionStore.getQuotes();
      setQuotes(data);
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
      const newQuote = sessionStore.saveQuote(quote);
      setQuotes(prev => [newQuote, ...prev]);
      toast.success("Quote saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save quote");
      throw err;
    }
  }, []);

  const deleteQuote = useCallback(async (id: string) => {
    try {
      sessionStore.deleteQuote(id);
      setQuotes(prev => prev.filter(q => q.id !== id));
      toast.success("Quote deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete quote");
      throw err;
    }
  }, []);

  const updateNotes = useCallback(async (id: string, notes: string) => {
    try {
      sessionStore.updateQuoteNotes(id, notes);
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
