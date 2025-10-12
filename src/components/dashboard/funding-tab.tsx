import { normalizeFunding } from "@/lib/normalize-funding";
import { StatCard, StatsRow } from "@/components/ui/stat-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ResponsiveBar } from "@/components/charts/ResponsiveBar";
import { ResponsiveLines } from "@/components/charts/ResponsiveLines";
import { Building2, TrendingUp, DollarSign, Calendar } from "lucide-react";

interface FundingTabProps {
  fundingData: unknown;
}

function formatCurrency(amount: number | null | undefined): string {
  if (!amount || amount === 0) return "—";
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1)}K`;
  return `$${amount.toFixed(0)}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export function FundingTab({ fundingData }: FundingTabProps) {
  const normalized = normalizeFunding(fundingData);

  if (!normalized.hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <Building2 className="w-12 h-12 text-white/20 mb-4" />
        <h3 className="text-lg font-semibold text-white/80 mb-2">No Funding Data Available</h3>
        <p className="text-sm text-white/60 max-w-md">
          No funding rounds or acquisition events have been recorded for this company yet.
        </p>
      </div>
    );
  }

  const { kpis, rounds, byType, timeline, acquisitions, topInvestors, notes } = normalized;

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <StatsRow>
        <StatCard
          label="Total Funding"
          value={formatCurrency(kpis.totalFunding)}
          tooltip="Total capital raised across all funding rounds"
        />
        <StatCard
          label="Funding Rounds"
          value={kpis.totalRounds}
          tooltip="Number of funding rounds completed"
        />
        {kpis.latestRound && (
          <StatCard
            label="Latest Round"
            value={kpis.latestRound}
            tooltip="Most recent funding round type"
          />
        )}
        {kpis.latestAmount && (
          <StatCard
            label="Latest Amount"
            value={formatCurrency(kpis.latestAmount)}
            tooltip="Amount raised in most recent round"
          />
        )}
        {kpis.lastValuation && (
          <StatCard
            label="Last Valuation"
            value={formatCurrency(kpis.lastValuation)}
            tooltip="Most recent company valuation"
          />
        )}
      </StatsRow>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Funding by Type */}
        {byType.length > 0 && byType.some(t => t.amount > 0) && (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
            <h3 className="text-sm font-semibold text-white/90 mb-3">Funding by Round Type</h3>
            <ResponsiveBar
              data={byType.map(t => ({
                name: t.type,
                amount: t.amount,
              }))}
              x="name"
              y="amount"
            />
            <p className="text-xs text-white/60 mt-2">Distribution of capital raised across funding stages.</p>
          </div>
        )}

        {/* Timeline */}
        {timeline.length >= 3 && (
          <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
            <h3 className="text-sm font-semibold text-white/90 mb-3">Cumulative Funding Over Time</h3>
            <div className="h-[200px]">
              <ResponsiveLines
                data={timeline.map(t => ({
                  date: formatDate(t.date),
                  funding: t.cumulativeTotal,
                }))}
                lines={[
                  { dataKey: "funding", name: "Total Funding", color: "hsl(var(--primary))" }
                ]}
              />
            </div>
            <p className="text-xs text-white/60 mt-2">
              Cumulative capital raised over {timeline.length} funding events.
            </p>
          </div>
        )}
      </div>

      {/* Top Investors */}
      {topInvestors.length > 0 && (
        <Card className="bg-white/5 border-white/10 rounded-2xl">
          <CardContent className="p-4">
            <h3 className="text-sm font-semibold text-white/90 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Top Investors
            </h3>
            <div className="space-y-2">
              {topInvestors.map((inv, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <span className="text-white/80">{inv.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {inv.count} round{inv.count > 1 ? "s" : ""}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Funding Rounds */}
      {rounds.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Funding Rounds
          </h3>
          <div className="space-y-3">
            {rounds.map((round) => (
              <Card key={round.id} className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {round.roundType && (
                          <Badge variant="outline" className="font-semibold">
                            {round.roundType}
                          </Badge>
                        )}
                        <span className="text-lg font-bold text-white">
                          {round.amountFormatted}
                        </span>
                        {round.date && (
                          <span className="text-xs text-white/60 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(round.date)}
                          </span>
                        )}
                      </div>

                      {round.valuation && (
                        <div className="text-sm text-white/70">
                          Valuation: <span className="font-semibold">{round.valuationFormatted}</span>
                        </div>
                      )}

                      {round.investors.length > 0 && (
                        <div className="space-y-1">
                          <div className="text-xs text-white/50">Investors</div>
                          <div className="flex flex-wrap gap-1.5">
                            {round.investors.slice(0, 5).map((inv, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {inv}
                              </Badge>
                            ))}
                            {round.investors.length > 5 && (
                              <Badge variant="secondary" className="text-xs">
                                +{round.investors.length - 5} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Acquisitions */}
      {acquisitions.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-white/90 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Acquisition Events
          </h3>
          <div className="space-y-3">
            {acquisitions.map((acq) => (
              <Card key={acq.id} className="bg-white/5 border-white/10 rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {acq.type && (
                        <Badge variant="outline" className="capitalize">
                          {acq.type.replace(/_/g, " ")}
                        </Badge>
                      )}
                      {acq.amount && (
                        <span className="text-lg font-bold text-white">
                          {acq.amountFormatted}
                        </span>
                      )}
                      {acq.date && (
                        <span className="text-xs text-white/60 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(acq.date)}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-white/70 space-y-1">
                      {acq.acquirer && (
                        <div>
                          <span className="text-white/50">Acquirer:</span>{" "}
                          <span className="font-semibold">{acq.acquirer}</span>
                        </div>
                      )}
                      {acq.acquired && (
                        <div>
                          <span className="text-white/50">Acquired:</span>{" "}
                          <span className="font-semibold">{acq.acquired}</span>
                        </div>
                      )}
                      {acq.status && (
                        <Badge variant="secondary" className="text-xs capitalize">
                          {acq.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {notes.length > 0 && (
        <ul className="text-xs text-white/50 list-disc pl-4 space-y-1">
          {notes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
