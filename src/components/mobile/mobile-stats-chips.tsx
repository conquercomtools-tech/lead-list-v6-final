import { TrendingUp, Users, DollarSign, Mail } from "lucide-react";
import { formatCurrency, formatNumber } from "@/lib/supabase";

interface MobileStatsChipsProps {
  stats: {
    totalLeads: number;
    verifiedEmailsPercent: number;
    totalFunding: number;
    avgAnnualRevenue: number;
    medianEmployees: number;
  } | null;
  isLoading: boolean;
}

export function MobileStatsChips({ stats, isLoading }: MobileStatsChipsProps) {
  if (isLoading || !stats) {
    return (
      <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div 
            key={i} 
            className="snap-start shrink-0 rounded-xl bg-white/5 border border-white/10 p-3 w-32 h-16 animate-pulse"
          />
        ))}
      </div>
    );
  }

  const chips = [
    {
      icon: Users,
      label: "Total Leads",
      value: stats.totalLeads.toLocaleString(),
    },
    {
      icon: Mail,
      label: "Verified Emails",
      value: `${stats.verifiedEmailsPercent.toFixed(1)}%`,
    },
    {
      icon: DollarSign,
      label: "Total Funding",
      value: formatCurrency(stats.totalFunding),
    },
    {
      icon: TrendingUp,
      label: "Avg Revenue",
      value: formatCurrency(stats.avgAnnualRevenue),
    },
    {
      icon: Users,
      label: "Median Employees",
      value: formatNumber(stats.medianEmployees),
    },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6">
      {chips.map((chip, index) => {
        const Icon = chip.icon;
        return (
          <div
            key={index}
            className="snap-start shrink-0 rounded-xl bg-white/5 border border-white/10 p-3 min-w-[120px] backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className="h-4 w-4 text-primary" />
              <span className="text-xs text-white/70">{chip.label}</span>
            </div>
            <div className="text-sm font-semibold text-white truncate">
              {chip.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}