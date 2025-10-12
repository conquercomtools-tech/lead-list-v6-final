import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, LEADS_TABLE, Lead } from "@/lib/supabase";

export interface FilterState {
  search: string;
  emailStatus: string;
  industry: string;
  country: string;
  employeesRange: [number, number];
  fundingRange: [number, number];
  revenueRange: [number, number];
}

const DEFAULT_FILTERS: FilterState = {
  search: "",
  emailStatus: "",
  industry: "",
  country: "",
  employeesRange: [0, 10000],
  fundingRange: [0, 1000000000],
  revenueRange: [0, 1000000000],
};

export function useLeads(
  page: number = 1,
  pageSize: number = 25,
  sortColumn: string = "",
  sortDirection: "asc" | "desc" = "asc",
  filters: FilterState = DEFAULT_FILTERS
) {
  const [debouncedFilters, setDebouncedFilters] = useState(filters);

  // Debounce filters to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
    }, 400);

    return () => clearTimeout(timer);
  }, [filters]);

  const {
    data: leadsData,
    isLoading: leadsLoading,
    error: leadsError,
  } = useQuery({
    queryKey: ["leads", page, pageSize, sortColumn, sortDirection, debouncedFilters],
    queryFn: async () => {
      let query = supabase.from(LEADS_TABLE).select(`
        *,
        avatar_url:basic_info->>profile_picture_url,
        google_ads:googel_ads,
        meta_ads,
        funding_acquisition:funding and acquisition
      `, { count: "exact" });

      // Apply search filter
      if (debouncedFilters.search) {
        const searchTerm = `%${debouncedFilters.search}%`;
        query = query.or(
          `"First Name".ilike.${searchTerm},"Last Name".ilike.${searchTerm},"Company".ilike.${searchTerm},"Title".ilike.${searchTerm},"Email".ilike.${searchTerm}`
        );
      }

      // Apply status filters
      if (debouncedFilters.emailStatus) {
        query = query.eq('"Email Status"', debouncedFilters.emailStatus);
      }

      if (debouncedFilters.industry) {
        query = query.eq("Industry", debouncedFilters.industry);
      }

      if (debouncedFilters.country) {
        query = query.eq("Country", debouncedFilters.country);
      }

      // Apply range filters
      if (debouncedFilters.employeesRange[0] > 0 || debouncedFilters.employeesRange[1] < 10000) {
        query = query
          .gte('"# Employees"', debouncedFilters.employeesRange[0])
          .lte('"# Employees"', debouncedFilters.employeesRange[1]);
      }

      if (debouncedFilters.fundingRange[0] > 0 || debouncedFilters.fundingRange[1] < 1000000000) {
        query = query
          .gte('"Total Funding"', debouncedFilters.fundingRange[0])
          .lte('"Total Funding"', debouncedFilters.fundingRange[1]);
      }

      // Apply sorting
      if (sortColumn) {
        const columnMap: Record<string, string> = {
          name: '"First Name"',
          title: "Title",
          company: "Company",
          email: "Email",
          country: "Country",
          employees: '"# Employees"',
          funding: '"Total Funding"',
          revenue: '"Annual Revenue"',
        };
        
        const dbColumn = columnMap[sortColumn] || sortColumn;
        query = query.order(dbColumn, { ascending: sortDirection === "asc" });
      }

      // Apply pagination
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) throw error;

      return {
        leads: (data as Lead[]) || [],
        totalCount: count || 0,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get unique values for filters
  const {
    data: uniqueValues,
    isLoading: uniqueValuesLoading,
  } = useQuery({
    queryKey: ["unique-values"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(LEADS_TABLE)
        .select('"Email Status", Industry, Country')
        .not('"Email Status"', 'is', null)
        .not('Industry', 'is', null)
        .not('Country', 'is', null);

      if (error) throw error;

      const emailStatuses = [...new Set(data.map(item => item['Email Status']).filter(Boolean))];
      const industries = [...new Set(data.map(item => item.Industry).filter(Boolean))];
      const countries = [...new Set(data.map(item => item.Country).filter(Boolean))];

      return {
        emailStatuses: emailStatuses.sort(),
        industries: industries.sort(),
        countries: countries.sort(),
      };
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Calculate stats
  const stats = useMemo(() => {
    if (!leadsData?.leads) return null;

    const totalLeads = leadsData.totalCount;
    const verifiedEmails = leadsData.leads.filter(lead => 
      lead['Email Status']?.toLowerCase().includes('verified') ||
      lead['Email Status']?.toLowerCase().includes('valid')
    ).length;
    
    const verifiedEmailsPercent = totalLeads > 0 ? (verifiedEmails / totalLeads) * 100 : 0;

    const totalFunding = leadsData.leads.reduce((sum, lead) => {
      const funding = lead['Total Funding'] || 0;
      return sum + funding;
    }, 0);

    const revenueValues = leadsData.leads
      .map(lead => {
        if (!lead['Annual Revenue']) return 0;
        const revenue = typeof lead['Annual Revenue'] === 'string' 
          ? parseFloat(lead['Annual Revenue'].replace(/[^0-9.-]/g, ''))
          : lead['Annual Revenue'];
        return isNaN(revenue) ? 0 : revenue;
      })
      .filter(v => v > 0);

    const avgAnnualRevenue = revenueValues.length > 0 
      ? revenueValues.reduce((sum, val) => sum + val, 0) / revenueValues.length 
      : 0;

    const employeeValues = leadsData.leads
      .map(lead => lead['# Employees'] || 0)
      .filter(v => v > 0)
      .sort((a, b) => a - b);

    const medianEmployees = employeeValues.length > 0
      ? employeeValues[Math.floor(employeeValues.length / 2)]
      : 0;

    return {
      totalLeads,
      verifiedEmailsPercent,
      totalFunding,
      avgAnnualRevenue,
      medianEmployees,
    };
  }, [leadsData]);

  return {
    leads: leadsData?.leads || [],
    totalCount: leadsData?.totalCount || 0,
    stats,
    uniqueValues: uniqueValues || {
      emailStatuses: [],
      industries: [],
      countries: [],
    },
    isLoading: leadsLoading || uniqueValuesLoading,
    error: leadsError,
  };
}