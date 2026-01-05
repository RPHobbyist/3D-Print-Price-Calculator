import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { BatchQuoteProvider } from "@/contexts/BatchQuoteContext";
import { ProductionProvider } from "@/contexts/ProductionContext";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import { useAppProtection } from "@/hooks/useAppProtection";

// Lazy load pages for code splitting
const Index = lazy(() => import("./pages/Index"));
const Settings = lazy(() => import("./pages/Settings"));
const SavedQuotes = lazy(() => import("./pages/SavedQuotes"));
const PrintManagement = lazy(() => import("./pages/PrintManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

// Configure QueryClient with optimized defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App = () => {
  // Enable UI protection (disable context menu, F12, etc.)
  // useAppProtection();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CurrencyProvider>
          <BatchQuoteProvider>
            <ProductionProvider>
              <HashRouter>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/saved-quotes" element={<SavedQuotes />} />
                    <Route path="/print-management" element={<PrintManagement />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </HashRouter>
            </ProductionProvider>
          </BatchQuoteProvider>
        </CurrencyProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );

};

export default App;
