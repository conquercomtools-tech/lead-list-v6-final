import { safeJson } from './normalize';

export type FundingAgg = { totalFunding?: number; latestFunding?: number; lastRaisedAt?: string | null };

export function extractFunding(row: any): FundingAgg {
  // 1) direct numeric columns (new + old)
  const totalFunding =
    Number(row?.funding_total ?? row?.total_funding ?? row?.TotalFunding ?? row?.totalFunding ?? row?.['Total Funding'] ?? 0) || 0;

  // latest & lastRaisedAt: accept explicit columns, else infer from JSON
  let latestFunding =
    Number(row?.latest_funding_amount ?? row?.LatestFundingAmount ?? row?.['Latest Funding Amount'] ?? row?.latest_funding ?? row?.['Latest Funding'] ?? 0) || 0;
  let lastRaisedAt =
    (row?.last_raised_at ?? row?.LastRaisedAt ?? row?.['Last Raised At'] ?? null) as string | null;

  // 2) rounds JSON: prefer "funding_acquisition" (aliased), else legacy keys
  const fa = safeJson<any[]>(row?.funding_acquisition ?? row?.['funding and acquisition'], []);
  if (Array.isArray(fa) && fa.length) {
    const rounds = fa.filter((r) => r?.type || r?.amount || r?.money_raised || r?.announced_on || r?.date);
    rounds.sort((a,b) => new Date(b?.date || b?.announced_on || 0).getTime() - new Date(a?.date || a?.announced_on || 0).getTime());
    const latest = rounds[0];
    latestFunding = latestFunding || Number(latest?.amount ?? latest?.money_raised ?? 0) || 0;
    lastRaisedAt  = lastRaisedAt  || (latest?.date || latest?.announced_on || null);
  }

  // 3) Crunchbase fallback (date only)
  if (!lastRaisedAt) {
    const cb = safeJson<any>(row?.CRUNCHBASE ?? row?.crunchbase, null);
    const last = cb?.page?.data?.overview?.last_funding_date || cb?.last_funding_date;
    if (last) lastRaisedAt = last;
  }

  return { totalFunding, latestFunding, lastRaisedAt };
}

export function extractEV(row: any): number | undefined {
  const ev = safeJson<any>(row?.Ev_Estimation ?? row?.ev_estimation, null);
  const v = Number(ev?.ev ?? ev?.ev_estimate ?? ev?.estimate ?? 0);
  return v > 0 ? v : undefined;
}

export function hasJsonItems(val: any): boolean {
  const v = safeJson<any>(val, null);
  if (!v) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === 'object') return Object.keys(v).length > 0;
  return false;
}
