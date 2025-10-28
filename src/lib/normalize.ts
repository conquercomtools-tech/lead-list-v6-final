export function safeJson<T = unknown>(val: any, fallback: T): T {
  if (val == null) return fallback;
  if (typeof val === 'object') return val as T;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

export function safeJsonWithFlag<T = unknown>(val: any, fallback: T): { value: T; invalid: boolean } {
  if (val == null) return { value: fallback, invalid: false };
  if (typeof val === 'object') return { value: val as T, invalid: false };
  if (typeof val === 'string') {
    try {
      return { value: JSON.parse(val) as T, invalid: false };
    } catch {
      return { value: fallback, invalid: true };
    }
  }
  return { value: fallback, invalid: false };
}

export const prettyMoney = (n?: number | null): string => {
  if (n == null || isNaN(Number(n))) return 'N/A';
  const v = Number(n);
  if (Math.abs(v) >= 1_000_000_000) return `$${(v / 1_000_000_000).toFixed(1).replace(/\.0$/, '')}B`;
  if (Math.abs(v) >= 1_000_000) return `$${(v / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (Math.abs(v) >= 1_000) return `$${(v / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `$${v.toLocaleString()}`;
};

export function parseDomainFromUrl(url?: string | null): string | undefined {
  if (!url) return;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return;
  }
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

export type LIContent = {
  date?: string;
  name?: string;
  post_type?: string;
  summaries?: string[];
  pain_points?: string[];
  brag_metrics?: string[];
  voice_phrases?: string[];
  stated_priorities?: string[];
  events_conferences?: string[];
  // pass-through for anything extra
  _extra?: Record<string, any>;
};

export function normalizeLinkedInPostsFromMessages(src: any): LIContent[] {
  const arr = safeJson<any[]>(src, []);
  return arr.map((item) => {
    const content = item?.message?.content ?? {};
    // merge priority_buckets into flat fields if present
    const pb = content?.priority_buckets ?? {};
    const obj: LIContent = {
      date: content?.date,
      name: content?.name,
      post_type: content?.post_type,
      summaries: toArray(content?.summaries),
      pain_points: toArray(content?.pain_points ?? pb?.pain_points),
      brag_metrics: toArray(content?.brag_metrics ?? pb?.brag_metrics),
      voice_phrases: toArray(content?.voice_phrases),
      stated_priorities: toArray(content?.stated_priorities ?? pb?.stated_priorities),
      events_conferences: toArray(content?.events_conferences ?? pb?.events_conferences),
      _extra: {}
    };

    // keep any other keys from content (so we don't "miss" anything)
    for (const k of Object.keys(content)) {
      if (!(k in obj) && k !== 'priority_buckets') obj._extra![k] = content[k];
    }
    return obj;
  })
  // sort newest first if date provided
  .sort((a,b) => (b.date || '').localeCompare(a.date || ''));
}

export function normalizeBasicInfo(src:any){
  const o = safeJson<any>(src, {});
  return {
    fullname: o?.fullname ?? '',
    first_name: o?.first_name ?? '',
    last_name: o?.last_name ?? '',
    headline: o?.headline ?? '',
    location_full: o?.location?.full ?? o?.location ?? '',
    location_city: o?.location?.city ?? '',
    location_country: o?.location?.country ?? '',
    current_company: o?.current_company ?? '',
    current_company_url: o?.current_company_url ?? '',
    profile_picture_url: o?.profile_picture_url ?? o?.profile_image ?? o?.photo ?? null,
  };
}

// ---------- COMPANY: array of items with message.content ----------
export type CompanyContent = {
  url: string | null;
  ctas: string[];
  summary: string | null;
  contacts: { emails: string[]; phones: string[]; social: string[] };
  headline: string | null;
  products: string[];
  page_type: string | null;
  value_props: string[];
};

export function normalizeCompanyDataFromMessages(src: any): CompanyContent[] {
  const arr = safeJson<any[]>(src, []);
  return arr.map((item) => {
    const c = item?.message?.content ?? {};
    const url = (c?.url ?? null);
    return {
      url: (url === '' ? null : url),
      ctas: toArray(c?.ctas),
      summary: c?.summary ?? null,
      contacts: {
        emails: toArray(c?.contacts?.emails),
        phones: toArray(c?.contacts?.phones),
        social: toArray(c?.contacts?.social),
      },
      headline: c?.headline ?? null,
      products: toArray(c?.products),
      page_type: c?.page_type ?? null,
      value_props: toArray(c?.value_props),
    };
  });
}

export function aggregateCompanySnapshot(items: CompanyContent[]) {
  const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));
  const firstNonEmpty = (arr: (string|null|undefined)[]) => (arr.find(v => !!v) ?? null);

  const emails:string[]=[]; const phones:string[]=[]; const social:string[]=[];
  const ctas:string[]=[]; const products:string[]=[]; const value_props:string[]=[];
  const headlines:(string|null)[]=[]; const summaries:(string|null)[]=[]; const urls:(string|null)[]=[];
  const pageTypeCounts: Record<string, number> = {};

  for (const it of items) {
    emails.push(...it.contacts.emails);
    phones.push(...it.contacts.phones);
    social.push(...it.contacts.social);
    ctas.push(...it.ctas);
    products.push(...it.products);
    value_props.push(...it.value_props);
    headlines.push(it.headline);
    summaries.push(it.summary);
    urls.push(it.url);
    if (it.page_type) pageTypeCounts[it.page_type] = (pageTypeCounts[it.page_type] ?? 0) + 1;
  }

  return {
    primaryHeadline: firstNonEmpty(headlines),
    primarySummary: firstNonEmpty(summaries),
    primaryUrl: firstNonEmpty(urls),
    emails: uniq(emails),
    phones: uniq(phones),
    social: uniq(social),
    ctas: uniq(ctas),
    products: uniq(products),
    value_props: uniq(value_props),
    pageTypeCounts,
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

// ---------- YOUTUBE: single object ----------
export type YouTubeSummary = {
  summary: string | null;
  pain_points: string[];
  brag_metrics: string[];
  notable_quotes: string[];
  stated_priorities: string[];
};

export function normalizeYouTubeSummary(src: any): { data: YouTubeSummary; invalid: boolean } {
  const { value, invalid } = safeJsonWithFlag<any>(src, {});
  const data: YouTubeSummary = {
    summary: value?.summary ?? null,
    pain_points: toArray(value?.pain_points),
    brag_metrics: toArray(value?.brag_metrics),
    notable_quotes: toArray(value?.notable_quotes),
    stated_priorities: toArray(value?.stated_priorities),
  };
  return { data, invalid };
}

// ---------- COMPETITORS: array of items ----------
export type CompetitorItem = {
  name: string;
  website: string | null;
  description: string | null;
  readable: string | null;
};

const urlFromReadable = (r?: string|null): string | null => {
  if (!r) return null;
  const m = r.match(/\((https?:\/\/[^)]+)\)/i);
  return m ? m[1] : null;
};

export function normalizeCompetitors(src: any): { items: CompetitorItem[]; invalid: boolean } {
  const { value, invalid } = safeJsonWithFlag<any[]>(src, []);
  const seen = new Set<string>();
  const items: CompetitorItem[] = (Array.isArray(value) ? value : []).map((c) => {
    const rawUrl = c?.website || urlFromReadable(c?.readable) || null;
    const url = rawUrl ? (rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`) : null;
    const name = (c?.name ?? '').toString().trim();
    const description = (c?.description ?? null);
    const readable = (c?.readable ?? null);
    return { name, website: url, description, readable };
  }).filter(x => x.name);

  const deduped = items.filter(i => {
    const key = `${i.name.toLowerCase()}|${i.website ?? ''}`;
    if (seen.has(key)) return false; seen.add(key); return true;
  }).sort((a,b) => a.name.localeCompare(b.name));

  return { items: deduped, invalid };
}

export const normalizeFreeText = (v: any): string => (v == null ? '' : (typeof v === 'string' ? v : String(v)));

export const normalizeDateLoose = (s?: string|null): string => {
  if (!s) return '—';
  if (/unknown/i.test(s)) return 'Unknown';
  const d = new Date(s);
  return isNaN(d.getTime()) ? s : d.toISOString().slice(0,10);
};

export type EventItem = {
  person: string | null;
  event: string | null;
  date: string | null;     // formatted or raw
  summary: string | null;
  youtube: string | null;  // url or null
};

/** Parse `events` plain-text into structured items */
export function parseEventsText(src: any): EventItem[] {
  const raw = normalizeFreeText(src).trim();
  if (!raw) return [];

  // split blocks by '---' on its own line or surrounded by newlines
  const blocks = raw.split(/\n?-{3,}\n?/g).map(b => b.trim()).filter(Boolean);

  const items: EventItem[] = blocks.map((block) => {
    const lines = block.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const kv: Record<string,string> = {};

    for (const line of lines) {
      const m = line.match(/^\s*([A-Za-z ]+)\s*:\s*(.*)$/);
      if (m) {
        const key = m[1].toLowerCase().replace(/\s+/g,'_'); // e.g. 'Person Used' -> 'person_used'
        kv[key] = m[2].trim();
      }
    }

    // extract & clean
    let youtube = kv['youtube'] || null;
    if (youtube && /none/i.test(youtube)) youtube = null;
    const urlMatch = youtube ? youtube.match(/https?:\/\/\S+/) : null;
    if (urlMatch) youtube = urlMatch[0];

    return {
      person: kv['person_used'] ?? null,
      event: kv['event'] ?? null,
      date: normalizeDateLoose(kv['date'] ?? null),
      summary: kv['summary'] ?? null,
      youtube
    };
  });

  return items;
}

export type ImportantUrl = { url: string; host: string; label: string };

const normalizeUrlString = (u: string): string | null => {
  if (!u) return null;
  let url = u.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  try {
    const parsed = new URL(url);
    return parsed.href;
  } catch {
    return null;
  }
};

const prettyLabel = (href: string) => {
  try {
    const u = new URL(href);
    const path = u.pathname.replace(/\/$/, '');
    return path ? `${u.host}${path}` : u.host;
  } catch { return href; }
};

export function normalizeImportantUrls(src: any): { items: ImportantUrl[]; invalid: boolean } {
  // First try JSON path: { results: [{ url: string }, ...] }
  const { value, invalid } = safeJsonWithFlag<any>(src, {});
  let urls: string[] = [];

  if (value && Array.isArray(value.results)) {
    urls = value.results.map((r: any) => r?.url).filter(Boolean);
  }

  // If JSON path empty, fall back to regex extraction from raw text
  if (urls.length === 0) {
    const text = typeof src === 'string' ? src : JSON.stringify(src ?? '');
    const found = text.match(/https?:\/\/[^\s)]+/gi) ?? [];
    urls = found;
  }

  // Normalize, dedupe, and map to display info
  const seen = new Set<string>();
  const items: ImportantUrl[] = [];
  for (const raw of urls) {
    const href = normalizeUrlString(String(raw) || '');
    if (!href) continue;
    if (seen.has(href)) continue;
    seen.add(href);
    const u = new URL(href);
    items.push({ url: href, host: u.host, label: prettyLabel(href) });
  }

  // sort by host then path for consistency
  items.sort((a, b) => a.label.localeCompare(b.label));
  return { items, invalid };
}