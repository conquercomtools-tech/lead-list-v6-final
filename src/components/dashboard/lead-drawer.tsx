import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge } from "@/components/ui/status-badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, ExternalLink, Phone, Mail, MapPin, ChevronDown, Calendar, TrendingUp, Users, DollarSign, Building } from "lucide-react";
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
  money,
  fmtDate
} from "@/lib/normalize";

interface LeadDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDrawer({ lead, open, onClose }: LeadDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview");

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
          <TabsList className="glass border-border/30">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="linkedin">LinkedIn Activity</TabsTrigger>
            <TabsTrigger value="company">Company</TabsTrigger>
            <TabsTrigger value="youtube">YouTube Summary</TabsTrigger>
          </TabsList>

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

export default LeadDrawer;