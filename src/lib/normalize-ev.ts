// EV Estimation normalization and utilities
import { safeJsonWithFlag } from "./normalize-analytics";

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
  // Handle different input formats
  let record = src;
  let hasError = false;
  
  // If it's a string, try to parse it
  if (typeof src === 'string') {
    try {
      record = JSON.parse(src);
    } catch {
      return { data: {}, invalid: true };
    }
  }
  
  // Handle array format (database stores array of records, take the first/latest one)
  if (Array.isArray(record)) {
    record = record[0];
  }
  
  // Handle nested message structure from OpenAI-style response
  const content = record?.message?.content || record;
  
  const normalized: EVEstimationData = {
    domain: content?.domain,
    company: content?.company,
    country: content?.country,
    industry: content?.industry,
    input_summary: content?.input_summary || {},
    final_rationale: Array.isArray(content?.final_rationale) ? content.final_rationale : [],
    final_ev_estimate_usd: content?.final_ev_estimate_usd || {},
    arr_multiple_cross_check: content?.arr_multiple_cross_check || {},
    confidence_and_key_risks: content?.confidence_and_key_risks || {},
    funding_round_valuation_logic: content?.funding_round_valuation_logic || {},
    important_data_issues_and_assumptions: Array.isArray(content?.important_data_issues_and_assumptions) 
      ? content.important_data_issues_and_assumptions 
      : [],
  };

  return { data: normalized, invalid: hasError };
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
