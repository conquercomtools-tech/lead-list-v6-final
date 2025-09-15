import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lead, formatCurrency, formatNumber } from "@/lib/supabase";
import { BarChart3, PieChart, TrendingUp, Users } from "lucide-react";
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

interface ChartsPanelProps {
  leads: Lead[];
  isLoading: boolean;
}

const COLORS = ['#fb923c', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#10b981', '#14b8a6', '#06b6d4'];

export function ChartsPanel({ leads, isLoading }: ChartsPanelProps) {
  const [activeTab, setActiveTab] = useState("funding");

  // Prepare funding data
  const getFundingData = () => {
    const companyFunding = leads
      .filter(lead => lead.Company && lead['Total Funding'] && lead['Total Funding'] > 0)
      .reduce((acc, lead) => {
        const company = lead.Company!;
        const funding = lead['Total Funding']!;
        if (!acc[company] || acc[company] < funding) {
          acc[company] = funding;
        }
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(companyFunding)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([company, funding]) => ({
        name: company.length > 20 ? company.substring(0, 20) + '...' : company,
        fullName: company,
        value: funding,
        formattedValue: formatCurrency(funding),
      }));
  };

  // Prepare revenue data
  const getRevenueData = () => {
    const revenueRanges = {
      '<$1M': 0,
      '$1M-$10M': 0,
      '$10M-$50M': 0,
      '$50M-$100M': 0,
      '$100M+': 0,
    };

    leads.forEach(lead => {
      if (lead['Annual Revenue']) {
        const revenue = typeof lead['Annual Revenue'] === 'string' 
          ? parseFloat(lead['Annual Revenue'].replace(/[^0-9.-]/g, ''))
          : lead['Annual Revenue'];
        
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

  // Prepare employees data
  const getEmployeesData = () => {
    const employeeRanges = {
      '1-10': 0,
      '11-50': 0,
      '51-200': 0,
      '201-1000': 0,
      '1000+': 0,
    };

    leads.forEach(lead => {
      if (lead['# Employees']) {
        const employees = lead['# Employees'];
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

  // Prepare email status data
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
      <GlassCard className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted/20 rounded w-1/3"></div>
          <div className="h-64 bg-muted/20 rounded"></div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4 gradient-text">Analytics Dashboard</h3>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4 glass">
          <TabsTrigger value="funding" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Funding
          </TabsTrigger>
          <TabsTrigger value="revenue" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Revenue
          </TabsTrigger>
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Size
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <PieChart className="h-4 w-4" />
            Email Status
          </TabsTrigger>
        </TabsList>

        <TabsContent value="funding" className="mt-6">
          <div className="h-80">
            <h4 className="text-sm font-medium mb-4">Top Companies by Total Funding</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getFundingData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="rgba(255,255,255,0.7)" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke="rgba(255,255,255,0.7)" 
                  fontSize={12}
                  tickFormatter={formatCurrency}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="url(#colorGradient)">
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fb923c" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="mt-6">
          <div className="h-80">
            <h4 className="text-sm font-medium mb-4">Annual Revenue Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={getRevenueData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getRevenueData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="employees" className="mt-6">
          <div className="h-80">
            <h4 className="text-sm font-medium mb-4">Company Size Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={getEmployeesData()}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="url(#employeesGradient)">
                  <defs>
                    <linearGradient id="employeesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0.3}/>
                    </linearGradient>
                  </defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        <TabsContent value="status" className="mt-6">
          <div className="h-80">
            <h4 className="text-sm font-medium mb-4">Email Status Distribution</h4>
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={getEmailStatusData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {getEmailStatusData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>
      </Tabs>
    </GlassCard>
  );
}