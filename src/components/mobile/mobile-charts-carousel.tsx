import { useState } from "react";
import { BarChart3, PieChart, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Lead, formatCurrency } from "@/lib/supabase";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
} from "recharts";

interface MobileChartsCarouselProps {
  leads: Lead[];
  isLoading: boolean;
}

const COLORS = ['#fb923c', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4'];

export function MobileChartsCarousel({ leads, isLoading }: MobileChartsCarouselProps) {
  const [activeChart, setActiveChart] = useState(0);

  const charts = [
    {
      key: "funding",
      label: "Funding",
      icon: BarChart3,
      title: "Top Companies by Funding",
    },
    {
      key: "revenue",
      label: "Revenue",
      icon: TrendingUp,
      title: "Revenue Distribution",
    },
    {
      key: "employees",
      label: "Team Size",
      icon: Users,
      title: "Company Size",
    },
    {
      key: "status",
      label: "Email Status",
      icon: PieChart,
      title: "Email Status",
    },
  ];

  const getFundingData = () => {
    const companyFunding = leads
      .filter(lead => (lead.company ?? lead.Company) && (lead.funding_total ?? lead['Total Funding']) && (Number(lead.funding_total ?? lead['Total Funding']) || 0) > 0)
      .reduce((acc, lead) => {
        const company = (lead.company ?? lead.Company) as string;
        const rawFunding = lead.funding_total ?? lead['Total Funding'] ?? 0;
        const funding = typeof rawFunding === 'string' ? parseFloat(rawFunding.replace(/[^0-9.-]/g, '')) : Number(rawFunding) || 0;
        if (!acc[company] || acc[company] < funding) {
          acc[company] = funding;
        }
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(companyFunding)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8) // Fewer companies for mobile
      .map(([company, funding]) => ({
        name: company.length > 15 ? company.substring(0, 15) + '...' : company,
        fullName: company,
        value: funding,
        formattedValue: formatCurrency(funding),
      }));
  };

  const getRevenueData = () => {
    const revenueRanges = {
      '<$1M': 0,
      '$1M-$10M': 0,
      '$10M-$50M': 0,
      '$50M-$100M': 0,
      '$100M+': 0,
    };

    leads.forEach(lead => {
      const source = lead.revenue ?? lead['Annual Revenue'];
      if (source) {
        const revenue = typeof source === 'string'
          ? parseFloat(source.replace(/[^0-9.-]/g, ''))
          : Number(source);

        if (!isNaN(revenue)) {
          if (revenue < 1000000) revenueRanges['<$1M']++;
          else if (revenue < 10000000) revenueRanges['$1M-$10M']++;
          else if (revenue < 50000000) revenueRanges['$10M-$50M']++;
          else if (revenue < 100000000) revenueRanges['$50M-$100M']++;
          else revenueRanges['$100M+']++;
        }
      }
    });

    return Object.entries(revenueRanges).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  const getEmployeesData = () => {
    const employeeRanges = {
      '1-10': 0,
      '11-50': 0,
      '51-200': 0,
      '201-1000': 0,
      '1000+': 0,
    };

    leads.forEach(lead => {
      const employeesSource = lead.employees ?? lead['# Employees'];
      if (employeesSource) {
        const employees = employeesSource;
        if (employees <= 10) employeeRanges['1-10']++;
        else if (employees <= 50) employeeRanges['11-50']++;
        else if (employees <= 200) employeeRanges['51-200']++;
        else if (employees <= 1000) employeeRanges['201-1000']++;
        else employeeRanges['1000+']++;
      }
    });

    return Object.entries(employeeRanges).map(([range, count]) => ({
      name: range,
      value: count,
    }));
  };

  const getEmailStatusData = () => {
    const statusCounts = leads.reduce((acc, lead) => {
      const status = lead['Email Status'] || 'Unknown';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <GlassCard className="p-3 border border-border/50">
          <p className="text-sm font-medium">{payload[0].payload?.fullName || label}</p>
          <p className="text-sm text-muted-foreground">
            {payload[0].payload?.formattedValue || `${payload[0].value} leads`}
          </p>
        </GlassCard>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <GlassCard className="p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted/20 rounded w-1/3"></div>
          <div className="h-48 bg-muted/20 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  const renderChart = () => {
    switch (activeChart) {
      case 0: // Funding
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getFundingData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                stroke="rgba(255,255,255,0.7)" 
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.7)" 
                fontSize={10}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#fb923c" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 1: // Revenue
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={getRevenueData()}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {getRevenueData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case 2: // Employees
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={getEmployeesData()}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" fontSize={10} />
              <YAxis stroke="rgba(255,255,255,0.7)" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#22c55e" />
            </BarChart>
          </ResponsiveContainer>
        );

      case 3: // Email Status
        return (
          <ResponsiveContainer width="100%" height={200}>
            <RechartsPieChart>
              <Pie
                data={getEmailStatusData()}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {getEmailStatusData().map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <GlassCard className="p-4">
      {/* Chart Selector */}
      <div className="flex gap-1 mb-4 overflow-x-auto">
        {charts.map((chart, index) => {
          const Icon = chart.icon;
          return (
            <Button
              key={chart.key}
              variant={activeChart === index ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveChart(index)}
              className={`tap-lg shrink-0 ${
                activeChart === index 
                  ? "bg-primary text-primary-foreground" 
                  : "glass border-border/30"
              }`}
            >
              <Icon className="h-4 w-4 mr-1" />
              {chart.label}
            </Button>
          );
        })}
      </div>

      {/* Chart Title */}
      <h4 className="text-sm font-medium mb-3 text-center">
        {charts[activeChart]?.title}
      </h4>

      {/* Chart */}
      <div className="h-52">
        {renderChart()}
      </div>
    </GlassCard>
  );
}