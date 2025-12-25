import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/components/CurrencyProvider";
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import SavedQuotes from "./pages/SavedQuotes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <CurrencyProvider>
        <HashRouter> {/* Changed BrowserRouter to HashRouter */}
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/saved-quotes" element={<SavedQuotes />} /> {/* Added new route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </HashRouter> {/* Changed BrowserRouter to HashRouter */}
      </CurrencyProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
