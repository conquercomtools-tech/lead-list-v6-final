import { safeJsonWithFlag } from "@/lib/normalize";

export type FundingRound = {
  id: string;
  roundType?: string | null;
  amount?: number | null;
  amountFormatted?: string | null;
  date?: string | null;
  investors?: string[];
  leadInvestor?: string | null;
  valuation?: number | null;
  valuationFormatted?: string | null;
  source?: string | null;
};

export type FundingKPI = {
  totalFunding: number;
  totalRounds: number;
  latestRound?: string | null;
  latestAmount?: number | null;
  lastValuation?: number | null;
};

export type FundingByType = {
  type: string;
  amount: number;
  count: number;
  share: number;
};

export type FundingTimeline = {
  date: string;
  amount: number;
  roundType: string;
  cumulativeTotal: number;
};

export type AcquisitionEvent = {
  id: string;
  type: "acquired" | "acquired_by" | "acquirer" | null;
  date?: string | null;
  amount?: number | null;
  amountFormatted?: string | null;
  acquirer?: string | null;
  acquired?: string | null;
  status?: string | null;
};

export type FundingNormalized = {
  hasData: boolean;
  kpis: FundingKPI;
  rounds: FundingRound[];
  byType: FundingByType[];
  timeline: FundingTimeline[];
  acquisitions: AcquisitionEvent[];
  topInvestors: { name: string; count: number }[];
  notes: string[];
};

function parseAmount(val: any): number | null {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }
  return null;
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount || amount === 0) return "—";
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function parseDate(val: any): string | null {
  if (!val) return null;
  try {
    const date = new Date(val);
    if (isNaN(date.getTime())) return typeof val === "string" ? val : null;
    return date.toISOString();
  } catch {
    return typeof val === "string" ? val : null;
  }
}

function cryptoRandom() {
  try {
    return crypto.getRandomValues(new Uint32Array(1))[0].toString(36);
  } catch {
    return Math.random().toString(36).slice(2);
  }
}

export function normalizeFunding(raw: unknown): FundingNormalized {
  const { value: json } = safeJsonWithFlag<any>(raw, {});
  
  let fundingData: any[] = [];
  let acquisitionData: any[] = [];
  
  // Handle different possible structures
  if (Array.isArray(json)) {
    fundingData = json.filter(item => item && !item.type?.includes("acquisition"));
    acquisitionData = json.filter(item => item && item.type?.includes("acquisition"));
  } else if (json && typeof json === "object") {
    if (json.funding_rounds || json.fundingRounds) {
      fundingData = Array.isArray(json.funding_rounds) 
        ? json.funding_rounds 
        : Array.isArray(json.fundingRounds) 
        ? json.fundingRounds 
        : [];
    }
    if (json.acquisitions) {
      acquisitionData = Array.isArray(json.acquisitions) ? json.acquisitions : [];
    }
    // If it's a single round object
    if (json.round_type || json.roundType || json.amount) {
      fundingData = [json];
    }
  }

  // Parse funding rounds
  const rounds: FundingRound[] = fundingData.map((item) => {
    const amount = parseAmount(item.amount || item.money_raised || item.funding_amount);
    const valuation = parseAmount(item.valuation || item.post_money_valuation);
    
    const investors = [];
    if (Array.isArray(item.investors)) {
      investors.push(...item.investors.map((i: any) => typeof i === "string" ? i : i.name || i.investor_name).filter(Boolean));
    } else if (typeof item.investors === "string") {
      investors.push(item.investors);
    }
    if (item.lead_investor || item.leadInvestor) {
      investors.unshift(item.lead_investor || item.leadInvestor);
    }

    return {
      id: item.id || item.uuid || cryptoRandom(),
      roundType: item.round_type || item.roundType || item.funding_type || item.series || null,
      amount,
      amountFormatted: formatCurrency(amount),
      date: parseDate(item.date || item.announced_on || item.funding_date),
      investors: Array.from(new Set(investors)),
      leadInvestor: item.lead_investor || item.leadInvestor || investors[0] || null,
      valuation,
      valuationFormatted: formatCurrency(valuation),
      source: item.source || null,
    };
  }).sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Parse acquisitions
  const acquisitions: AcquisitionEvent[] = acquisitionData.map((item) => ({
    id: item.id || item.uuid || cryptoRandom(),
    type: item.type || (item.acquirer ? "acquired" : item.acquired ? "acquirer" : null),
    date: parseDate(item.date || item.announced_on || item.acquisition_date),
    amount: parseAmount(item.amount || item.price),
    amountFormatted: formatCurrency(parseAmount(item.amount || item.price)),
    acquirer: item.acquirer || item.acquirer_name || null,
    acquired: item.acquired || item.acquired_name || null,
    status: item.status || item.acquisition_status || null,
  })).sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  // Calculate KPIs
  const totalFunding = rounds.reduce((sum, r) => sum + (r.amount || 0), 0);
  const latestRound = rounds[0];
  const lastValuation = rounds.find(r => r.valuation)?.valuation || null;

  const kpis: FundingKPI = {
    totalFunding,
    totalRounds: rounds.length,
    latestRound: latestRound?.roundType || null,
    latestAmount: latestRound?.amount || null,
    lastValuation,
  };

  // Group by round type
  const typeMap = new Map<string, { amount: number; count: number }>();
  for (const round of rounds) {
    const type = round.roundType || "Unknown";
    const current = typeMap.get(type) || { amount: 0, count: 0 };
    typeMap.set(type, {
      amount: current.amount + (round.amount || 0),
      count: current.count + 1,
    });
  }

  const byType: FundingByType[] = Array.from(typeMap.entries())
    .map(([type, { amount, count }]) => ({
      type,
      amount,
      count,
      share: totalFunding > 0 ? (amount / totalFunding) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Timeline
  let cumulative = 0;
  const timeline: FundingTimeline[] = rounds
    .slice()
    .reverse()
    .map((round) => {
      cumulative += round.amount || 0;
      return {
        date: round.date || "Unknown",
        amount: round.amount || 0,
        roundType: round.roundType || "Unknown",
        cumulativeTotal: cumulative,
      };
    });

  // Top investors
  const investorMap = new Map<string, number>();
  for (const round of rounds) {
    for (const inv of round.investors) {
      investorMap.set(inv, (investorMap.get(inv) || 0) + 1);
    }
  }
  const topInvestors = Array.from(investorMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Generate notes
  const notes: string[] = [];
  const hasData = rounds.length > 0 || acquisitions.length > 0;
  
  if (!hasData) {
    notes.push("No funding or acquisition data available.");
  } else {
    if (rounds.length > 0) {
      const recentRounds = rounds.filter(r => {
        if (!r.date) return false;
        const date = new Date(r.date);
        const monthsAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 30);
        return monthsAgo <= 12;
      });
      if (recentRounds.length > 0) {
        notes.push(`${recentRounds.length} funding round(s) in the last 12 months.`);
      }
    }
    if (acquisitions.length > 0) {
      notes.push(`${acquisitions.length} acquisition event(s) recorded.`);
    }
    if (totalFunding > 0) {
      notes.push(`Total capital raised: ${formatCurrency(totalFunding)}.`);
    }
  }

  return {
    hasData,
    kpis,
    rounds,
    byType,
    timeline,
    acquisitions,
    topInvestors,
    notes,
  };
}
