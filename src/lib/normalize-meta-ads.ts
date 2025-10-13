import { safeJsonWithFlag } from "@/lib/normalize";

export type MetaAdsKPI = {
  creatives: number;
  platforms: number;
  regions: number;
  activeCreatives: number;
};

export type MetaPlatformStat = { name: string; impressions?: number | null; estLabel?: string };
export type MetaRegionStat   = { name: string; impressions?: number | null; estLabel?: string };

export type MetaCreative = {
  id: string;
  url?: string;
  title?: string | null;
  body?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  pageName?: string | null;
  pageProfileUrl?: string | null;
  pageProfilePictureUrl?: string | null;
  displayFormat?: string | null;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  publisherPlatforms?: string[];
  categories?: string[];
  entityType?: string | null;
  targeting?: {
    ageMin?: number | null;
    ageMax?: number | null;
    gender?: string | null;
    locations?: string[];
    countries?: string[];
  };
  media?: {
    videoPreview?: string | null;
    videoHd?: string | null;
    videoSd?: string | null;
    images?: string[];
  };
};

export type MetaAdsNormalized = {
  hasData: boolean;
  kpis: MetaAdsKPI;
  platforms: MetaPlatformStat[];
  regions: MetaRegionStat[];
  creatives: MetaCreative[];
  notes: string[];
};

function toISOFromEpoch(sec?: number | null) {
  if (!sec || sec <= 0) return null;
  try { return new Date(sec * 1000).toISOString(); } catch { return null; }
}

function coerceId(item: any): string {
  return (
    item?.ad_archive_id ||
    item?.ad_id ||
    item?.creativeId ||
    item?.url ||
    cryptoRandom()
  );
}

function cryptoRandom() {
  try { return crypto.getRandomValues(new Uint32Array(1))[0].toString(36); } catch { return Math.random().toString(36).slice(2); }
}

// Impressions in Ad Library are often ranges (min/max). Prefer midpoint when both exist, else null.
// For display, return both numeric midpoint and a label like "0–1K" if available.
function midpoint(range?: { min?: number; max?: number } | null): { value: number | null; label?: string } {
  if (!range || (range.min == null && range.max == null)) return { value: null };
  const min = range.min ?? 0;
  const max = range.max ?? min;
  if (min === 0 && max === 0) return { value: 0, label: "0" };
  const mid = Math.round((min + max) / 2);
  // Build label like "0–1K"
  const fmt = (n: number) => (n >= 1000 ? `${(n/1000).toFixed(n >= 10000 ? 0 : 1)}K` : `${n}`);
  return { value: mid, label: `${fmt(min)}–${fmt(max)}` };
}

function parsePlatforms(item: any): string[] {
  const arr = Array.isArray(item?.publisher_platform) ? item.publisher_platform : item?.snapshot?.publisher_platform;
  return Array.isArray(arr) ? Array.from(new Set(arr.map(String))) : [];
}

function parseRegions(item: any): string[] {
  const fromCountryBreakdown = item?.aaa_info?.age_country_gender_reach_breakdown?.flatMap((c: any) => c?.country ? [String(c.country)] : []) || [];
  const fromLocations = item?.aaa_info?.location_audience?.flatMap((l: any) => l?.name ? [String(l.name)] : []) || [];
  const fromTargeted = Array.isArray(item?.targeted_or_reached_countries) ? item.targeted_or_reached_countries.map(String) : [];
  const all = [...fromCountryBreakdown, ...fromLocations, ...fromTargeted];
  return Array.from(new Set(all));
}

function firstNonEmpty<T = string>(...vals: any[]): T | null {
  for (const v of vals) {
    if (v === 0 || (Array.isArray(v) && v.length) || (typeof v === "string" && v.trim()) || (v && typeof v === "object")) return v as T;
  }
  return null;
}

export function normalizeMetaAds(raw: unknown): MetaAdsNormalized {
  const { value: json } = safeJsonWithFlag<any>(raw, null);
  const arr: any[] = Array.isArray(json) ? json : [];
  // Handle sentinel cases like [{ type: "NO_ADS" }] gracefully:
  const filtered = arr.filter((x) => x && x.type !== "NO_ADS");

  const creatives: MetaCreative[] = filtered.map((item) => {
    const snap = item?.snapshot || {};
    const body = snap?.body?.text ?? null;
    const title = snap?.title ?? null;
    const ctaText = snap?.cta_text ?? null;
    const ctaUrl = snap?.link_url ?? null;

    const mediaImages = Array.isArray(snap?.images) ? snap.images.map(String) : [];
    const videos = Array.isArray(snap?.videos) ? snap.videos : [];
    const preview = firstNonEmpty(
      videos?.[0]?.video_preview_image_url,
      mediaImages?.[0],
      null
    ) as string | null;

    const dates = {
      start: firstNonEmpty(toISOFromEpoch(item?.start_date), item?.start_date_formatted),
      end:   firstNonEmpty(toISOFromEpoch(item?.end_date),   item?.end_date_formatted),
    };

    const platforms = parsePlatforms(item);
    const regions = parseRegions(item);

    const ageMin = item?.aaa_info?.age_audience?.min ?? null;
    const ageMax = item?.aaa_info?.age_audience?.max ?? null;
    const gender = item?.aaa_info?.gender_audience ?? null;

    return {
      id: coerceId(item),
      url: item?.ad_library_url || item?.url,
      title,
      body,
      ctaText,
      ctaUrl,
      pageName: snap?.page_name ?? item?.advertiser?.ad_library_page_info?.page_info?.page_name ?? null,
      pageProfileUrl: snap?.page_profile_uri ?? null,
      pageProfilePictureUrl: snap?.page_profile_picture_url ?? item?.advertiser?.ad_library_page_info?.page_info?.profile_photo ?? null,
      displayFormat: snap?.display_format ?? item?.type ?? null,
      isActive: item?.is_active ?? null,
      startDate: dates.start ? String(dates.start) : null,
      endDate: dates.end ? String(dates.end) : null,
      publisherPlatforms: platforms,
      categories: Array.isArray(item?.categories) ? item.categories.map(String) : [],
      entityType: item?.entity_type ?? null,
      targeting: {
        ageMin, ageMax, gender,
        locations: Array.isArray(item?.aaa_info?.location_audience) ? item.aaa_info.location_audience.map((l: any) => String(l?.name)).filter(Boolean) : [],
        countries: Array.isArray(item?.targeted_or_reached_countries) ? item.targeted_or_reached_countries.map(String) : [],
      },
      media: {
        videoPreview: preview,
        videoHd: videos?.[0]?.video_hd_url ?? null,
        videoSd: videos?.[0]?.video_sd_url ?? null,
        images: mediaImages,
      },
    };
  });

  // Platform & Region aggregations using midpoint labels if available:
  const platformMap = new Map<string, { val: number | null, label?: string }>();
  const regionMap   = new Map<string, { val: number | null, label?: string }>();

  for (const item of filtered) {
    // 1) Platforms
    const platforms = parsePlatforms(item);
    // Try a total byPlatform range if present
    const byPlatform = Array.isArray(item?.stats?.byPlatform) ? item.stats.byPlatform : [];
    for (const p of platforms.length ? platforms : byPlatform.map((p: any) => p?.name).filter(Boolean)) {
      const current = platformMap.get(p) || { val: 0, label: undefined };
      const platStat = byPlatform.find((bp: any) => String(bp?.name) === String(p));
      const mid = midpoint(platStat?.impression);
      if (mid.value != null) current.val = (current.val ?? 0) + mid.value;
      platformMap.set(p, { val: current.val ?? null, label: mid.label || current.label });
    }

    // 2) Regions
    const byRegion = Array.isArray(item?.stats?.byRegion) ? item.stats.byRegion : [];
    const regionNames = parseRegions(item);
    // Prefer stats.byRegion if available:
    if (byRegion.length) {
      for (const r of byRegion) {
        const name = String(r?.name || r?.shortCode || "Unknown");
        const mid = midpoint(r?.impression);
        const current = regionMap.get(name) || { val: 0, label: undefined };
        if (mid.value != null) current.val = (current.val ?? 0) + mid.value;
        regionMap.set(name, { val: current.val ?? null, label: mid.label || current.label });
      }
    } else {
      for (const name of regionNames) {
        const current = regionMap.get(name) || { val: null, label: undefined };
        regionMap.set(name, current); // no numeric when not provided
      }
    }
  }

  const platforms: MetaPlatformStat[] = Array.from(platformMap.entries())
    .map(([name, { val, label }]) => ({ name, impressions: val, estLabel: label }))
    .sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0))
    .slice(0, 5);

  const regions: MetaRegionStat[] = Array.from(regionMap.entries())
    .map(([name, { val, label }]) => ({ name, impressions: val, estLabel: label }))
    .sort((a, b) => (b.impressions ?? 0) - (a.impressions ?? 0))
    .slice(0, 5);

  const kpis: MetaAdsKPI = {
    creatives: creatives.length,
    platforms: new Set(creatives.flatMap(c => c.publisherPlatforms || [])).size,
    regions: new Set(creatives.flatMap(c => (c.targeting?.countries || []).concat(c.targeting?.locations || []))).size,
    activeCreatives: creatives.filter(c => c.isActive).length,
  };

  const hasData = creatives.length > 0;

  const notes: string[] = [];
  if (!hasData) notes.push("No Meta Ads creatives found for this advertiser.");
  // Explain midpoint estimates if we displayed any ranges:
  if (platforms.some(p => p.estLabel) || regions.some(r => r.estLabel)) {
    notes.push("Impression numbers show midpoint estimates derived from min–max ranges where available.");
  }

  return { hasData, kpis, platforms, regions, creatives, notes };
}
