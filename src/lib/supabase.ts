import { createClient } from '@supabase/supabase-js';

export const TABLE =
  (import.meta.env.VITE_SUPABASE_TABLE_NAME as string) || 'leads_viez';

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? '';
const key = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ?? '';

export const supabase = createClient(url, key, { auth: { persistSession: false } });

export const LEADS_TABLE = TABLE;

// Helper function to check if environment variables are properly set
export const checkEnvVars = () => {
  const missing = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY');
  return missing;
};

export type Lead = {
  id?: number;
  name?: string;
  title?: string;
  email?: string;
  linkedin_url?: string;
  linkedin_company_url?: string;
  company?: string;
  website?: string;
  domain?: string;
  industry?: string;
  country?: string;
  city?: string;
  employees?: number;
  revenue?: number | string | null;
  funding_total?: number | null;
  latest_funding_amount?: number | null;
  last_raised_at?: string | null;
  linkedin_posts?: any;
  basic_info?: any;
  company_linkedin_post?: any;
  company_data?: any;
  youtube_video?: any;
  competitors?: any;
  events?: any;
  important_urls?: any;
  meta_ads?: any;
  googel_ads?: any;
  google_ads?: any;
  pricing?: any;
  CRUNCHBASE?: any;
  website_analytic_semrush?: any;
  website_analytic_similarweb?: any;
  Ev_Estimation?: any;
  funding_acquisition?: any;
  avatar_url?: string | null;
  location?: string | null;
  // Legacy fields kept for backwards compatibility
  'First Name'?: string;
  'Last Name'?: string;
  Title?: string;
  Company?: string;
  'Company Name for Emails'?: string;
  Email?: string;
  'Secondary Email'?: string;
  'Company Phone'?: string;
  'Person Linkedin Url'?: string;
  'Company Linkedin Url'?: string;
  'Email Status'?: string;
  '# Employees'?: number;
  Industry?: string;
  'Sub-Industry'?: string;
  'Company Stage'?: string;
  City?: string;
  State?: string;
  Country?: string;
  'Company Address'?: string;
  'Company City'?: string;
  'Company State'?: string;
  'Company Country'?: string;
  Technologies?: string;
  'Annual Revenue'?: string | number;
  'Total Funding'?: number;
  'Latest Funding Amount'?: number;
  'Latest Funding'?: string;
  'Last Raised At'?: string;
  Keywords?: string;
};

// Utility functions for data formatting
export const formatCurrency = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return 'N/A';
  
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
  return `$${num.toLocaleString()}`;
};

export const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') return 'N/A';
  
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) : value;
  if (isNaN(num)) return 'N/A';
  
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toLocaleString();
};

export const getInitials = (firstName?: string, lastName?: string, company?: string): string => {
  if (firstName && lastName) {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }
  if (firstName) return firstName.charAt(0).toUpperCase();
  if (company) return company.charAt(0).toUpperCase();
  return '?';
};

export const getCountryFlag = (country?: string): string => {
  const countryFlags: Record<string, string> = {
    'United States': '🇺🇸',
    'USA': '🇺🇸',
    'US': '🇺🇸',
    'Canada': '🇨🇦',
    'United Kingdom': '🇬🇧',
    'UK': '🇬🇧',
    'Germany': '🇩🇪',
    'France': '🇫🇷',
    'Spain': '🇪🇸',
    'Italy': '🇮🇹',
    'Australia': '🇦🇺',
    'Japan': '🇯🇵',
    'China': '🇨🇳',
    'India': '🇮🇳',
    'Brazil': '🇧🇷',
    'Mexico': '🇲🇽',
    'Netherlands': '🇳🇱',
    'Sweden': '🇸🇪',
    'Norway': '🇳🇴',
    'Denmark': '🇩🇰',
    'Finland': '🇫🇮',
    'Switzerland': '🇨🇭',
    'Austria': '🇦🇹',
    'Belgium': '🇧🇪',
    'Ireland': '🇮🇪',
    'Portugal': '🇵🇹',
    'Israel': '🇮🇱',
    'Singapore': '🇸🇬',
    'South Korea': '🇰🇷',
    'Poland': '🇵🇱',
    'Russia': '🇷🇺',
    'Turkey': '🇹🇷',
    'South Africa': '🇿🇦',
    'Argentina': '🇦🇷',
    'Chile': '🇨🇱',
    'Colombia': '🇨🇴',
    'Peru': '🇵🇪',
    'Venezuela': '🇻🇪',
    'Ecuador': '🇪🇨',
    'Uruguay': '🇺🇾',
    'Czech Republic': '🇨🇿',
    'Hungary': '🇭🇺',
    'Romania': '🇷🇴',
    'Bulgaria': '🇧🇬',
    'Croatia': '🇭🇷',
    'Slovenia': '🇸🇮',
    'Slovakia': '🇸🇰',
    'Lithuania': '🇱🇹',
    'Latvia': '🇱🇻',
    'Estonia': '🇪🇪',
    'Thailand': '🇹🇭',
    'Malaysia': '🇲🇾',
    'Indonesia': '🇮🇩',
    'Philippines': '🇵🇭',
    'Vietnam': '🇻🇳',
    'New Zealand': '🇳🇿',
  };
  
  return countryFlags[country || ''] || '🌍';
};