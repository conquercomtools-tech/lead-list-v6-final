import React from "react";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Building, DollarSign, TrendingUp, AlertTriangle, Lightbulb, BarChart3 } from "lucide-react";
import { normalizeEVEstimation, fmtCurrency, fmtConfidence } from "@/lib/normalize-ev";
import { StatCard, StatsRow } from "@/components/ui/stat-card";

function SectionCard({ title, children, right }: { 
  title: string; 
  children: React.ReactNode; 
  right?: React.ReactNode;
}) {
  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Building className="h-5 w-5" />
          {title}
        </h3>
        {right}
      </div>
      {children}
    </GlassCard>
  );
}

interface EVEstimatorTabProps {
  data: ReturnType<typeof normalizeEVEstimation>;
}

export function EVEstimatorTab({ data }: EVEstimatorTabProps) {
  const { data: ev, invalid } = data;

  if (!ev.final_ev_estimate_usd || Object.keys(ev.final_ev_estimate_usd).length === 0) {
    return (
      <SectionCard title="EV Estimator">
        <div className="text-center py-8 text-white/70">
          No EV estimation data available.
        </div>
      </SectionCard>
    );
  }

  const evEstimate = ev.final_ev_estimate_usd;
  const inputSummary = ev.input_summary || {};
  const confidence = ev.confidence_and_key_risks || {};
  const fundingLogic = ev.funding_round_valuation_logic || {};
  const arrCheck = ev.arr_multiple_cross_check || {};

  // Get confidence color
  const getConfidenceColor = (score?: number) => {
    if (!score) return "text-white/60";
    if (score >= 0.7) return "text-green-400";
    if (score >= 0.4) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Company Overview */}
      <SectionCard 
        title="Company Overview" 
        right={invalid ? <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Invalid JSON</Badge> : null}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ev.company && (
            <div>
              <div className="text-sm text-white/60 mb-1">Company</div>
              <div className="text-white font-medium">{ev.company}</div>
            </div>
          )}
          {ev.industry && (
            <div>
              <div className="text-sm text-white/60 mb-1">Industry</div>
              <div className="text-white">{ev.industry}</div>
            </div>
          )}
          {ev.domain && (
            <div>
              <div className="text-sm text-white/60 mb-1">Domain</div>
              <a href={ev.domain} target="_blank" rel="noopener" className="text-primary hover:underline">
                {ev.domain}
              </a>
            </div>
          )}
          {ev.country && (
            <div>
              <div className="text-sm text-white/60 mb-1">Country</div>
              <div className="text-white">{ev.country}</div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* EV Estimate - Main KPIs */}
      <SectionCard title="Enterprise Value Estimate">
        <StatsRow>
          <StatCard 
            label="Low Estimate" 
            value={fmtCurrency(evEstimate.low, evEstimate.currency)} 
          />
          <StatCard 
            label="Base Estimate" 
            value={fmtCurrency(evEstimate.base, evEstimate.currency)} 
          />
          <StatCard 
            label="High Estimate" 
            value={fmtCurrency(evEstimate.high, evEstimate.currency)} 
          />
          {confidence.confidence_score != null && (
            <StatCard 
              label="Confidence" 
              value={fmtConfidence(confidence.confidence_score)}
            />
          )}
        </StatsRow>
      </SectionCard>

      {/* Input Summary */}
      {Object.keys(inputSummary).length > 0 && (
        <SectionCard title="Input Summary">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {inputSummary.employees && (
              <div>
                <div className="text-sm text-white/60 mb-1">Employees</div>
                <div className="text-white">{inputSummary.employees}</div>
              </div>
            )}
            {inputSummary.employees_range && (
              <div>
                <div className="text-sm text-white/60 mb-1">Employee Range</div>
                <div className="text-white">{inputSummary.employees_range}</div>
              </div>
            )}
            {inputSummary.stage_normalized && (
              <div>
                <div className="text-sm text-white/60 mb-1">Stage</div>
                <Badge variant="outline" className="glass">{inputSummary.stage_normalized}</Badge>
              </div>
            )}
            {inputSummary.total_funding_usd != null && (
              <div>
                <div className="text-sm text-white/60 mb-1">Total Funding</div>
                <div className="text-white">{fmtCurrency(inputSummary.total_funding_usd)}</div>
              </div>
            )}
            {inputSummary.latest_round_amount_usd != null && (
              <div>
                <div className="text-sm text-white/60 mb-1">Latest Round Amount</div>
                <div className="text-white">{fmtCurrency(inputSummary.latest_round_amount_usd)}</div>
              </div>
            )}
            {inputSummary.latest_round_label && (
              <div>
                <div className="text-sm text-white/60 mb-1">Latest Round</div>
                <div className="text-white">{inputSummary.latest_round_label}</div>
              </div>
            )}
            {inputSummary.annual_revenue_usd != null && (
              <div>
                <div className="text-sm text-white/60 mb-1">Annual Revenue</div>
                <div className="text-white">{fmtCurrency(inputSummary.annual_revenue_usd)}</div>
              </div>
            )}
            {inputSummary.monthly_website_visits && (
              <div>
                <div className="text-sm text-white/60 mb-1">Monthly Website Visits</div>
                <div className="text-white">{inputSummary.monthly_website_visits.toLocaleString()}</div>
              </div>
            )}
            {inputSummary.website_authority_score && (
              <div>
                <div className="text-sm text-white/60 mb-1">Authority Score</div>
                <div className="text-white">{inputSummary.website_authority_score}</div>
              </div>
            )}
            {inputSummary.heat_current && (
              <div>
                <div className="text-sm text-white/60 mb-1">Heat Score</div>
                <div className="text-white">{inputSummary.heat_current}</div>
              </div>
            )}
            {inputSummary.growth_current && (
              <div>
                <div className="text-sm text-white/60 mb-1">Growth Score</div>
                <div className="text-white">{inputSummary.growth_current}</div>
              </div>
            )}
            {inputSummary.region && (
              <div className="md:col-span-2">
                <div className="text-sm text-white/60 mb-1">Region</div>
                <div className="text-white">{inputSummary.region}</div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Funding Round Valuation Logic */}
      {fundingLogic.last_round_amount_usd && (
        <SectionCard title="Funding Round Valuation">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-white/60 mb-1">Last Round Amount</div>
                <div className="text-white font-medium">{fmtCurrency(fundingLogic.last_round_amount_usd)}</div>
              </div>
              {fundingLogic.assumed_equity_pct_sold && fundingLogic.assumed_equity_pct_sold.length > 0 && (
                <div>
                  <div className="text-sm text-white/60 mb-1">Assumed Equity % Sold</div>
                  <div className="text-white">
                    {fundingLogic.assumed_equity_pct_sold.map(pct => `${(pct * 100).toFixed(0)}%`).join(', ')}
                  </div>
                </div>
              )}
            </div>
            
            {fundingLogic.implied_post_money_usd_for_each_assumption && 
             fundingLogic.implied_post_money_usd_for_each_assumption.length > 0 && (
              <div>
                <div className="text-sm text-white/60 mb-2">Implied Post-Money Valuations</div>
                <div className="flex flex-wrap gap-2">
                  {fundingLogic.implied_post_money_usd_for_each_assumption.map((val, i) => (
                    <Badge key={i} variant="outline" className="glass">
                      {fmtCurrency(val)}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {fundingLogic.interpretation && (
              <div>
                <div className="text-sm text-white/60 mb-1">Interpretation</div>
                <div className="text-white/80 text-sm">{fundingLogic.interpretation}</div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* ARR Multiple Cross Check */}
      {arrCheck.ARR_assumptions_usd && (
        <SectionCard title="ARR & Multiple Analysis">
          <div className="space-y-4">
            <div>
              <div className="text-sm text-white/60 mb-2">ARR Assumptions</div>
              <StatsRow>
                <StatCard 
                  label="Low ARR" 
                  value={fmtCurrency(arrCheck.ARR_assumptions_usd.low)} 
                />
                <StatCard 
                  label="Base ARR" 
                  value={fmtCurrency(arrCheck.ARR_assumptions_usd.base)} 
                />
                <StatCard 
                  label="High ARR" 
                  value={fmtCurrency(arrCheck.ARR_assumptions_usd.high)} 
                />
              </StatsRow>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Rationale */}
      {ev.final_rationale && ev.final_rationale.length > 0 && (
        <SectionCard title="Valuation Rationale">
          <div className="space-y-3">
            {ev.final_rationale.map((point, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <div className="text-white/80 text-sm">{point}</div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Confidence & Risks */}
      {confidence.confidence_score != null && (
        <SectionCard title="Confidence & Key Risks">
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm text-white/60 mb-1">Confidence Score</div>
                <div className={`text-2xl font-bold ${getConfidenceColor(confidence.confidence_score)}`}>
                  {fmtConfidence(confidence.confidence_score)}
                </div>
              </div>
              {confidence.explanation && (
                <div className="flex-1">
                  <div className="text-sm text-white/60 mb-1">Explanation</div>
                  <div className="text-white/80 text-sm">{confidence.explanation}</div>
                </div>
              )}
            </div>

            {confidence.key_risks && confidence.key_risks.length > 0 && (
              <div>
                <div className="text-sm text-white/60 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Key Risks
                </div>
                <div className="space-y-2">
                  {confidence.key_risks.map((risk, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                      <span className="text-red-400 mt-0.5">•</span>
                      <span className="text-white/80 text-sm">{risk}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Data Issues & Assumptions */}
      {ev.important_data_issues_and_assumptions && ev.important_data_issues_and_assumptions.length > 0 && (
        <SectionCard title="Data Issues & Assumptions">
          <div className="space-y-2">
            {ev.important_data_issues_and_assumptions.map((issue, i) => (
              <div key={i} className="flex items-start gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <BarChart3 className="h-4 w-4 text-white/60 mt-0.5 shrink-0" />
                <span className="text-white/70 text-sm">{issue}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
