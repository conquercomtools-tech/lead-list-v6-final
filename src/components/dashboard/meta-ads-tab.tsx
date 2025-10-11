import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Eye, Video, Image as ImageIcon, FileText, MapPin, Users, Calendar } from "lucide-react";
import { MetaAdsNormalized } from "@/lib/normalize-meta-ads";
import { StatCard, StatsRow } from "@/components/ui/stat-card";
import { ResponsiveBar } from "@/components/charts/ResponsiveBar";

interface MetaAdsTabProps {
  data: MetaAdsNormalized;
}

function formatDate(isoDate?: string | null): string {
  if (!isoDate) return "—";
  try {
    return new Date(isoDate).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch {
    return isoDate;
  }
}

function TruncatedText({ text, maxLines = 6 }: { text: string; maxLines?: number }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const lines = text.split('\n');
  const shouldTruncate = lines.length > maxLines;

  return (
    <div className="space-y-1">
      <p className={`text-sm text-white/70 whitespace-pre-wrap ${!isExpanded && shouldTruncate ? `line-clamp-${maxLines}` : ''}`}>
        {text}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-primary hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}

function MediaPreview({ creative }: { creative: any }) {
  const videoPreview = creative.media?.videoPreview;
  const images = creative.media?.images || [];
  const displayFormat = creative.displayFormat;

  if (videoPreview) {
    return (
      <div className="relative rounded-xl overflow-hidden w-full aspect-video bg-white/5">
        <img 
          src={videoPreview} 
          alt={creative.title || creative.pageName || "Ad preview"}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm">
          <Video className="h-4 w-4 text-white" />
        </div>
      </div>
    );
  }

  if (images.length > 0) {
    return (
      <div className="relative rounded-xl overflow-hidden w-full aspect-video bg-white/5">
        <img 
          src={images[0]} 
          alt={creative.title || creative.pageName || "Ad preview"}
          className="w-full h-full object-cover"
        />
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-white">
            +{images.length - 1} more
          </div>
        )}
      </div>
    );
  }

  // Fallback based on format
  const Icon = displayFormat === 'VIDEO' ? Video : displayFormat === 'IMAGE' ? ImageIcon : FileText;
  return (
    <div className="rounded-xl h-40 bg-white/5 flex flex-col items-center justify-center gap-2">
      <Icon className="h-10 w-10 text-white/30" />
      <span className="text-xs text-white/50">{displayFormat || 'No preview'}</span>
    </div>
  );
}

export function MetaAdsTab({ data }: MetaAdsTabProps) {
  if (!data.hasData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <Eye className="h-12 w-12 text-white/20" />
        <p className="text-white/60">No Meta Ads creatives found for this advertiser.</p>
        <p className="text-xs text-white/40">This company may not be running ads on Meta platforms.</p>
      </div>
    );
  }

  // Prepare chart data
  const platformChartData = data.platforms
    .filter(p => (p.impressions ?? 0) > 0)
    .map(p => ({ name: p.name, value: p.impressions ?? 0 }));

  const regionChartData = data.regions
    .filter(r => (r.impressions ?? 0) > 0)
    .map(r => ({ name: r.name, value: r.impressions ?? 0 }));

  return (
    <div className="space-y-6">
      {/* KPI Strip */}
      <StatsRow>
        <StatCard 
          label="Creatives" 
          value={data.kpis.creatives} 
          tooltip="Total number of ad creatives found"
        />
        <StatCard 
          label="Platforms" 
          value={data.kpis.platforms} 
          tooltip="Number of platforms where ads are running"
        />
        <StatCard 
          label="Regions" 
          value={data.kpis.regions} 
          tooltip="Number of targeted or reached regions"
        />
        <StatCard 
          label="Active" 
          value={data.kpis.activeCreatives} 
          tooltip="Currently active ad creatives"
          className="border-emerald-500/20 bg-emerald-500/5"
        />
      </StatsRow>

      {/* Charts */}
      {(platformChartData.length > 0 || regionChartData.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Platform Chart */}
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-4">
              {platformChartData.length > 0 ? (
                <>
                  <ResponsiveBar
                    title="Impressions by Platform"
                    data={platformChartData}
                    x="name"
                    y="value"
                  />
                  <p className="text-xs text-white/50 mt-2">Midpoint estimates where ranges are provided.</p>
                </>
              ) : (
                <div className="h-[260px] flex items-center justify-center">
                  <p className="text-white/50 text-sm">Not enough data yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Region Chart */}
          <Card className="rounded-2xl border-white/10 bg-white/5 backdrop-blur">
            <CardContent className="p-4">
              {regionChartData.length > 0 ? (
                <>
                  <ResponsiveBar
                    title="Impressions by Region"
                    data={regionChartData}
                    x="name"
                    y="value"
                  />
                  <p className="text-xs text-white/50 mt-2">Midpoint estimates where ranges are provided.</p>
                </>
              ) : (
                <div className="h-[260px] flex items-center justify-center">
                  <p className="text-white/50 text-sm">Not enough data yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Creatives Gallery */}
      <div>
        <h3 className="text-lg font-semibold text-white/90 mb-4 flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Ad Creatives
          <Badge variant="secondary" className="ml-2">{data.creatives.length}</Badge>
        </h3>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.creatives.map((creative) => (
            <Card key={creative.id} className="rounded-2xl border-white/10 bg-white/5 backdrop-blur overflow-hidden">
              <CardContent className="p-4 space-y-3">
                {/* Media Preview */}
                <MediaPreview creative={creative} />

                {/* Page Info */}
                {(creative.pageProfilePictureUrl || creative.pageName) && (
                  <div className="flex items-center gap-2">
                    {creative.pageProfilePictureUrl && (
                      <img 
                        src={creative.pageProfilePictureUrl} 
                        alt={creative.pageName || "Page"}
                        className="w-8 h-8 rounded-full object-cover border border-white/10"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white/80 truncate">
                        {creative.pageName || "Sponsored"}
                      </div>
                    </div>
                  </div>
                )}

                {/* Title & Body */}
                {creative.title && (
                  <div className="text-sm font-medium text-white/90">{creative.title}</div>
                )}
                {creative.body && <TruncatedText text={creative.body} maxLines={6} />}

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {creative.isActive ? (
                    <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-white/20 text-white/60">
                      Inactive
                    </Badge>
                  )}
                  {creative.displayFormat && (
                    <Badge variant="outline" className="border-white/20 text-white/70">
                      {creative.displayFormat}
                    </Badge>
                  )}
                  {creative.entityType && (
                    <Badge variant="outline" className="border-white/20 text-white/70 text-xs">
                      {creative.entityType}
                    </Badge>
                  )}
                </div>

                {/* Dates & Platforms */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="space-y-1">
                    <div className="text-white/50 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Start
                    </div>
                    <div className="text-white/80">{formatDate(creative.startDate)}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-white/50 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      End
                    </div>
                    <div className="text-white/80">{formatDate(creative.endDate)}</div>
                  </div>
                  {creative.publisherPlatforms && creative.publisherPlatforms.length > 0 && (
                    <div className="col-span-2 space-y-1">
                      <div className="text-white/50">Platforms</div>
                      <div className="flex flex-wrap gap-1">
                        {creative.publisherPlatforms.map((platform, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {platform}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Targeting Info */}
                {creative.targeting && (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-2 text-xs">
                    <div className="text-white/50 font-medium flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Targeting
                    </div>
                    {(creative.targeting.ageMin || creative.targeting.ageMax) && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Age:</span>
                        <span className="text-white/80">
                          {creative.targeting.ageMin ?? "—"} – {creative.targeting.ageMax ?? "—"}
                        </span>
                      </div>
                    )}
                    {creative.targeting.gender && (
                      <div className="flex justify-between">
                        <span className="text-white/60">Gender:</span>
                        <span className="text-white/80">{creative.targeting.gender}</span>
                      </div>
                    )}
                    {((creative.targeting.countries?.length ?? 0) > 0 || (creative.targeting.locations?.length ?? 0) > 0) && (
                      <div>
                        <div className="text-white/60 mb-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Regions:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[...(creative.targeting.countries || []), ...(creative.targeting.locations || [])]
                            .slice(0, 6)
                            .map((loc, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {loc}
                              </Badge>
                            ))}
                          {((creative.targeting.countries?.length ?? 0) + (creative.targeting.locations?.length ?? 0) > 6) && (
                            <Badge variant="secondary" className="text-xs">
                              +{((creative.targeting.countries?.length ?? 0) + (creative.targeting.locations?.length ?? 0)) - 6} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Categories */}
                {creative.categories && creative.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {creative.categories.map((cat, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-white/20 text-white/60">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-1">
                  {creative.ctaUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 glass border-white/20 hover:bg-white/10 text-xs"
                      onClick={() => window.open(creative.ctaUrl!, '_blank')}
                    >
                      {creative.ctaText || "Open"}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                  {creative.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 glass border-white/20 hover:bg-white/10 text-xs"
                      onClick={() => window.open(creative.url!, '_blank')}
                    >
                      Ad Library
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Notes */}
      {data.notes.length > 0 && (
        <ul className="space-y-1 text-xs text-white/50 list-disc pl-4">
          {data.notes.map((note, i) => (
            <li key={i}>{note}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
