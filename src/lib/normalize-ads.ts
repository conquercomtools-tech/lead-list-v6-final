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
