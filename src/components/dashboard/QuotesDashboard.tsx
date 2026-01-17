import { memo } from "react";
import { QuoteStats } from "@/types/quote";
import { StatsCard } from "./StatsCard";
import { FileText, TrendingUp, Printer, Clock } from "lucide-react";
import { useCurrency } from "@/components/shared/CurrencyProvider";

interface QuotesDashboardProps {
  stats: QuoteStats;
}

export const QuotesDashboard = memo(({ stats }: QuotesDashboardProps) => {
  const { currency } = useCurrency();

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
      <StatsCard
        title="Total Quotes"
        value={stats.totalQuotes}
        subtitle={`${stats.recentQuotes} this week`}
        icon={FileText}
      />
      <StatsCard
        title="Total Revenue"
        value={`${currency.symbol}${stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
        icon={TrendingUp}
        variant="primary"
      />
      <StatsCard
        title="Avg Quote Value"
        value={`${currency.symbol}${stats.avgQuoteValue.toFixed(0)}`}
        icon={Clock}
      />
      <StatsCard
        title="Print Types"
        value={`${stats.fdmCount}/${stats.resinCount}`}
        subtitle="FDM / Resin"
        icon={Printer}
        variant="accent"
      />
    </div>
  );
});

QuotesDashboard.displayName = "QuotesDashboard";
