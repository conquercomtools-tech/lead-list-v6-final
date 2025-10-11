import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { ExternalLink, TrendingUp, Users, MapPin, Calendar, Eye } from "lucide-react";

interface MetaAd {
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

interface MetaAdsTabProps {
  data: MetaAd[];
}

function formatDate(timestamp: string | null | undefined): string {
  if (!timestamp) return 'N/A';
  const ts = Number(timestamp);
  if (isNaN(ts)) return 'N/A';
  return new Date(ts * 1000).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

function TargetingInfo({ targeting }: { targeting: any }) {
  if (!targeting) return null;

  return (
    <div className="space-y-3 rounded-lg border border-border/50 p-4 bg-muted/30">
      <Label className="text-sm font-semibold flex items-center gap-2">
        <Users className="h-4 w-4" />
        Targeting Information
      </Label>
      
      <div className="grid gap-2 text-sm">
        {targeting.age_audience && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Age Range:</span>
            <span className="font-medium">
              {targeting.age_audience.min || '?'} - {targeting.age_audience.max || '?'}
            </span>
          </div>
        )}
        
        {targeting.gender_audience && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Gender:</span>
            <span className="font-medium capitalize">
              {targeting.gender_audience.All ? 'All' : 
               targeting.gender_audience.male ? 'Male' : 
               targeting.gender_audience.female ? 'Female' : 'N/A'}
            </span>
          </div>
        )}
        
        {targeting.geo_locations && (
          <div>
            <span className="text-muted-foreground">Locations:</span>
            <div className="mt-1 flex flex-wrap gap-1">
              {Object.keys(targeting.geo_locations).map((loc) => (
                <Badge key={loc} variant="secondary" className="text-xs">
                  {loc}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function MetaAdsTab({ data }: MetaAdsTabProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Eye className="h-12 w-12 text-muted-foreground/50 mb-3" />
        <p className="text-muted-foreground">No Meta Ads data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Meta Ads
          <Badge variant="secondary" className="ml-2">{data.length}</Badge>
        </h3>
      </div>

      <div className="grid gap-6">
        {data.map((ad, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="border-b bg-muted/30">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-2">
                  <CardTitle className="text-lg leading-tight">
                    {ad.title || `Meta Ad #${index + 1}`}
                  </CardTitle>
                  {ad.description && ad.description !== ad.title && (
                    <p className="text-sm text-muted-foreground">
                      {ad.description}
                    </p>
                  )}
                  {ad.advertiser?.name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="font-normal">
                        {ad.advertiser.name}
                      </Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {ad.is_active && (
                    <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30">
                      Active
                    </Badge>
                  )}
                  {ad.ad_library_url && (
                    <a
                      href={ad.ad_library_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                      title="View in Ad Library"
                    >
                      <ExternalLink className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 pt-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {ad.start_date && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Start Date
                    </Label>
                    <p className="text-sm font-medium">{formatDate(ad.start_date)}</p>
                  </div>
                )}
                
                {ad.end_date && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      End Date
                    </Label>
                    <p className="text-sm font-medium">{formatDate(ad.end_date)}</p>
                  </div>
                )}
                
                {ad.impressions && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      Impressions
                    </Label>
                    <p className="text-sm font-medium">{ad.impressions.toLocaleString()}</p>
                  </div>
                )}
                
                {ad.entity_type && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Entity Type</Label>
                    <p className="text-sm font-medium capitalize">{ad.entity_type.replace('_', ' ').toLowerCase()}</p>
                  </div>
                )}
              </div>

              {/* Targeting */}
              {ad.targeting && <TargetingInfo targeting={ad.targeting} />}
              
              {/* Categories */}
              {ad.categories && ad.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <Label className="text-xs text-muted-foreground">Categories:</Label>
                  {ad.categories.map((cat, i) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
