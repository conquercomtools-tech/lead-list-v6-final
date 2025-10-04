// EV Estimation normalization and utilities


export type EVEstimate = {
  low: number;
  base: number;
  high: number;
  currency?: string;
};

export type ARRAssumptions = {
  low: number;
  base: number;
  high: number;
};

export type EVEstimationData = {
  domain?: string;
  company?: string;
  country?: string;
  industry?: string;
  input_summary?: {
    region?: string;
    employees?: number;
    heat_current?: number;
    growth_current?: number;
    last_raised_at?: string;
    employees_range?: string;
    stage_normalized?: string;
    total_funding_usd?: number;
    annual_revenue_usd?: number | null;
    latest_round_label?: string;
    website_bounce_rate?: number;
    monthly_website_visits?: number;
    latest_round_amount_usd?: number;
    website_authority_score?: number;
    last_funding_record_note?: string;
  };
  final_rationale?: string[];
  final_ev_estimate_usd?: EVEstimate;
  arr_multiple_cross_check?: {
    ARR_assumptions_usd?: ARRAssumptions;
    multiple_assumptions_by_scenario?: Record<string, any>;
    derived_valuations_from_arr_and_multiples_usd?: Record<string, any>;
  };
  confidence_and_key_risks?: {
    confidence_score?: number;
    explanation?: string;
    key_risks?: string[];
  };
  funding_round_valuation_logic?: {
    last_round_amount_usd?: number;
    assumed_equity_pct_sold?: number[];
    implied_post_money_usd_for_each_assumption?: number[];
    interpretation?: string;
  };
  important_data_issues_and_assumptions?: string[];
};

export function normalizeEVEstimation(src: any): { data: EVEstimationData; invalid: boolean } {
  let record = src;
  let invalid = false;

  const tryParseJSON = (s: string): any | null => {
    try { return JSON.parse(s); } catch { return null; }
  };

  const extractJsonFromString = (s: string): any | null => {
    if (!s) return null;
    let text = String(s).trim();
    // strip code fences if present
    text = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    // Attempt direct parse
    const direct = tryParseJSON(text);
    if (direct) return direct;
    // Fallback: find first JSON object in the string
    const first = text.indexOf('{');
    const last = text.lastIndexOf('}');
    if (first !== -1 && last !== -1 && last > first) {
      const candidate = text.slice(first, last + 1);
      return tryParseJSON(candidate);
    }
    return null;
  };

  // Top-level string payload
  if (typeof record === 'string') {
    const parsed = tryParseJSON(record) ?? extractJsonFromString(record);
    if (parsed) record = parsed; else return { data: {}, invalid: true };
  }

  // Array payload (take first non-empty)
  if (Array.isArray(record)) {
    record = record.find(Boolean) ?? record[0];
  }

  // Prefer `content`, else OpenAI-style `message.content`, else the record itself
  let content: any = record?.content ?? record?.message?.content ?? record;

  // If content is an array (e.g. [{type:'text', text:'{...}'}])
  if (Array.isArray(content)) {
    const firstItem = content.find(Boolean);
    if (typeof firstItem === 'string') {
      content = tryParseJSON(firstItem) ?? extractJsonFromString(firstItem) ?? {};
    } else if (firstItem && typeof firstItem === 'object') {
      const text = (firstItem as any).text ?? (firstItem as any).content;
      if (typeof text === 'string') {
        content = tryParseJSON(text) ?? extractJsonFromString(text) ?? {};
      } else {
        content = firstItem;
      }
    } else {
      content = {};
    }
  } else if (typeof content === 'string') {
    content = tryParseJSON(content) ?? extractJsonFromString(content) ?? {};
  } else if (!content || typeof content !== 'object') {
    content = {};
  }

  const normalized: EVEstimationData = {
    domain: content?.domain,
    company: content?.company,
    country: content?.country,
    industry: content?.industry,
    input_summary: content?.input_summary || content?.inputs_summary || {},
    final_rationale: Array.isArray(content?.final_rationale) ? content.final_rationale : [],
    final_ev_estimate_usd:
      content?.final_ev_estimate_usd ||
      content?.final_ev_estimate ||
      content?.ev_estimate_usd ||
      content?.ev_estimate ||
      {},
    arr_multiple_cross_check:
      content?.arr_multiple_cross_check ||
      content?.arr_multiple_check ||
      {},
    confidence_and_key_risks:
      content?.confidence_and_key_risks ||
      content?.confidence ||
      {},
    funding_round_valuation_logic:
      content?.funding_round_valuation_logic ||
      content?.funding_round_logic ||
      {},
    important_data_issues_and_assumptions:
      Array.isArray(content?.important_data_issues_and_assumptions)
        ? content.important_data_issues_and_assumptions
        : Array.isArray(content?.data_issues)
        ? content.data_issues
        : [],
  };

  return { data: normalized, invalid };
}

// Format currency
export const fmtCurrency = (val?: number | null, currency: string = 'USD') => {
  if (val == null || isNaN(Number(val))) return '—';
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(val));
  return formatted;
};

// Format percentage
export const fmtConfidence = (val?: number | null) => {
  if (val == null || isNaN(Number(val))) return '—';
  return `${(Number(val) * 100).toFixed(0)}%`;
};
