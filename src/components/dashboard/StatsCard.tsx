import { memo } from "react";
import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "accent";
}

export const StatsCard = memo(({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatsCardProps) => {
  const bgClass = {
    default: "bg-card",
    primary: "bg-gradient-primary",
    accent: "bg-gradient-accent",
  }[variant];

  const textClass = variant === "default" ? "text-foreground" : "text-primary-foreground";
  const subtitleClass = variant === "default" ? "text-muted-foreground" : "text-primary-foreground/80";

  return (
    <Card className={`p-5 ${bgClass} shadow-card hover-lift border-border overflow-hidden relative`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className={`text-sm font-medium ${subtitleClass}`}>{title}</p>
          <p className={`text-2xl font-bold ${textClass} tabular-nums`}>{value}</p>
          {subtitle && (
            <p className={`text-xs ${subtitleClass}`}>{subtitle}</p>
          )}
          {trend && (
            <p className={`text-xs font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% this week
            </p>
          )}
        </div>
        <div className={`p-3 rounded-xl ${variant === "default" ? "bg-primary/10" : "bg-primary-foreground/10"}`}>
          <Icon className={`w-5 h-5 ${variant === "default" ? "text-primary" : "text-primary-foreground"}`} />
        </div>
      </div>
    </Card>
  );
});

StatsCard.displayName = "StatsCard";
