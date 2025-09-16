export function safeJson<T=unknown>(val:any, fallback:T):T{
  if (val == null) return fallback;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') { try { return JSON.parse(val) as T; } catch { return fallback; } }
  return fallback;
}

export const toArray = (v:any): string[] => {
  if (v == null) return [];
  if (Array.isArray(v)) return v.map(x => String(x).trim()).filter(Boolean);
  // split semicolon OR newline OR comma
  return String(v).split(/;|\n|,/g).map(s => s.trim()).filter(Boolean);
};

export const money = (n?: number|null) =>
  (n==null || isNaN(Number(n))) ? '—' :
  Intl.NumberFormat(undefined,{style:'currency',currency:'USD',notation:'compact'}).format(Number(n));

export const fmtDate = (s?: string|null) => s ? new Date(s).toISOString().slice(0,10) : '—';

export type LinkedInPost = {
  date?: string;
  name?: string;
  post_type?: string;
  summaries?: string[];          // normalized to array
  pain_points?: string[];
  brag_metrics?: string[];
  voice_phrases?: string[];
  stated_priorities?: string[];
  events_conferences?: string[];
};

export function normalizeLinkedInPosts(src:any): LinkedInPost[] {
  const arr = safeJson<any[]>(src, []);
  return arr.map(p => ({
    date: p?.date,
    name: p?.name,
    post_type: p?.post_type,
    summaries: toArray(p?.summaries),
    pain_points: toArray(p?.pain_points),
    brag_metrics: toArray(p?.brag_metrics),
    voice_phrases: toArray(p?.voice_phrases),
    stated_priorities: toArray(p?.stated_priorities),
    events_conferences: toArray(p?.events_conferences),
  }));
}

export function normalizeBasicInfo(src:any){
  const o = safeJson<any>(src, {});
  return {
    fullname: o?.fullname ?? '',
    headline: o?.headline ?? '',
    location: o?.location?.full ?? o?.location ?? '',
    country: o?.location?.country ?? o?.country ?? '',
    avatar: o?.photo ?? o?.profile_image ?? null,
    website: o?.website ?? null,
    socials: o?.social ?? {},
  };
}

export function normalizeCompanyData(src:any){
  const o = safeJson<any>(src, {});
  return {
    url: o?.url ?? null,
    summary: o?.summary ?? '',
    ctas: toArray(o?.ctas),
    contacts: {
      emails: toArray(o?.contacts?.emails),
      phones: toArray(o?.contacts?.phones),
      social: toArray(o?.contacts?.social),
    },
    headline: o?.headline ?? '',
    products: toArray(o?.products),
    funding: Array.isArray(o?.funding) ? o.funding : [],
    tech: toArray(o?.tech ?? o?.stack),
  };
}

export function normalizeCompanyPosts(src:any){
  const v = safeJson<any>(src, []);
  return Array.isArray(v) ? v : [v];   // allow single object
}