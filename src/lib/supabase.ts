import { createClient } from '@supabase/supabase-js';

// Environment variable validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://fbqgcxtxuuulerzvrazv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZicWdjeHR4dXV1bGVyenZyYXp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc5NzAwODcsImV4cCI6MjA3MzU0NjA4N30.T_aiFje1Ii3yUqTLWTaFrZLlCKImXwbaZRgUZmiyGks';
const tableName = import.meta.env.VITE_SUPABASE_TABLE_NAME || '5LEAD TEST';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const LEADS_TABLE = tableName;

// Helper function to check if environment variables are properly set
export const checkEnvVars = () => {
  const missing = [];
  if (!import.meta.env.VITE_SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY');
  return missing;
};

export type Lead = {
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
  'Annual Revenue'?: string;
  'Total Funding'?: number;
  'Latest Funding Amount'?: number;
  'Latest Funding'?: string;
  'Last Raised At'?: string;
  linkedin_posts?: any;
  basic_info?: any;
  company_linkedin_post?: any;
  company_data?: any;
  youtube_video?: any;
  competitors?: any;
  events?: string;
  important_urls?: any;
  avatar_url?: string | null;
  'Facebook Url'?: string;
  'Twitter Url'?: string;
  Website?: string;
  // Analytics fields
  'website_analytic(similarweb)'?: any;
  'website_analytic(semrush)'?: any;
  CRUNCHBASE?: any;
  google_ads?: any;
  googel_ads?: any;
  Ev_Estimation?: any;
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