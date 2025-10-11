// src/lib/normalize-ads.ts
import { safeJson } from "@/lib/normalize";

export type ImpressionRange = { min: number; max: number };
export type PlatformStat = { name: string; impression: ImpressionRange };
export type RegionPlatformStat = { name: string; impression: ImpressionRange };
export type RegionStat = {
  name: string; 
  shortCode?: string | null;
  firstShown?: string | null; 
  lastShown?: string | null;
  impression: ImpressionRange;
  byPlatform?: RegionPlatformStat[];
};

export type GoogleAdCreative = {
  url: string | null;
  type: string | null;
  variants: string[];
  lastShown?: string | null;
  advertiser?: { 
    id?: string; 
    name?: string; 
    legalName?: string; 
    regionCode?: string | null 
  };
  stats?: { 
    byPlatform?: PlatformStat[]; 
    byRegion?: RegionStat[] 
  };
  targeting?: {
    locations?: { including?: boolean; excluding?: boolean };
    demographics?: { including?: boolean; excluding?: boolean };
    customerLists?: { including?: boolean; excluding?: boolean };
    topicsOfInterest?: { including?: boolean; excluding?: boolean };
    contextualSignals?: { including?: boolean; excluding?: boolean };
  };
};

export function mid(r?: ImpressionRange): number {
  if (!r) return 0;
  const a = Number(r.min ?? 0), b = Number(r.max ?? 0);
  if (a === 0 && b === 0) return 0;
  if (a && b) return (a + b) / 2;
  return a || b || 0;
}

export function normalizeGoogleAds(src: any): GoogleAdCreative[] {
  const arr = safeJson<any[]>(src, []);
  // Filter out NO_ADS entries
  const validAds = arr.filter((x) => x?.type !== "NO_ADS");
  return validAds.map((x) => ({
    url: x?.url ?? null,
    type: x?.type ?? null,
    variants: Array.isArray(x?.variants) ? x.variants.filter(Boolean) : [],
    lastShown: x?.lastShown ?? null,
    advertiser: x?.advertiser ?? {},
    stats: {
      byPlatform: (x?.stats?.byPlatform ?? []).map((p: any) => ({
        name: String(p?.name ?? "").trim(),
        impression: { 
          min: Number(p?.impression?.min ?? 0), 
          max: Number(p?.impression?.max ?? 0) 
        },
      })),
      byRegion: (x?.stats?.byRegion ?? []).map((r: any) => ({
        name: String(r?.name ?? "").trim(),
        shortCode: r?.shortCode ?? null,
        firstShown: r?.firstShown ?? null,
        lastShown: r?.lastShown ?? null,
        impression: { 
          min: Number(r?.impression?.min ?? 0), 
          max: Number(r?.impression?.max ?? 0) 
        },
        byPlatform: (r?.byPlatform ?? []).map((rp: any) => ({
          name: String(rp?.name ?? "").trim(),
          impression: { 
            min: Number(rp?.impression?.min ?? 0), 
            max: Number(rp?.impression?.max ?? 0) 
          },
        })),
      })),
    },
    targeting: x?.targeting ?? {},
  }));
}

export function aggregateGoogleAds(items: GoogleAdCreative[]) {
  const allPlatforms: Record<string, number> = {};
  const allRegions: Record<string, number> = {};
  let freshest: string | null = null;

  for (const c of items) {
    // global platforms
    for (const p of (c.stats?.byPlatform ?? [])) {
      allPlatforms[p.name] = (allPlatforms[p.name] ?? 0) + mid(p.impression);
    }
    // regions
    for (const r of (c.stats?.byRegion ?? [])) {
      allRegions[r.name] = (allRegions[r.name] ?? 0) + mid(r.impression);
      if (r.lastShown && (!freshest || new Date(r.lastShown) > new Date(freshest))) {
        freshest = r.lastShown;
      }
    }
    if (c.lastShown && (!freshest || new Date(c.lastShown) > new Date(freshest))) {
      freshest = c.lastShown;
    }
  }

  const platformRows = Object.entries(allPlatforms)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const regionRows = Object.entries(allRegions)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // KPIs
  const kpis = {
    creatives: items.length,
    platforms: Object.keys(allPlatforms).length,
    regions: Object.keys(allRegions).length,
    lastShown: freshest,
  };

  return { kpis, platformRows, regionRows };
}

export function prettyRelative(date?: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(+d)) return null;
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export interface MetaAd {
  title?: string;
  description?: string;
  page_name?: string;
  url?: string;
  ad_library_url?: string;
  start_date?: string;
  end_date?: string;
  is_active?: boolean;
  entity_type?: string;
  categories?: string[];
  advertiser?: {
    name?: string;
    id?: string;
  };
  targeting?: {
    age_audience?: any;
    gender_audience?: any;
    geo_locations?: any;
  };
  impressions?: number;
  spend?: number;
}

function extractSnapshotText(snapshot: any): string | null {
  if (!snapshot) return null;
  
  if (typeof snapshot === 'string') {
    // Extract text between quotes after "text":"
    const match = snapshot.match(/"text":"([^"]+)"/);
    if (match) return match[1];
  }
  
  if (typeof snapshot === 'object') {
    // Try to find body.text
    if (snapshot.body?.text) return snapshot.body.text;
    // Try to find direct text property
    if (snapshot.text) return snapshot.text;
  }
  
  return null;
}

function extractSnapshotUrl(snapshot: any): string | null {
  if (!snapshot) return null;
  
  if (typeof snapshot === 'string') {
    // Extract URL from snapshot string
    const match = snapshot.match(/https?:\/\/[^\s"]+/);
    if (match) return match[0];
  }
  
  if (typeof snapshot === 'object' && snapshot.link_url) {
    return snapshot.link_url;
  }
  
  return null;
}

function parseTargeting(aaaInfo: any) {
  if (!aaaInfo) return null;
  
  try {
    const parsed = typeof aaaInfo === 'string' ? JSON.parse(aaaInfo) : aaaInfo;
    return {
      age_audience: parsed.age_audience || null,
      gender_audience: parsed.gender_audience || null,
      geo_locations: parsed.geo_locations || null,
    };
  } catch {
    return null;
  }
}

export function normalizeMetaAds(src: any): MetaAd[] {
  const arr = safeJson<any[]>(src, []);
  
  return arr.map((item) => {
    const snapshotText = extractSnapshotText(item?.snapshot);
    const snapshotUrl = extractSnapshotUrl(item?.snapshot);
    
    // Parse advertiser
    let advertiserName = null;
    let advertiserId = null;
    if (item?.advertiser) {
      const adv = typeof item.advertiser === 'string' ? JSON.parse(item.advertiser) : item.advertiser;
      if (adv?.page) {
        advertiserName = adv.page.name || null;
        advertiserId = adv.page.id || null;
      }
    }
    
    return {
      title: snapshotText || item?.page_name || 'Untitled Ad',
      description: item?.page_name || null,
      page_name: item?.page_name || null,
      url: snapshotUrl || item?.url || null,
      ad_library_url: item?.ad_library_url || null,
      start_date: item?.start_date ? String(item.start_date) : null,
      end_date: item?.end_date ? String(item.end_date) : null,
      is_active: item?.is_active === true || item?.is_active === 'true',
      entity_type: item?.entity_type || null,
      categories: Array.isArray(item?.categories) ? item.categories : null,
      advertiser: advertiserName ? { name: advertiserName, id: advertiserId } : null,
      targeting: parseTargeting(item?.aaa_info),
      impressions: item?.total || null,
      spend: item?.spend || null,
    };
  });
}
