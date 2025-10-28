import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase, LEADS_TABLE, Lead } from "@/lib/supabase";

const SELECT = `
  id,
  "Name" as name,
  "Title" as title,
  "Email" as email,
  "Person Linkedin Url" as linkedin_url,
  "Company Linkedin Url" as linkedin_company_url,

  "Company" as company,
  "Website" as website,
  "Industry" as industry,
  "Company Country" as country,
  location as city,
  "# Employees" as employees,
  "Annual Revenue" as revenue,

  "Total Funding" as funding_total,
  "Latest Funding Amount" as latest_funding_amount,
  "Last Raised At" as last_raised_at,

  linkedin_posts,
  basic_info,
  avatar_url:basic_info->>profile_picture_url,
  company_linkedin_post,
  company_data,
  youtube_video,
  events,
  important_urls,
  competitors,

  meta_ads,
  googel_ads as google_ads,

  "funding and acquisition" as funding_acquisition,
  pricing,
  "CRUNCHBASE" as CRUNCHBASE,
  "website_analytic(semrush)" as website_analytic_semrush,
  "website_analytic(similarweb)" as website_analytic_similarweb,
  "Ev_Estimation" as Ev_Estimation,
  domain,
  "Email Status"
`;

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
      let query = supabase.from(LEADS_TABLE).select(SELECT, { count: "exact" });

      // Apply search filter
      if (debouncedFilters.search) {
        const searchTerm = `%${debouncedFilters.search}%`;
        const searchColumns = [
          '"Name"',
          '"Company"',
          '"Title"',
          '"Email"',
          '"First Name"',
          '"Last Name"'
        ];
        query = query.or(searchColumns.map((col) => `${col}.ilike.${searchTerm}`).join(','));
      }

      // Apply status filters
      if (debouncedFilters.emailStatus) {
        query = query.eq('"Email Status"', debouncedFilters.emailStatus);
      }

      if (debouncedFilters.industry) {
        query = query.eq("Industry", debouncedFilters.industry);
      }

      if (debouncedFilters.country) {
        query = query.eq('"Company Country"', debouncedFilters.country);
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
          name: '"Name"',
          title: '"Title"',
          company: '"Company"',
          email: '"Email"',
          country: '"Company Country"',
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
        .select('"Email Status", Industry, "Company Country"')
        .not('"Email Status"', 'is', null)
        .not('Industry', 'is', null)
        .not('"Company Country"', 'is', null);

      if (error) throw error;

      const emailStatuses = [...new Set(data.map(item => item['Email Status']).filter(Boolean))];
      const industries = [...new Set(data.map(item => item.Industry).filter(Boolean))];
      const countries = [...new Set(data.map(item => item['Company Country']).filter(Boolean))];

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
      const value = lead.funding_total ?? lead['Total Funding'] ?? 0;
      const funding = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : Number(value) || 0;
      return sum + (isNaN(funding) ? 0 : funding);
    }, 0);

    const revenueValues = leadsData.leads
      .map(lead => {
        const source = lead.revenue ?? lead['Annual Revenue'];
        if (!source) return 0;
        const revenue = typeof source === 'string'
          ? parseFloat(source.replace(/[^0-9.-]/g, ''))
          : Number(source);
        return isNaN(revenue) ? 0 : revenue;
      })
      .filter(v => v > 0);

    const avgAnnualRevenue = revenueValues.length > 0 
      ? revenueValues.reduce((sum, val) => sum + val, 0) / revenueValues.length 
      : 0;

    const employeeValues = leadsData.leads
      .map(lead => lead.employees ?? lead['# Employees'] ?? 0)
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