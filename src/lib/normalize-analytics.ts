// ---------- shared helpers ----------
export function safeJson<T = unknown>(val: any, fallback: T): T {
  if (val == null) return fallback;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') { try { return JSON.parse(val) as T; } catch { return fallback; } }
  return fallback;
}

export function safeJsonWithFlag<T = unknown>(val: any, fallback: T): { value: T; invalid: boolean } {
  if (val == null) return { value: fallback, invalid: false };
  if (typeof val === 'object') return { value: val as T, invalid: false };
  if (typeof val === 'string') {
    try { return { value: JSON.parse(val) as T, invalid: false }; }
    catch { return { value: fallback, invalid: true }; }
  }
  return { value: fallback, invalid: false };
}

export const fmtNum = (n?: number|null) =>
  (n == null || isNaN(Number(n))) ? '—' :
  Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(n));

export const fmtPct = (v?: number|null) =>
  (v == null || isNaN(Number(v))) ? '—' :
  Intl.NumberFormat(undefined, { style: 'percent', maximumFractionDigits: 1 }).format(Number(v));

export const fmtDur = (sec?: number|null) => {
  const s = Number(sec ?? 0); 
  if (!isFinite(s) || s <= 0) return '—';
  const m = Math.floor(s / 60); 
  const r = Math.round(s % 60);
  return `${m}m ${r}s`;
};

export const fmtDate = (s?: string|null) => {
  if (!s) return '—';
  const d = new Date(s); 
  return isNaN(d.getTime()) ? String(s) : d.toISOString().slice(0,10);
};

// ---------- types ----------
export type ChannelShare = { channel: string; value: number; share?: number };
export type TrafficTS = { date: string; search_traffic?: number; organic_traffic?: number; paid_traffic?: number; organic_keywords_value?: number };
export type BacklinkPoint = { date: string; value: number };
export type SimpleHistory = { date: string; value: number };

export type WebAnalyticsBlock = {
  domain?: string;
  traffic: {
    visits?: number;
    channels: ChannelShare[];
    bounce_rate?: number;
    pages_per_visit?: number;
    time_on_site_sec?: number;
    visits_mom_change?: number;
    visits_change_6m?: number;
    search_traffic_history?: TrafficTS[];
    top_pages_organic?: { url: string; keywords_count?: number }[];
    organic_keywords?: { keyword: string; rank?: number; search_volume?: number }[];
  };
  authority?: {
    score?: number;
    backlinks?: {
      total?: number;
      referral_domains?: number;
      mom_change?: number;
    };
    history?: {
      authority_score?: SimpleHistory[];
      backlinks?: BacklinkPoint[];
      referral_domains?: BacklinkPoint[];
    };
    top_backlink_pages?: { url: string; domains?: number; backlinks?: number }[];
  };
  last_updated?: string;
};

export type CrunchbaseBlock = {
  employees_range?: string;
  num_investors?: number;
  num_funding_rounds?: number;
  last_funding_type?: string;
  last_funding_date?: string;
  ipo_prediction_score?: number;
  growth_current?: number;
  heat_current?: number;
  heat_score?: number;
  growth_score_delta_d90?: number;
  categories?: string[];
  tech_stack?: { name: string }[];
  similar_orgs?: { name: string; score?: number }[];
  key_employee_changes?: {
    date?: string;
    description?: string;
    press_publisher?: string;
    press_date?: string;
    press_url?: string;
  }[];
  last_updated?: string;
};

// ---------- normalizers ----------
export function normalizeWebAnalytics(src: any): { data: WebAnalyticsBlock; invalid: boolean } {
  const { value, invalid } = safeJsonWithFlag<any>(src, {});
  
  const normalized: WebAnalyticsBlock = {
    domain: value?.domain || value?.website || '',
    traffic: {
      visits: value?.traffic?.visits || value?.visits,
      channels: Array.isArray(value?.traffic?.channels) ? value.traffic.channels : 
                 Array.isArray(value?.channels) ? value.channels : [],
      bounce_rate: value?.traffic?.bounce_rate || value?.bounce_rate,
      pages_per_visit: value?.traffic?.pages_per_visit || value?.pages_per_visit,
      time_on_site_sec: value?.traffic?.time_on_site_sec || value?.time_on_site_sec,
      visits_mom_change: value?.traffic?.visits_mom_change || value?.visits_mom_change,
      visits_change_6m: value?.traffic?.visits_change_6m || value?.visits_change_6m,
      search_traffic_history: Array.isArray(value?.traffic?.search_traffic_history) ? 
        value.traffic.search_traffic_history : 
        Array.isArray(value?.search_traffic_history) ? value.search_traffic_history : [],
      top_pages_organic: Array.isArray(value?.traffic?.top_pages_organic) ?
        value.traffic.top_pages_organic :
        Array.isArray(value?.top_pages_organic) ? value.top_pages_organic : [],
      organic_keywords: Array.isArray(value?.traffic?.organic_keywords) ?
        value.traffic.organic_keywords :
        Array.isArray(value?.organic_keywords) ? value.organic_keywords : [],
    },
    authority: {
      score: value?.authority?.score || value?.authority_score,
      backlinks: {
        total: value?.authority?.backlinks?.total || value?.backlinks?.total || value?.backlinks,
        referral_domains: value?.authority?.backlinks?.referral_domains || value?.backlinks?.referral_domains || value?.referring_domains,
        mom_change: value?.authority?.backlinks?.mom_change || value?.backlinks?.mom_change,
      },
      history: {
        authority_score: Array.isArray(value?.authority?.history?.authority_score) ?
          value.authority.history.authority_score :
          Array.isArray(value?.authority_score_history) ? value.authority_score_history : [],
        backlinks: Array.isArray(value?.authority?.history?.backlinks) ?
          value.authority.history.backlinks :
          Array.isArray(value?.backlinks_history) ? value.backlinks_history : [],
        referral_domains: Array.isArray(value?.authority?.history?.referral_domains) ?
          value.authority.history.referral_domains :
          Array.isArray(value?.referral_domains_history) ? value.referral_domains_history : [],
      },
      top_backlink_pages: Array.isArray(value?.authority?.top_backlink_pages) ?
        value.authority.top_backlink_pages :
        Array.isArray(value?.top_backlink_pages) ? value.top_backlink_pages : [],
    },
    last_updated: value?.last_updated || value?.updated_at,
  };

  return { data: normalized, invalid };
}

export function normalizeCrunchbase(src: any): { data: CrunchbaseBlock; invalid: boolean } {
  const { value, invalid } = safeJsonWithFlag<any>(src, {});
  
  const normalized: CrunchbaseBlock = {
    employees_range: value?.employees_range || value?.employee_count,
    num_investors: value?.num_investors || value?.investors_count,
    num_funding_rounds: value?.num_funding_rounds || value?.funding_rounds_count,
    last_funding_type: value?.last_funding_type || value?.latest_funding_type,
    last_funding_date: value?.last_funding_date || value?.latest_funding_date,
    ipo_prediction_score: value?.ipo_prediction_score || value?.ipo_score,
    growth_current: value?.growth_current || value?.growth_score,
    heat_current: value?.heat_current || value?.heat_score,
    heat_score: value?.heat_score,
    growth_score_delta_d90: value?.growth_score_delta_d90 || value?.growth_delta_90d,
    categories: Array.isArray(value?.categories) ? value.categories : 
               Array.isArray(value?.category_groups) ? value.category_groups : [],
    tech_stack: Array.isArray(value?.tech_stack) ? value.tech_stack :
               Array.isArray(value?.technologies) ? value.technologies.map((t: any) => ({ name: t.name || t })) : [],
    similar_orgs: Array.isArray(value?.similar_orgs) ? value.similar_orgs :
                 Array.isArray(value?.similar_companies) ? value.similar_companies : [],
    key_employee_changes: Array.isArray(value?.key_employee_changes) ? value.key_employee_changes :
                         Array.isArray(value?.employee_changes) ? value.employee_changes : [],
    last_updated: value?.last_updated || value?.updated_at,
  };

  return { data: normalized, invalid };
}