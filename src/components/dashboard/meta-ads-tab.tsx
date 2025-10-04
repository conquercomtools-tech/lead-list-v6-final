import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface MetaAd {
  ad_creative_link_title?: string;
  ad_creative_link_description?: string;
  ad_snapshot_url?: string;
  page_name?: string;
  ad_delivery_start_time?: string;
  [key: string]: any;
}

interface MetaAdsTabProps {
  data: MetaAd[];
}

export function MetaAdsTab({ data }: MetaAdsTabProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No Meta Ads data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Meta Ads ({data.length})</h3>
      </div>

      <div className="grid gap-4">
        {data.map((ad, index) => (
          <Card key={index}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-base">
                    {ad.ad_creative_link_title || `Ad #${index + 1}`}
                  </CardTitle>
                  {ad.page_name && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {ad.page_name}
                    </p>
                  )}
                </div>
                {ad.ad_snapshot_url && (
                  <a
                    href={ad.ad_snapshot_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {ad.ad_creative_link_description && (
                <p className="text-sm text-muted-foreground">
                  {ad.ad_creative_link_description}
                </p>
              )}
              
              <div className="flex flex-wrap gap-2">
                {ad.ad_delivery_start_time && (
                  <Badge variant="outline">
                    Started: {new Date(ad.ad_delivery_start_time).toLocaleDateString()}
                  </Badge>
                )}
              </div>

              {Object.entries(ad).map(([key, value]) => {
                if (
                  !value ||
                  key === 'ad_creative_link_title' ||
                  key === 'ad_creative_link_description' ||
                  key === 'ad_snapshot_url' ||
                  key === 'page_name' ||
                  key === 'ad_delivery_start_time'
                ) {
                  return null;
                }
                
                return (
                  <div key={key} className="text-xs">
                    <span className="font-medium">{key.replace(/_/g, ' ')}: </span>
                    <span className="text-muted-foreground">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
