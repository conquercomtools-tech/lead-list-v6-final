// src/lib/normalize-crunchbase.ts
export type CbTech = { name: string; categories: string[] };
export type CbSimilar = { name: string; uuid?: string; score?: number; permalink?: string };
export type CbHub = { name: string; org_count?: number; permalink?: string };
export type CbKeyChange = { date?: string; press_url?: string; description?: string; press_publisher?: string; press_date?: string };

export type CrunchbaseItem = {
  org_name?: string;
  org_uuid?: string;
  locations?: string[];
  categories?: string[];
  heat_score?: number;
  heat_current?: number;
  growth_current?: number;
  growth_score_delta_d90?: number;
  employees_range?: string;    // e.g., "c_00011_00050"
  num_investors?: number;
  num_funding_rounds?: number;
  has_funding_total?: boolean;
  last_funding_date?: string;
  last_funding_type?: string;
  ipo_prediction_score?: number;
  funding_prediction_score?: number;
  acquisition_prediction_score?: number;
  acquisition_probability_tier?: string;
  org_permalink?: string;
  tech_stack?: CbTech[];
  similar_orgs?: CbSimilar[];
  recommended_hubs?: CbHub[];
  key_employee_changes?: CbKeyChange[];
};

export function safeJson<T=unknown>(val:any, fallback:T):T{
  if (val==null) return fallback;
  if (typeof val==='object') return val as T;
  if (typeof val==='string'){ try { return JSON.parse(val) as T; } catch { return fallback; } }
  return fallback;
}

// Map Crunchbase's compact employee ranges to human strings
export function prettyEmployeesRange(code?: string | null): string {
  if (!code) return '—';
  // patterns like c_00011_00050
  const m = code.match(/c_(\d{5})_(\d{5})/);
  if (!m) return code;
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  return `${a}-${b}`;
}

export const toArray = (v:any): string[] => {
  if (v==null) return [];
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
  return String(v).split(/;|\n|,/g).map(s=>s.trim()).filter(Boolean);
};

export const fmtNum = (n?: number|null) =>
  (n == null || isNaN(Number(n))) ? '—' :
  Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(Number(n));

export const fmtDate = (s?: string|null) => {
  if (!s) return '—';
  const d = new Date(s); return isNaN(d.getTime()) ? String(s) : d.toISOString().slice(0,10);
};

// Parse JSONB (array or stringified) -> normalized list
export function normalizeCrunchbase(src:any): CrunchbaseItem[] {
  const arr = safeJson<any[]>(src, []);
  return arr.map((raw) => {
    const t = (raw?.tech_stack ?? []) as any[];
    const s = (raw?.similar_orgs ?? []) as any[];
    const h = (raw?.recommended_hubs ?? []) as any[];
    const kc = (raw?.key_employee_changes ?? []) as any[];
    return {
      org_name: raw?.org_name ?? null,
      org_uuid: raw?.org_uuid ?? null,
      locations: toArray(raw?.locations),
      categories: toArray(raw?.categories),
      heat_score: Number(raw?.heat_score ?? NaN),
      heat_current: Number(raw?.heat_current ?? NaN),
      growth_current: Number(raw?.growth_current ?? NaN),
      growth_score_delta_d90: Number(raw?.growth_score_delta_d90 ?? NaN),
      employees_range: raw?.employees_range ?? null,
      num_investors: Number(raw?.num_investors ?? NaN),
      num_funding_rounds: Number(raw?.num_funding_rounds ?? NaN),
      has_funding_total: !!raw?.has_funding_total,
      last_funding_date: raw?.last_funding_date ?? null,
      last_funding_type: raw?.last_funding_type ?? null,
      ipo_prediction_score: Number(raw?.ipo_prediction_score ?? NaN),
      funding_prediction_score: Number(raw?.funding_prediction_score ?? NaN),
      acquisition_prediction_score: Number(raw?.acquisition_prediction_score ?? NaN),
      acquisition_probability_tier: raw?.acquisition_probability_tier ?? null,
      org_permalink: raw?.org_permalink ?? null,
      tech_stack: t.map(x => ({ name: String(x?.name ?? ''), categories: toArray(x?.categories) })),
      similar_orgs: s.map(x => ({ name: String(x?.name ?? ''), uuid: x?.uuid, score: Number(x?.score ?? NaN), permalink: x?.permalink })),
      recommended_hubs: h.map(x => ({ name: String(x?.name ?? ''), org_count: Number(x?.org_count ?? NaN), permalink: x?.permalink })),
      key_employee_changes: kc.map(x => ({
        date: x?.date ?? null, press_url: x?.press_url ?? null, press_publisher: x?.press_publisher ?? null,
        press_date: x?.press_date ?? null, description: x?.description ?? ''
      })),
    };
  });
}

// Aggregations for charts/lists
export function crunchbaseAggregates(items: CrunchbaseItem[]) {
  const first = items[0] ?? {};
  const uniq = (xs:string[]) => Array.from(new Set(xs.filter(Boolean)));
  const flatTech = (first.tech_stack ?? []).map(t => t.name).filter(Boolean);
  const techCats = (first.tech_stack ?? []).flatMap(t => t.categories ?? []);
  const categories = first.categories ?? [];
  const locations = first.locations ?? [];

  // frequency helpers
  const count = (arr:string[]) => arr.reduce<Record<string,number>>((m,k)=>{m[k]=(m[k]??0)+1; return m;}, {});
  const top = (obj:Record<string,number>, n=10) => Object.entries(obj).sort((a,b)=>b[1]-a[1]).slice(0,n)
    .map(([label,value])=>({label, value}));

  return {
    snapshot: {
      org_name: first.org_name ?? '—',
      employees_range: first.employees_range ?? '—',
      last_funding_type: first.last_funding_type ?? '—',
      last_funding_date: first.last_funding_date ?? '—',
      num_investors: isNaN(first.num_investors!) ? null : first.num_investors,
      num_funding_rounds: isNaN(first.num_funding_rounds!) ? null : first.num_funding_rounds,
      heat_score: isNaN(first.heat_score!) ? null : first.heat_score,
      heat_current: isNaN(first.heat_current!) ? null : first.heat_current,
      growth_current: isNaN(first.growth_current!) ? null : first.growth_current,
      ipo_prediction_score: isNaN(first.ipo_prediction_score!) ? null : first.ipo_prediction_score,
      acquisition_prediction_score: isNaN(first.acquisition_prediction_score!) ? null : first.acquisition_prediction_score,
      funding_prediction_score: isNaN(first.funding_prediction_score!) ? null : first.funding_prediction_score,
      acquisition_probability_tier: first.acquisition_probability_tier ?? null,
      org_permalink: first.org_permalink ?? null,
    },
    lists: {
      locations: uniq(locations),
      categories: uniq(categories),
      tech: uniq(flatTech),
    },
    charts: {
      techCategoryFreq: top(count(techCats), 10),
      categoryFreq: top(count(categories), 10),
      hubsByOrgCount: (first.recommended_hubs ?? [])
        .filter(h => !isNaN(h.org_count ?? NaN))
        .sort((a,b)=>(b.org_count ?? 0)-(a.org_count ?? 0))
        .slice(0,10)
        .map(h=>({ label: h.name, value: h.org_count! })),
      similarByScore: (first.similar_orgs ?? [])
        .filter(s => !isNaN(s.score ?? NaN))
        .sort((a,b)=>(b.score ?? 0)-(a.score ?? 0))
        .slice(0,12)
        .map(s=>({ label: s.name, value: Number(s.score?.toFixed(3) ?? 0) })),
      timeline: (first.key_employee_changes ?? [])
        .filter(e => e.date || e.press_date)
        .map(e => ({ date: e.date ?? e.press_date!, label: e.press_publisher ?? 'Update', description: e.description ?? '', url: e.press_url ?? null }))
        .sort((a,b)=>a.date.localeCompare(b.date)),
    }
  };
}