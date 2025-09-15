import { GlassCard } from "@/components/ui/glass-card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, formatNumber } from "@/lib/supabase";
import { Users, Mail, DollarSign, TrendingUp, Building } from "lucide-react";

interface StatsCardsProps {
  stats: {
    totalLeads: number;
    verifiedEmailsPercent: number;
    totalFunding: number;
    avgAnnualRevenue: number;
    medianEmployees: number;
  } | null;
  isLoading: boolean;
}

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  const statsData = [
    {
      title: "Total Leads",
      value: stats?.totalLeads,
      formatter: formatNumber,
      icon: Users,
      gradient: "from-blue-500/20 to-cyan-500/20",
    },
    {
      title: "Verified Emails",
      value: stats?.verifiedEmailsPercent,
      formatter: (v: number) => `${v.toFixed(1)}%`,
      icon: Mail,
      gradient: "from-green-500/20 to-emerald-500/20",
    },
    {
      title: "Total Funding",
      value: stats?.totalFunding,
      formatter: formatCurrency,
      icon: DollarSign,
      gradient: "from-purple-500/20 to-pink-500/20",
    },
    {
      title: "Avg Revenue",
      value: stats?.avgAnnualRevenue,
      formatter: formatCurrency,
      icon: TrendingUp,
      gradient: "from-orange-500/20 to-red-500/20",
    },
    {
      title: "Median Employees",
      value: stats?.medianEmployees,
      formatter: formatNumber,
      icon: Building,
      gradient: "from-indigo-500/20 to-blue-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        
        return (
          <GlassCard key={stat.title} className="p-4 hover:glow-secondary transition-smooth">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                {isLoading ? (
                  <Skeleton className="h-7 w-16" />
                ) : (
                  <p className="text-2xl font-bold gradient-text">
                    {stat.value !== undefined && stat.value !== null 
                      ? stat.formatter(stat.value) 
                      : 'N/A'
                    }
                  </p>
                )}
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} glass`}>
                <Icon className="h-5 w-5 text-foreground" />
              </div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}