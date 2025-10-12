import React, { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge } from "@/components/ui/status-badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, ExternalLink, Phone, Mail, MapPin, ChevronDown, Calendar, TrendingUp, Users, DollarSign, Building, ChevronLeft, ChevronRight, Globe, Rocket, LineChart, Wallet, Building2, FlaskConical, Target, Zap } from "lucide-react";
import { toast } from "sonner";
import { Lead, formatCurrency, formatNumber, getCountryFlag } from "@/lib/supabase";
import { 
  normalizeLinkedInPosts, 
  normalizeLinkedInPostsFromMessages,
  normalizeBasicInfo, 
  normalizeCompanyData, 
  normalizeCompanyPosts,
  normalizeCompanyDataFromMessages,
  aggregateCompanySnapshot,
  normalizeYouTubeSummary,
  normalizeCompetitors,
  parseEventsText,
  normalizeImportantUrls,
  money,
  fmtDate
} from "@/lib/normalize";
import { 
  normalizeWebAnalytics, 
  fmtNum,
  fmtPct,
  fmtDur
} from "@/lib/normalize-analytics";
import { 
  normalizeCrunchbase,
  crunchbaseAggregates,
  prettyEmployeesRange,
  fmtDate as crunchbaseFmtDate
} from "@/lib/normalize-crunchbase";
import { 
  normalizeGoogleAds, 
  aggregateGoogleAds, 
  prettyRelative,
  mid
} from "@/lib/normalize-ads";
import { normalizeMetaAds } from "@/lib/normalize-meta-ads";
import {
  normalizeEVEstimation,
  fmtCurrency,
  fmtConfidence
} from "@/lib/normalize-ev";
import { EVEstimatorTab } from "@/components/dashboard/ev-estimator-tab";
import { MetaAdsTab } from "@/components/dashboard/meta-ads-tab";
import { FundingTab } from "@/components/dashboard/funding-tab";
import { ResponsiveLines } from "@/components/charts/ResponsiveLines";
import { ResponsiveBar } from "@/components/charts/ResponsiveBar";
import { ResponsiveDonut } from "@/components/charts/ResponsiveDonut";
import { StatCard, StatsRow } from "@/components/ui/stat-card";

interface LeadDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDrawer({ lead, open, onClose }: LeadDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const tabScrollRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    const el = tabRefs.current[activeTab];
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [activeTab]);

  if (!lead) return null;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  // Prepare data for display
  const fullName = [lead?.['First Name'], lead?.['Last Name']].filter(Boolean).join(' ') || 'Unknown';
  
  // Normalize JSONB fields
  const linkedinPosts = normalizeLinkedInPostsFromMessages(lead?.linkedin_posts);
  const basicInfo = normalizeBasicInfo(lead?.basic_info);
  const companyData = normalizeCompanyData(lead?.company_data);
  const companyPosts = normalizeCompanyPosts(lead?.company_linkedin_post);
  const companyItems = normalizeCompanyDataFromMessages(lead?.company_data);
  const youtubeData = normalizeYouTubeSummary(lead?.youtube_video || null);
  const competitorsData = normalizeCompetitors(lead?.competitors);
  const eventsData = parseEventsText(lead?.events);
  const importantUrls = normalizeImportantUrls(lead?.important_urls);
  
  // Analytics data
  const similarwebData = normalizeWebAnalytics(lead?.['website_analytic(similarweb)']);
  const semrushData = normalizeWebAnalytics(lead?.['website_analytic(semrush)']);
  const crunchbaseData = normalizeCrunchbase(lead?.CRUNCHBASE);
  const googleAdsData = normalizeGoogleAds(lead?.google_ads ?? lead?.googel_ads);
  const evEstimationData = normalizeEVEstimation(lead?.Ev_Estimation);
  const metaAdsData = normalizeMetaAds(lead?.meta_ads);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl glass-card border-border/30 overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-border/20">
          <div className="flex items-start gap-4">
            {basicInfo.profile_picture_url ? (
              <img 
                src={basicInfo.profile_picture_url} 
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover border border-white/10 shadow-lg"
              />
            ) : (
              <AvatarInitials 
                initials={(lead?.['First Name']?.[0] || '') + (lead?.['Last Name']?.[0] || '') || lead?.Company?.[0] || '?'}
                size="lg"
                className="w-20 h-20"
              />
            )}
            <div className="flex-1">
              <SheetTitle className="text-2xl gradient-text">{fullName}</SheetTitle>
              <p className="text-lg text-muted-foreground">{lead?.Title || 'No title'}</p>
              <p className="text-lg font-medium">{lead?.Company || 'No company'}</p>
              <div className="flex gap-2 mt-2">
                {lead?.['Email Status'] && <StatusBadge status={lead['Email Status']} />}
                {lead?.Industry && <Badge variant="outline" className="glass">{lead.Industry}</Badge>}
              </div>
            </div>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <div className="relative">
            {/* Edge fades */}
            <div className="pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-black/60 to-transparent rounded-l-xl z-10" />
            <div className="pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-black/60 to-transparent rounded-r-xl z-10" />
            
            {/* Scroll buttons */}
            <button
              aria-label="Scroll tabs left"
              onClick={() => tabScrollRef.current?.scrollBy({ left: -160, behavior: "smooth" })}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15 tap-lg"
              type="button"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Scroll tabs right"
              onClick={() => tabScrollRef.current?.scrollBy({ left: 160, behavior: "smooth" })}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-1 rounded-lg bg-white/10 border border-white/15 hover:bg-white/15 tap-lg"
              type="button"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <TabsList
              ref={tabScrollRef}
              className="w-full overflow-x-auto overflow-y-hidden whitespace-nowrap no-scrollbar rounded-xl bg-white/5 border border-white/10 px-8 flex flex-nowrap gap-1 glass border-border/30"
            >
              <TabsTrigger 
                value="overview" 
                ref={(el) => (tabRefs.current["overview"] = el)}
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="linkedin" 
                ref={(el) => (tabRefs.current["linkedin"] = el)}
              >
                LinkedIn Activity
              </TabsTrigger>
              <TabsTrigger 
                value="company" 
                ref={(el) => (tabRefs.current["company"] = el)}
              >
                Company
              </TabsTrigger>
              <TabsTrigger 
                value="youtube" 
                ref={(el) => (tabRefs.current["youtube"] = el)}
              >
                YouTube Summary
              </TabsTrigger>
              <TabsTrigger 
                value="competitors" 
                ref={(el) => (tabRefs.current["competitors"] = el)}
              >
                Competitors
              </TabsTrigger>
              <TabsTrigger 
                value="search" 
                ref={(el) => (tabRefs.current["search"] = el)}
              >
                Search
              </TabsTrigger>
              <TabsTrigger 
                value="important-urls" 
                ref={(el) => (tabRefs.current["important-urls"] = el)}
              >
                Important URLs
              </TabsTrigger>
              <TabsTrigger 
                value="analytics_sw" 
                ref={(el) => (tabRefs.current["analytics_sw"] = el)}
              >
                <span className="hidden md:inline">Analytics (Similarweb)</span>
                <span className="md:hidden">Analytics (SW)</span>
              </TabsTrigger>
              <TabsTrigger 
                value="analytics_semrush" 
                ref={(el) => (tabRefs.current["analytics_semrush"] = el)}
              >
                <span className="hidden md:inline">Analytics (SEMrush)</span>
                <span className="md:hidden">Analytics (SE)</span>
              </TabsTrigger>
              <TabsTrigger 
                value="googleads" 
                ref={(el) => (tabRefs.current["googleads"] = el)}
              >
                Google Ads
              </TabsTrigger>
              <TabsTrigger 
                value="crunchbase" 
                ref={(el) => (tabRefs.current["crunchbase"] = el)}
              >
                Crunchbase
              </TabsTrigger>
              <TabsTrigger 
                value="ev_estimator" 
                ref={(el) => (tabRefs.current["ev_estimator"] = el)}
              >
                EV Estimator
              </TabsTrigger>
              <TabsTrigger 
                value="meta_ads" 
                ref={(el) => (tabRefs.current["meta_ads"] = el)}
              >
                Meta Ads
              </TabsTrigger>
              <TabsTrigger 
                value="funding" 
                ref={(el) => (tabRefs.current["funding"] = el)}
              >
                Funding
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Info Section */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Info
              </h3>
              {basicInfo.fullname || basicInfo.first_name || basicInfo.last_name ? (
                <div className="space-y-2">
                  <div>
                    <h4 className="text-xl font-bold">
                      {basicInfo.fullname || `${basicInfo.first_name} ${basicInfo.last_name}`.trim()}
                    </h4>
                    {basicInfo.headline && (
                      <p className="text-muted-foreground mt-1">{basicInfo.headline}</p>
                    )}
                  </div>
                  
                  {basicInfo.current_company && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-muted-foreground" />
                      {basicInfo.current_company_url ? (
                        <a 
                          href={basicInfo.current_company_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          {basicInfo.current_company}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <span>{basicInfo.current_company}</span>
                      )}
                    </div>
                  )}
                  
                  {(basicInfo.location_full || basicInfo.location_city || basicInfo.location_country) && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {basicInfo.location_full || basicInfo.location_city || basicInfo.location_country}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No basic info available.</p>
              )}
            </GlassCard>

            {/* Contact Information */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lead?.Email && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Primary Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${lead.Email}`} className="text-primary hover:underline">
                        {lead.Email}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(lead.Email!)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {lead?.['Secondary Email'] && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Secondary Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`mailto:${lead['Secondary Email']}`} className="text-primary hover:underline">
                        {lead['Secondary Email']}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(lead['Secondary Email']!)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {lead?.['Company Phone'] && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Company Phone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={`tel:${lead['Company Phone']}`} className="text-primary hover:underline">
                        {lead['Company Phone']}
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(lead['Company Phone']!)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {lead?.['Person Linkedin Url'] && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">LinkedIn Profile</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(lead['Person Linkedin Url'], '_blank')}
                      className="text-primary hover:underline"
                    >
                      View Profile
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                )}

                {(lead?.City || lead?.State || lead?.Country) && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Location</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {[lead?.City, lead?.State, lead?.Country].filter(Boolean).join(', ')}
                      </span>
                      {lead?.Country && (
                        <span className="text-lg">{getCountryFlag(lead.Country)}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCard className="p-4 text-center">
                <Users className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{formatNumber(lead?.['# Employees'])}</div>
                <div className="text-sm text-muted-foreground">Employees</div>
              </GlassCard>
              
              <GlassCard className="p-4 text-center">
                <TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{formatCurrency(lead?.['Annual Revenue'])}</div>
                <div className="text-sm text-muted-foreground">Annual Revenue</div>
              </GlassCard>
              
              <GlassCard className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{formatCurrency(lead?.['Total Funding'])}</div>
                <div className="text-sm text-muted-foreground">Total Funding</div>
              </GlassCard>
              
              <GlassCard className="p-4 text-center">
                <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                <div className="text-2xl font-bold">{formatCurrency(lead?.['Latest Funding Amount'])}</div>
                <div className="text-sm text-muted-foreground">Latest Funding</div>
              </GlassCard>
            </div>
          </TabsContent>

          <TabsContent value="linkedin" className="space-y-6">
            <LinkedInActivityTab posts={linkedinPosts} />
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            <NewCompanyTab companyItems={companyItems} />
          </TabsContent>

          <TabsContent value="youtube" className="space-y-6">
            <YouTubeSummaryTab youtubeData={youtubeData} />
          </TabsContent>

          <TabsContent value="competitors" className="space-y-6">
            <CompetitorsTab competitorsData={competitorsData} />
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <SearchTab eventsData={eventsData} />
          </TabsContent>

          <TabsContent value="important-urls" className="space-y-6">
            <ImportantUrlsTab importantUrls={importantUrls} />
          </TabsContent>

          <TabsContent value="analytics_sw" className="space-y-6">
            <AnalyticsTab data={similarwebData} title="Similarweb" />
          </TabsContent>

          <TabsContent value="analytics_semrush" className="space-y-6">
            <AnalyticsTab data={semrushData} title="SEMrush" />
          </TabsContent>

          <TabsContent value="googleads" className="space-y-6">
            <GoogleAdsTab data={googleAdsData} />
          </TabsContent>

          <TabsContent value="crunchbase" className="space-y-6">
            <CrunchbaseTab data={crunchbaseData} />
          </TabsContent>

          <TabsContent value="ev_estimator" className="space-y-6">
            <EVEstimatorTab data={evEstimationData} />
          </TabsContent>

          <TabsContent value="meta_ads" className="space-y-6">
            <MetaAdsTab data={metaAdsData} />
          </TabsContent>

          <TabsContent value="funding" className="space-y-6">
            <FundingTab fundingData={lead.funding_acquisition} />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// LinkedIn Activity Tab Component
function LinkedInActivityTab({ posts }: { posts: ReturnType<typeof normalizeLinkedInPostsFromMessages> }) {
  const [visibleCount, setVisibleCount] = useState(10);
  const showMore = () => setVisibleCount(prev => prev + 10);

  if (posts.length === 0) {
    return (
      <GlassCard className="p-12 text-center">
        <div className="text-muted-foreground">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
          <p className="text-sm">No LinkedIn posts found for this lead.</p>
        </div>
      </GlassCard>
    );
  }

  const visiblePosts = posts.slice(0, visibleCount);

  return (
    <div className="space-y-4">
      {visiblePosts.map((post, index) => {
        // Calculate total bullet count for accordion title
        const totalBullets = [
          post.summaries?.length || 0,
          post.pain_points?.length || 0,
          post.brag_metrics?.length || 0,
          post.voice_phrases?.length || 0,
          post.stated_priorities?.length || 0,
          post.events_conferences?.length || 0,
          Object.keys(post._extra || {}).length
        ].reduce((a, b) => a + b, 0);

        return (
          <GlassCard key={index} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                {post.post_type && (
                  <Badge variant="outline" className="glass">
                    {post.post_type}
                  </Badge>
                )}
                {post.date && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {fmtDate(post.date)}
                  </div>
                )}
              </div>
            </div>
            
            {post.name && (
              <p className="text-sm text-muted-foreground mb-4">{post.name}</p>
            )}
            
            {post.summaries && post.summaries.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2">Summaries</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  {post.summaries.map((summary, i) => (
                    <li key={i}>{summary}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <Collapsible>
              <CollapsibleTrigger className="flex items-center gap-2 text-sm font-medium hover:text-primary">
                <ChevronDown className="h-4 w-4" />
                View Signals
                {totalBullets > 0 && (
                  <Badge variant="secondary" className="text-xs ml-2">
                    {totalBullets}
                  </Badge>
                )}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-4 space-y-3">
                {post.pain_points && post.pain_points.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-destructive mb-1">Pain Points</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      {post.pain_points.map((point, i) => (
                        <li key={i}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {post.brag_metrics && post.brag_metrics.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-primary mb-1">Brag Metrics</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      {post.brag_metrics.map((metric, i) => (
                        <li key={i}>{metric}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {post.voice_phrases && post.voice_phrases.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Voice Phrases</h5>
                    <div className="flex flex-wrap gap-1">
                      {post.voice_phrases.map((phrase, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {phrase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {post.stated_priorities && post.stated_priorities.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Stated Priorities</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      {post.stated_priorities.map((priority, i) => (
                        <li key={i}>{priority}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {post.events_conferences && post.events_conferences.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Events & Conferences</h5>
                    <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
                      {post.events_conferences.map((event, i) => (
                        <li key={i}>{event}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {post._extra && Object.keys(post._extra).length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium mb-1">Other Fields</h5>
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {Object.entries(post._extra).map(([key, value]) => (
                        <div key={key} className="flex gap-2">
                          <span className="font-medium">{key}:</span>
                          <span>{typeof value === 'object' ? JSON.stringify(value) : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </GlassCard>
        );
      })}
      
      {visibleCount < posts.length && (
        <div className="text-center">
          <Button onClick={showMore} variant="outline" className="glass">
            Load More ({posts.length - visibleCount} remaining)
          </Button>
        </div>
      )}
    </div>
  );
}

// Helper component for chips
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block px-2 py-1 text-xs bg-white/10 border border-white/15 text-white/80 rounded-md mr-1 mb-1">
      {children}
    </span>
  );
}

// Section Card wrapper
function SectionCard({ 
  title, 
  children, 
  right 
}: { 
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

// New Company Tab Component
function NewCompanyTab({ companyItems }: { companyItems: ReturnType<typeof normalizeCompanyDataFromMessages> }) {
  const snap = aggregateCompanySnapshot(companyItems);

  return (
    <div className="space-y-6">
      {/* Company Snapshot */}
      <SectionCard 
        title="Company Snapshot" 
        right={
          Object.keys(snap.pageTypeCounts).length > 0 ? (
            <div className="flex gap-1">
              {Object.entries(snap.pageTypeCounts).map(([k,v]) => (
                <span key={k} className="text-xs px-2 py-0.5 rounded-md bg-white/10 border border-white/15 text-white/80">
                  {k} · {v}
                </span>
              ))}
            </div>
          ) : null
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-white/60 mb-1">Headline</div>
            <div className="text-white">{snap.primaryHeadline ?? '—'}</div>
          </div>
          <div>
            <div className="text-sm text-white/60 mb-1">Website</div>
            {snap.primaryUrl ? (
              <a href={snap.primaryUrl} target="_blank" rel="noopener" className="text-amber-300 hover:underline">
                {snap.primaryUrl}
              </a>
            ) : (
              <span className="text-white/70">—</span>
            )}
          </div>

          <div className="md:col-span-2">
            <div className="text-sm text-white/60 mb-1">Summary</div>
            <div className="text-white/80">{snap.primarySummary ?? '—'}</div>
          </div>

          {snap.emails.length > 0 && (
            <div>
              <div className="text-sm text-white/60 mb-1">Emails</div>
              <div>{snap.emails.map(e => <Chip key={e}>{e}</Chip>)}</div>
            </div>
          )}
          {snap.phones.length > 0 && (
            <div>
              <div className="text-sm text-white/60 mb-1">Phones</div>
              <div>{snap.phones.map(p => <Chip key={p}>{p}</Chip>)}</div>
            </div>
          )}
          {snap.social.length > 0 && (
            <div className="md:col-span-2">
              <div className="text-sm text-white/60 mb-1">Social</div>
              <div>{snap.social.map(s => <Chip key={s}>{s}</Chip>)}</div>
            </div>
          )}
          {snap.products.length > 0 && (
            <div className="md:col-span-2">
              <div className="text-sm text-white/60 mb-1">Products</div>
              <div>{snap.products.map(p => <Chip key={p}>{p}</Chip>)}</div>
            </div>
          )}
          {snap.value_props.length > 0 && (
            <div className="md:col-span-2">
              <div className="text-sm text-white/60 mb-1">Value Props</div>
              <div>{snap.value_props.map(v => <Chip key={v}>{v}</Chip>)}</div>
            </div>
          )}
          {snap.ctas.length > 0 && (
            <div className="md:col-span-2">
              <div className="text-sm text-white/60 mb-1">CTAs</div>
              <div>{snap.ctas.map(c => <Chip key={c}>{c}</Chip>)}</div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Recent Company Pages */}
      <div className="space-y-3">
        {companyItems.length === 0 && (
          <SectionCard title="Recent Company Pages">
            <div className="text-white/70">No content available.</div>
          </SectionCard>
        )}

        {companyItems.slice(0, 8).map((it, idx) => (
          <SectionCard
            key={idx}
            title={it.headline ?? 'Untitled'}
            right={it.page_type ? <Badge>{it.page_type}</Badge> : null}
          >
            {it.url && (
              <div className="mb-2">
                <a href={it.url} target="_blank" rel="noopener" className="text-amber-300 hover:underline">
                  {it.url}
                </a>
              </div>
            )}
            <div className="text-white/80 mb-3">{it.summary ?? '—'}</div>

            {it.products.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-white/60 mb-1">Products</div>
                {it.products.map(p => <Chip key={p}>{p}</Chip>)}
              </div>
            )}
            {it.value_props.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-white/60 mb-1">Value Props</div>
                {it.value_props.map(v => <Chip key={v}>{v}</Chip>)}
              </div>
            )}
            {it.ctas.length > 0 && (
              <div className="mb-2">
                <div className="text-xs text-white/60 mb-1">CTAs</div>
                {it.ctas.map(c => <Chip key={c}>{c}</Chip>)}
              </div>
            )}
            {(it.contacts.emails.length + it.contacts.phones.length + it.contacts.social.length) > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {it.contacts.emails.length > 0 && (
                  <div>
                    <div className="text-xs text-white/60 mb-1">Emails</div>
                    {it.contacts.emails.map(e => <Chip key={e}>{e}</Chip>)}
                  </div>
                )}
                {it.contacts.phones.length > 0 && (
                  <div>
                    <div className="text-xs text-white/60 mb-1">Phones</div>
                    {it.contacts.phones.map(p => <Chip key={p}>{p}</Chip>)}
                  </div>
                )}
                {it.contacts.social.length > 0 && (
                  <div>
                    <div className="text-xs text-white/60 mb-1">Social</div>
                    {it.contacts.social.map(s => <Chip key={s}>{s}</Chip>)}
                  </div>
                )}
              </div>
            )}
          </SectionCard>
        ))}
      </div>
    </div>
  );
}

// YouTube Summary Tab Component
function YouTubeSummaryTab({ youtubeData }: { youtubeData: ReturnType<typeof normalizeYouTubeSummary> }) {
  const { data, invalid } = youtubeData;

  return (
    <SectionCard
      title="YouTube Summary"
      right={invalid ? <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Invalid JSON</Badge> : null}
    >
      {/* Summary paragraph */}
      <div className="text-white/80 mb-4">{data.summary ?? '—'}</div>

      {/* Sections, only if non-empty */}
      {data.pain_points.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-white/60 mb-1">Pain points</div>
          <ul className="list-disc pl-5 space-y-1">
            {data.pain_points.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
      )}
      {data.brag_metrics.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-white/60 mb-1">Brag metrics</div>
          <ul className="list-disc pl-5 space-y-1">
            {data.brag_metrics.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
      )}
      {data.notable_quotes.length > 0 && (
        <div className="mb-3">
          <div className="text-sm text-white/60 mb-1">Notable quotes</div>
          <ul className="list-disc pl-5 space-y-1">
            {data.notable_quotes.map((x, i) => <li key={i}>&ldquo;{x}&rdquo;</li>)}
          </ul>
        </div>
      )}
      {data.stated_priorities.length > 0 && (
        <div>
          <div className="text-sm text-white/60 mb-1">Stated priorities</div>
          <ul className="list-disc pl-5 space-y-1">
            {data.stated_priorities.map((x, i) => <li key={i}>{x}</li>)}
          </ul>
        </div>
      )}

      {/* If everything empty */}
      {(!data.summary &&
        data.pain_points.length === 0 &&
        data.brag_metrics.length === 0 &&
        data.notable_quotes.length === 0 &&
        data.stated_priorities.length === 0) && (
        <div className="text-white/70">No YouTube summary available.</div>
      )}
    </SectionCard>
  );
}

// Competitors Tab Component
function CompetitorsTab({ competitorsData }: { competitorsData: ReturnType<typeof normalizeCompetitors> }) {
  return (
    <SectionCard
      title="Competitors"
      right={competitorsData.invalid ? <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Invalid JSON</Badge> : null}
    >
      {competitorsData.items.length === 0 ? (
        <div className="text-white/70">No competitors available.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {competitorsData.items.map((c, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-medium text-white truncate">
                    {c.website ? (
                      <a href={c.website} target="_blank" rel="noopener" className="hover:underline text-amber-300">
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </div>
                  {c.description && (
                    <div className="mt-1 text-sm text-white/80">{c.description}</div>
                  )}
                </div>
                {c.website && (
                  <a href={c.website} target="_blank" rel="noopener"
                     className="shrink-0 text-xs px-2 py-1 rounded-md bg-white/10 border border-white/15 text-white/80 hover:bg-white/15">
                    Visit
                  </a>
                )}
              </div>

              {c.readable && (
                <details className="mt-2 group">
                  <summary className="cursor-pointer text-xs text-white/60 hover:text-white/80">
                    More details
                  </summary>
                  <div className="mt-1 text-sm text-white/75">
                    {c.readable}
                  </div>
                </details>
              )}

              {c.website && (
                <div className="mt-2 text-xs text-white/50 truncate">{c.website}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// Search Tab Component
function SearchTab({ eventsData }: { eventsData: ReturnType<typeof parseEventsText> }) {
  return (
    <SectionCard title="Search">
      {eventsData.length === 0 ? (
        <div className="text-white/70">No search results or events available.</div>
      ) : (
        <div className="space-y-3">
          {eventsData.map((e, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  {/* Person */}
                  {e.person && (
                    <div className="text-sm text-white/60 mb-1">{e.person}</div>
                  )}

                  {/* Event title */}
                  <div className="text-base font-medium text-white mb-1">
                    {e.event ?? 'Untitled event'}
                  </div>

                  {/* Date */}
                  <div className="text-xs text-white/60 mb-2">
                    {e.date ?? '—'}
                  </div>

                  {/* Summary */}
                  {e.summary && (
                    <div className="text-white/80">{e.summary}</div>
                  )}
                </div>

                {/* YouTube button */}
                {e.youtube && (
                  <a
                    href={e.youtube}
                    target="_blank"
                    rel="noopener"
                    className="shrink-0 text-xs px-2 py-1 rounded-md bg-white/10 border border-white/15 text-white/80 hover:bg-white/15"
                    title="Open in YouTube"
                  >
                    Open
                  </a>
                )}
              </div>

              {/* Raw URL line (small) */}
              {e.youtube && (
                <div className="mt-2 text-xs text-white/50 truncate">
                  {e.youtube}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// Important URLs Tab Component
function ImportantUrlsTab({ importantUrls }: { importantUrls: ReturnType<typeof normalizeImportantUrls> }) {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("URL copied to clipboard!");
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  };

  return (
    <SectionCard 
      title="Important URLs" 
      right={importantUrls.invalid ? <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Invalid JSON</Badge> : null}
    >
      {importantUrls.items.length === 0 ? (
        <div className="text-white/70">No important URLs available.</div>
      ) : (
        <div className="space-y-2">
          {importantUrls.items.map((it, i) => (
            <div key={i} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm text-white truncate">{it.label}</div>
                <div className="text-xs text-white/50 truncate">{it.url}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => copyToClipboard(it.url)}
                  className="text-xs px-2 py-1 rounded-md bg-white/10 border border-white/15 text-white/80 hover:bg-white/15"
                  title="Copy URL"
                >
                  Copy
                </button>
                <a
                  href={it.url}
                  target="_blank"
                  rel="noopener"
                  className="text-xs px-2 py-1 rounded-md bg-white/10 border border-white/15 text-white/80 hover:bg-white/15"
                >
                  Open
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  );
}

// Analytics Tab Component
function AnalyticsTab({ data, title }: { data: ReturnType<typeof normalizeWebAnalytics>; title: string }) {
  const { data: analytics, invalid } = data;

  return (
    <div className="space-y-6">
      {/* Header KPIs */}
      <SectionCard title={`${title} Overview`} right={invalid ? <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">Invalid JSON</Badge> : null}>
        <StatsRow>
          <StatCard label="Visits" value={fmtNum(analytics.traffic?.visits)} />
          <StatCard 
            label="Bounce Rate" 
            value={fmtPct(analytics.traffic?.bounce_rate)} 
            tooltip="Percentage of sessions that were not engaged (GA4)"
          />
          <StatCard label="Pages/Visit" value={analytics.traffic?.pages_per_visit?.toString() ?? '—'} />
          <StatCard label="Time on Site" value={fmtDur(analytics.traffic?.time_on_site_sec)} />
          <StatCard label="Visits MoM" value={fmtPct(analytics.traffic?.visits_mom_change)} />
          <StatCard label="6-mo Change" value={fmtPct(analytics.traffic?.visits_change_6m)} />
        </StatsRow>
      </SectionCard>

      {/* Traffic by Channel */}
      {(analytics.traffic?.channels?.length ?? 0) > 0 && (
        <SectionCard title="Traffic by Channel">
          {analytics.traffic!.channels!.length <= 5 ? (
            <ResponsiveDonut 
              data={analytics.traffic!.channels!.map(c => ({ name: c.channel, value: c.value }))} 
            />
          ) : (
            <ResponsiveBar 
              data={analytics.traffic!.channels!} 
              x="channel" 
              y="value" 
            />
          )}
        </SectionCard>
      )}

      {/* Search Traffic History */}
      {(analytics.traffic?.search_traffic_history?.length ?? 0) > 0 && (
        <SectionCard title="Search Traffic (last 6 months)">
          <ResponsiveLines
            data={analytics.traffic!.search_traffic_history!.map(p => ({ 
              date: fmtDate(p.date), 
              search: p.search_traffic ?? 0, 
              organic: p.organic_traffic ?? 0, 
              paid: p.paid_traffic ?? 0 
            }))}
            lines={[
              {dataKey:'search', name:'Search', color: 'hsl(var(--primary))'},
              {dataKey:'organic', name:'Organic', color: 'hsl(var(--secondary))'},
              {dataKey:'paid', name:'Paid', color: 'hsl(var(--accent))'}
            ]}
          />
        </SectionCard>
      )}

      {/* Authority Section */}
      {analytics.authority && (
        <SectionCard title="Authority & Backlinks">
          <StatsRow className="mb-4">
            <StatCard label="Authority Score" value={analytics.authority.score?.toString() ?? '—'} />
            <StatCard label="Backlinks" value={fmtNum(analytics.authority.backlinks?.total)} />
            <StatCard label="Referring Domains" value={fmtNum(analytics.authority.backlinks?.referral_domains)} />
            <StatCard label="MoM Backlinks" value={fmtPct(analytics.authority.backlinks?.mom_change)} />
          </StatsRow>

          {/* Authority History Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {(analytics.authority.history?.authority_score?.length ?? 0) > 0 && (
              <ResponsiveLines
                title="Authority Score History"
                data={analytics.authority.history!.authority_score!.map(p => ({ 
                  date: fmtDate(p.date), 
                  score: p.value 
                }))}
                lines={[{dataKey:'score', name:'Authority Score'}]}
              />
            )}

            {(analytics.authority.history?.backlinks?.length ?? 0) > 0 && (
              <ResponsiveLines
                title="Backlinks History"
                data={analytics.authority.history!.backlinks!.map(p => ({ 
                  date: fmtDate(p.date), 
                  value: p.value 
                }))}
                lines={[{dataKey:'value', name:'Backlinks'}]}
              />
            )}
          </div>
        </SectionCard>
      )}

      {/* Top Pages Table */}
      {(analytics.traffic?.top_pages_organic?.length ?? 0) > 0 && (
        <SectionCard title="Top Organic Pages">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 text-white/70">URL</th>
                  <th className="text-left py-2 text-white/70">Keywords</th>
                </tr>
              </thead>
              <tbody>
                {analytics.traffic!.top_pages_organic!.slice(0, 10).map((page, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="py-2 text-white/90 truncate max-w-xs">{page.url}</td>
                    <td className="py-2 text-white/70">{page.keywords_count ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}

// Google Ads Tab Component
function GoogleAdsTab({ data }: { data: ReturnType<typeof normalizeGoogleAds> }) {
  const agg = aggregateGoogleAds(data);
  const isStale = (() => {
    const d = agg.kpis.lastShown ? new Date(agg.kpis.lastShown) : null;
    if (!d) return false;
    const ageDays = (Date.now() - d.getTime()) / 86400000;
    return ageDays > 45;
  })();

  return (
    <div className="space-y-6">
      {/* Header */}
      <SectionCard 
        title="Google Ads" 
        right={
          <div className="flex gap-2 items-center">
            {agg.kpis.lastShown && (
              <span className="text-xs px-2 py-1 rounded-md bg-white/10 border border-white/15 text-white/80">
                Last shown: {prettyRelative(agg.kpis.lastShown)}
              </span>
            )}
            {isStale && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                Stale data
              </Badge>
            )}
          </div>
        }
      >
        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Creatives" value={agg.kpis.creatives.toString()} />
          <StatCard label="Platforms" value={agg.kpis.platforms.toString()} />
          <StatCard label="Regions" value={agg.kpis.regions.toString()} />
          {agg.kpis.lastShown && (
            <StatCard label="Last Shown" value={prettyRelative(agg.kpis.lastShown) ?? "—"} />
          )}
        </div>
      </SectionCard>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Impressions by Platform">
          {agg.platformRows.length > 0 ? (
            <>
              <ResponsiveBar
                data={agg.platformRows.map(r => ({ 
                  name: r.name, 
                  value: Math.round(r.value) 
                }))}
                x="name"
                y="value"
              />
              <div className="text-xs text-white/60 mt-2">
                Most volume appears on {agg.platformRows[0]?.name || "top platform"}; ranges shown as midpoints.
              </div>
            </>
          ) : (
            <div className="text-white/70 py-8 text-center">Not enough data yet.</div>
          )}
        </SectionCard>

        <SectionCard title="Impressions by Region">
          {agg.regionRows.length > 0 ? (
            <>
              <ResponsiveBar
                data={agg.regionRows.map(r => ({ 
                  name: r.name, 
                  value: Math.round(r.value) 
                }))}
                x="name"
                y="value"
              />
              <div className="text-xs text-white/60 mt-2">
                Coverage highest in {agg.regionRows[0]?.name || "top region"}.
              </div>
            </>
          ) : (
            <div className="text-white/70 py-8 text-center">Not enough data yet.</div>
          )}
        </SectionCard>
      </div>

      {/* Creatives gallery */}
      {data.length === 0 ? (
        <SectionCard title="Creatives">
          <div className="text-white/70 py-8 text-center">
            No Google Ads creatives found for this advertiser.
          </div>
        </SectionCard>
      ) : (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-white/90">Creatives ({data.length})</h4>
          {data.slice(0, 10).map((creative, idx) => (
            <SectionCard
              key={idx}
              title={`${creative.type ?? "Creative"}${creative.advertiser?.name ? ` · ${creative.advertiser.name}` : ""}`}
              right={
                creative.lastShown ? (
                  <span className="text-xs text-white/60">
                    Last shown: {prettyRelative(creative.lastShown)}
                  </span>
                ) : null
              }
            >
              {creative.url && (
                <div className="mb-3">
                  <a 
                    href={creative.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-primary hover:underline text-sm inline-flex items-center gap-1"
                  >
                    View in Ads Transparency Center
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Advertiser info */}
              {creative.advertiser && (creative.advertiser.name || creative.advertiser.legalName) && (
                <div className="mb-3 space-y-1">
                  {creative.advertiser.name && (
                    <div className="text-sm text-white/90">
                      <span className="text-white/60">Advertiser: </span>
                      {creative.advertiser.name}
                    </div>
                  )}
                  {creative.advertiser.regionCode && (
                    <div className="text-xs text-white/70">
                      Region: {creative.advertiser.regionCode}
                    </div>
                  )}
                </div>
              )}

              {/* Targeting summary */}
              {creative.targeting && Object.keys(creative.targeting).length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-white/60 mb-2">Targeting</div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    {creative.targeting.locations && (
                      <span className="px-2 py-1 rounded bg-white/10 border border-white/15 text-white/80">
                        Locations: {creative.targeting.locations.including ? "✓ include" : ""}{creative.targeting.locations.excluding ? " / ✖ exclude" : ""}
                      </span>
                    )}
                    {creative.targeting.demographics && (
                      <span className="px-2 py-1 rounded bg-white/10 border border-white/15 text-white/80">
                        Demographics: {creative.targeting.demographics.including ? "✓" : "—"}{creative.targeting.demographics.excluding ? " / ✖" : ""}
                      </span>
                    )}
                    {creative.targeting.contextualSignals && (
                      <span className="px-2 py-1 rounded bg-white/10 border border-white/15 text-white/80">
                        Contextual: {creative.targeting.contextualSignals.including ? "✓" : "—"}{creative.targeting.contextualSignals.excluding ? " / ✖" : ""}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Platforms per creative */}
              {creative.stats?.byPlatform && creative.stats.byPlatform.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs text-white/60 mb-2">Platforms (midpoint impressions)</div>
                  <div className="flex flex-wrap gap-2">
                    {creative.stats.byPlatform.slice(0, 5).map((p, i) => {
                      const v = Math.round(mid(p.impression));
                      return (
                        <span 
                          key={i} 
                          className="px-2 py-1 rounded-md bg-white/10 border border-white/15 text-xs text-white/80"
                        >
                          {p.name}: ~{v.toLocaleString()}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Variants */}
              {creative.variants && creative.variants.length > 0 && (
                <div>
                  <div className="text-xs text-white/60 mb-2">Assets</div>
                  <div className="flex flex-wrap gap-2">
                    {creative.variants.slice(0, 6).map((variant, i) => (
                      <a
                        key={i}
                        href={variant}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2 py-1 rounded bg-white/10 border border-white/15 hover:bg-white/15 text-xs text-white/80 inline-flex items-center gap-1"
                      >
                        Asset {i + 1}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </SectionCard>
          ))}
        </div>
      )}

      {/* Footnote */}
      <div className="text-xs text-white/50 p-3 rounded-lg bg-white/5 border border-white/10">
        Notes: Google Ads Transparency Center reports impressions in <strong>ranges</strong>; this view charts midpoints for readability. 
        Formats, regions, and last-shown dates come from ATC. {isStale ? "Data may be stale." : ""}
      </div>
    </div>
  );
}

// Helper to group tech stack by categories
function groupByCategory(stack: Array<{ name: string; categories: string[] }>): Record<string, Array<{ name: string; categories: string[] }>> {
  const out: Record<string, Array<{ name: string; categories: string[] }>> = {};
  for (const t of stack) {
    (t.categories.length ? t.categories : ["uncategorized"]).forEach(cat => {
      out[cat] = out[cat] || [];
      out[cat].push(t);
    });
  }
  return out;
}

// Crunchbase Tab Component
function CrunchbaseTab({ data }: { data: any }) {
  const items = normalizeCrunchbase(data);
  
  if (items.length === 0) {
    return (
      <SectionCard title="Crunchbase">
        <div className="text-center py-8 text-white/70">
          No Crunchbase data available.
        </div>
      </SectionCard>
    );
  }

  const agg = crunchbaseAggregates(items);
  const cb = items[0];
  const s = agg.snapshot;

  // Generate auto-insights
  const insights: string[] = [];
  if (typeof cb.growth_current === 'number' && !isNaN(cb.growth_current)) {
    const delta = typeof cb.growth_score_delta_d90 === 'number' && !isNaN(cb.growth_score_delta_d90)
      ? cb.growth_score_delta_d90 > 0 ? `up ${cb.growth_score_delta_d90.toFixed(0)} over 90 days` : `down ${Math.abs(cb.growth_score_delta_d90).toFixed(0)} over 90 days`
      : '';
    insights.push(`Growth score ${cb.growth_current.toFixed(0)}${delta ? ', ' + delta : ''}.`);
  }
  
  const techGroups = groupByCategory(cb.tech_stack ?? []);
  const topTechCat = Object.entries(techGroups).sort((a,b) => b[1].length - a[1].length)[0];
  if (topTechCat) {
    insights.push(`Tech stack leans ${topTechCat[0]} (${topTechCat[1].length} tools).`);
  }
  
  const topSimilar = (cb.similar_orgs ?? [])[0];
  if (topSimilar?.score != null && !isNaN(topSimilar.score)) {
    insights.push(`Closest peer: ${topSimilar.name} (${topSimilar.score.toFixed(2)}).`);
  }

  const growthDelta = typeof cb.growth_score_delta_d90 === 'number' && !isNaN(cb.growth_score_delta_d90)
    ? cb.growth_score_delta_d90
    : undefined;

  return (
    <div className="space-y-6">
      {/* Header with org name and link */}
      <SectionCard 
        title={s.org_name || 'Organization'}
        right={
          <div className="flex items-center gap-2">
            {s.acquisition_probability_tier && (
              <Badge variant="outline" className="glass">{s.acquisition_probability_tier}</Badge>
            )}
            {s.org_permalink && (
              <a 
                href={`https://www.crunchbase.com/organization/${s.org_permalink}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs px-3 py-1 rounded-lg bg-white/10 border border-white/15 text-white/80 hover:bg-white/15 flex items-center gap-1"
              >
                <Globe className="h-3 w-3" />
                View on Crunchbase
              </a>
            )}
          </div>
        }
      >
        <div className="space-y-2">
          <div className="flex flex-wrap gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Users className="h-4 w-4 text-white/60" />
              <span className="text-white/90">{prettyEmployeesRange(cb.employees_range)}</span>
            </div>
            {cb.last_funding_type && (
              <div className="flex items-center gap-1.5">
                <Wallet className="h-4 w-4 text-white/60" />
                <span className="text-white/90">{cb.last_funding_type} · {crunchbaseFmtDate(cb.last_funding_date)}</span>
              </div>
            )}
          </div>
          
          {/* Locations & Categories */}
          <div className="flex flex-wrap gap-2 mt-3">
            {(cb.locations ?? []).map(loc => (
              <Badge key={loc} variant="outline" className="glass text-xs">
                <MapPin className="h-3 w-3 mr-1" />{loc}
              </Badge>
            ))}
            {(cb.categories ?? []).map(cat => (
              <Badge key={cat} variant="secondary" className="glass text-xs">{cat}</Badge>
            ))}
          </div>
        </div>
      </SectionCard>

      {/* KPI Cards (≤7) */}
      <SectionCard title="Key Metrics">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {typeof cb.growth_current === 'number' && !isNaN(cb.growth_current) && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-white/60" />
                <div className="text-xs text-white/60">Growth Now</div>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-lg font-semibold text-white">{cb.growth_current.toFixed(0)}</div>
                {growthDelta !== undefined && (
                  <div className={`text-xs ${growthDelta > 0 ? 'text-green-400' : growthDelta < 0 ? 'text-red-400' : 'text-white/60'}`}>
                    {growthDelta > 0 ? '▲' : growthDelta < 0 ? '▼' : '—'} {Math.abs(growthDelta).toFixed(0)} (90d)
                  </div>
                )}
              </div>
            </div>
          )}
          
          {typeof cb.heat_current === 'number' && !isNaN(cb.heat_current) && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-white/60" />
                <div className="text-xs text-white/60">Heat Score</div>
              </div>
              <div className="text-lg font-semibold text-white">{cb.heat_current.toFixed(0)}</div>
            </div>
          )}
          
          {typeof cb.num_investors === 'number' && !isNaN(cb.num_investors) && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-white/60" />
                <div className="text-xs text-white/60">Investors</div>
              </div>
              <div className="text-lg font-semibold text-white">{fmtNum(cb.num_investors)}</div>
            </div>
          )}
          
          {typeof cb.num_funding_rounds === 'number' && !isNaN(cb.num_funding_rounds) && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-white/60" />
                <div className="text-xs text-white/60">Funding Rounds</div>
              </div>
              <div className="text-lg font-semibold text-white">{fmtNum(cb.num_funding_rounds)}</div>
            </div>
          )}
          
          {typeof cb.ipo_prediction_score === 'number' && !isNaN(cb.ipo_prediction_score) && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
              <div className="flex items-center gap-2 mb-1">
                <Rocket className="h-4 w-4 text-white/60" />
                <div className="text-xs text-white/60">IPO Pred.</div>
              </div>
              <div className="text-lg font-semibold text-white">{cb.ipo_prediction_score.toFixed(2)}</div>
            </div>
          )}
          
          {typeof cb.acquisition_prediction_score === 'number' && !isNaN(cb.acquisition_prediction_score) && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
              <div className="flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-white/60" />
                <div className="text-xs text-white/60">Acq. Pred.</div>
              </div>
              <div className="text-lg font-semibold text-white">{cb.acquisition_prediction_score.toFixed(2)}</div>
            </div>
          )}
          
          {typeof cb.funding_prediction_score === 'number' && !isNaN(cb.funding_prediction_score) && (
            <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="h-4 w-4 text-white/60" />
                <div className="text-xs text-white/60">Funding Pred.</div>
              </div>
              <div className="text-lg font-semibold text-white">{cb.funding_prediction_score.toFixed(2)}</div>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Tech Stack */}
      {Object.keys(techGroups).length > 0 && (
        <SectionCard title="Technology Stack">
          <div className="space-y-4">
            {/* Category bars */}
            <div className="space-y-2">
              <div className="text-xs text-white/60 mb-2">Categories</div>
              {Object.entries(techGroups)
                .sort((a,b) => b[1].length - a[1].length)
                .slice(0, 5)
                .map(([cat, techs]) => (
                  <div key={cat} className="flex items-center gap-3">
                    <div className="w-24 text-xs text-white/70 truncate">{cat}</div>
                    <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
                      <div 
                        className="h-full bg-primary/60"
                        style={{ width: `${Math.min(100, (techs.length / Math.max(...Object.values(techGroups).map(t => t.length))) * 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/60 w-8 text-right">{techs.length}</div>
                  </div>
                ))}
            </div>
            
            {/* Tech chips */}
            <div>
              <div className="text-xs text-white/60 mb-2">Technologies</div>
              <div className="flex flex-wrap gap-2">
                {(cb.tech_stack ?? []).slice(0, 20).map(tech => (
                  <Badge key={tech.name} className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                    {tech.name}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>
      )}

      {/* Similar Organizations */}
      {(cb.similar_orgs ?? []).length > 0 && (
        <SectionCard title="Similar Organizations">
          <div className="space-y-2">
            {cb.similar_orgs.slice(0, 5).map((org, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                <div className="flex-1 min-w-0">
                  {org.permalink ? (
                    <a 
                      href={`https://www.crunchbase.com/organization/${org.permalink}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline truncate block"
                    >
                      {org.name}
                    </a>
                  ) : (
                    <span className="text-white/90 truncate block">{org.name}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-xs text-white/70">{org.score?.toFixed(2) ?? '—'}</div>
                  {org.score != null && !isNaN(org.score) && (
                    <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-white/80 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, org.score * 100))}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Recommended Hubs */}
      {(cb.recommended_hubs ?? []).length > 0 && (
        <SectionCard title="Recommended Hubs">
          <div className="space-y-2">
            {cb.recommended_hubs
              .filter(h => typeof h.org_count === 'number' && !isNaN(h.org_count))
              .sort((a,b) => (b.org_count ?? 0) - (a.org_count ?? 0))
              .slice(0, 5)
              .map((hub, i) => (
                <div key={i} className="flex items-center justify-between gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="flex-1 min-w-0">
                    {hub.permalink ? (
                      <a 
                        href={`https://www.crunchbase.com/hub/${hub.permalink}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary hover:underline truncate block"
                      >
                        {hub.name}
                      </a>
                    ) : (
                      <span className="text-white/90 truncate block">{hub.name}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-xs text-white/70">{fmtNum(hub.org_count)}</div>
                    <div className="h-1.5 w-24 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary/60 rounded-full"
                        style={{ width: `${Math.min(100, ((hub.org_count ?? 0) / Math.max(...cb.recommended_hubs.map(h => h.org_count ?? 0))) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      )}

      {/* Key Employee Changes Timeline */}
      {(cb.key_employee_changes ?? []).filter(e => e.date || e.press_date).length > 0 && (
        <SectionCard title="People Moves">
          <div className="space-y-4">
            {cb.key_employee_changes
              .filter(e => e.date || e.press_date)
              .sort((a,b) => (b.date || b.press_date || '').localeCompare(a.date || a.press_date || ''))
              .map((event, i) => (
                <div key={i} className="flex gap-4 pb-4 border-b border-white/5 last:border-0">
                  <div className="w-24 shrink-0 text-xs text-white/60">
                    {crunchbaseFmtDate(event.date || event.press_date)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white/90 font-medium text-sm">{event.press_publisher ?? 'Update'}</div>
                    {event.description && (
                      <div className="text-white/70 text-sm mt-1">{event.description}</div>
                    )}
                    {event.press_url && (
                      <a 
                        href={event.press_url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-primary hover:underline text-xs mt-1 inline-flex items-center gap-1"
                      >
                        Read source <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </SectionCard>
      )}

      {/* Auto-insights */}
      {insights.length > 0 && (
        <SectionCard title="Quick Insights">
          <ul className="space-y-2">
            {insights.map((insight, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary mt-0.5">•</span>
                <span className="text-white/80">{insight}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}

export default LeadDrawer;