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
  normalizeBasicInfo, 
  normalizeCompanyData, 
  normalizeCompanyPosts,
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
  const linkedinPosts = normalizeLinkedInPosts(lead?.linkedin_posts);
  const basicInfo = normalizeBasicInfo(lead?.basic_info);
  const companyData = normalizeCompanyData(lead?.company_data);
  const companyPosts = normalizeCompanyPosts(lead?.company_linkedin_post);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-3xl glass-card border-border/30 overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-border/20">
          <div className="flex items-start gap-4">
            <AvatarInitials 
              initials={(lead?.['First Name']?.[0] || '') + (lead?.['Last Name']?.[0] || '') || lead?.Company?.[0] || '?'}
              size="lg"
            />
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
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Basic Info Section */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Basic Info
              </h3>
              {basicInfo.fullname || basicInfo.first_name || basicInfo.last_name ? (
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    {basicInfo.profile_picture_url ? (
                      <img 
                        src={basicInfo.profile_picture_url} 
                        alt="Profile"
                        className="w-16 h-16 rounded-full object-cover border-2 border-border/20"
                      />
                    ) : (
                      <AvatarInitials 
                        initials={
                          basicInfo.first_name && basicInfo.last_name 
                            ? (basicInfo.first_name[0] + basicInfo.last_name[0])
                            : basicInfo.fullname 
                              ? basicInfo.fullname.split(' ').map(n => n[0]).join('').slice(0, 2)
                              : '?'
                        }
                        size="md"
                        className="w-16 h-16"
                      />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
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
            <CompanyTab 
              basicInfo={basicInfo}
              companyData={companyData}
              companyPosts={companyPosts}
            />
          </TabsContent>

          <TabsContent value="raw" className="space-y-6">
            <RawDataTab 
              linkedinPosts={linkedinPosts}
              basicInfo={basicInfo}
              companyData={companyData}
              companyPosts={companyPosts}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

// LinkedIn Activity Tab Component
function LinkedInActivityTab({ posts }: { posts: ReturnType<typeof normalizeLinkedInPosts> }) {
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

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
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
          
          {post.summaries && post.summaries.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium mb-2">Summary</h4>
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
                  <h5 className="text-sm font-medium mb-1">Priorities</h5>
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
            </CollapsibleContent>
          </Collapsible>
        </GlassCard>
      ))}
    </div>
  );
}

// Company Tab Component
function CompanyTab({ 
  basicInfo, 
  companyData, 
  companyPosts 
}: { 
  basicInfo: ReturnType<typeof normalizeBasicInfo>;
  companyData: ReturnType<typeof normalizeCompanyData>;
  companyPosts: ReturnType<typeof normalizeCompanyPosts>;
}) {
  return (
    <div className="space-y-6">
      {/* Profile Section */}
      <GlassCard className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building className="h-5 w-5" />
          Profile
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {basicInfo.fullname && (
            <div>
              <span className="font-medium">Name:</span>
              <p className="text-muted-foreground">{basicInfo.fullname}</p>
            </div>
          )}
          {basicInfo.headline && (
            <div>
              <span className="font-medium">Headline:</span>
              <p className="text-muted-foreground">{basicInfo.headline}</p>
            </div>
          )}
          {(basicInfo.location_full || basicInfo.location_city || basicInfo.location_country) && (
            <div>
              <span className="font-medium">Location:</span>
              <p className="text-muted-foreground">
                {basicInfo.location_full || basicInfo.location_city || basicInfo.location_country}
              </p>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Contacts Section */}
      {(companyData.contacts.emails.length > 0 || companyData.contacts.phones.length > 0 || companyData.contacts.social.length > 0) && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Contacts</h3>
          <div className="space-y-3">
            {companyData.contacts.emails.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Emails</h4>
                <div className="flex flex-wrap gap-2">
                  {companyData.contacts.emails.map((email, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {companyData.contacts.phones.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Phones</h4>
                <div className="flex flex-wrap gap-2">
                  {companyData.contacts.phones.map((phone, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {phone}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {companyData.contacts.social.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Social</h4>
                <div className="flex flex-wrap gap-2">
                  {companyData.contacts.social.map((social, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {social}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Products & CTAs */}
      {(companyData.products.length > 0 || companyData.ctas.length > 0) && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Products & CTAs</h3>
          <div className="space-y-3">
            {companyData.products.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Products</h4>
                <div className="flex flex-wrap gap-2">
                  {companyData.products.map((product, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {product}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {companyData.ctas.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">CTAs</h4>
                <div className="flex flex-wrap gap-2">
                  {companyData.ctas.map((cta, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {cta}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Funding Table */}
      {companyData.funding.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Funding History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Round</th>
                  <th className="text-left py-2">Date</th>
                  <th className="text-left py-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {companyData.funding.map((fund, idx) => (
                  <tr key={idx} className="border-b border-border/50">
                    <td className="py-2">{fund.round || '—'}</td>
                    <td className="py-2">{fmtDate(fund.date)}</td>
                    <td className="py-2">{money(fund.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Tech Stack */}
      {companyData.tech.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {companyData.tech.map((tech, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Company Posts */}
      {companyPosts.length > 0 && (
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Company Posts</h3>
          <div className="space-y-3">
            {companyPosts.slice(0, 3).map((post, idx) => (
              <div key={idx} className="p-3 bg-muted/20 rounded border border-border/50">
                <div className="flex items-center gap-2 mb-2">
                  {post.date && (
                    <span className="text-xs text-muted-foreground">
                      {fmtDate(post.date)}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.excerpt || post.content || 'No content available'}
                </p>
                {post.link && (
                  <a href={post.link} target="_blank" rel="noopener noreferrer" 
                     className="text-primary hover:underline text-xs flex items-center gap-1 mt-2">
                    View Post <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}

// Raw Data Tab Component
function RawDataTab({ 
  linkedinPosts, 
  basicInfo, 
  companyData, 
  companyPosts 
}: { 
  linkedinPosts: ReturnType<typeof normalizeLinkedInPosts>;
  basicInfo: ReturnType<typeof normalizeBasicInfo>;
  companyData: ReturnType<typeof normalizeCompanyData>;
  companyPosts: ReturnType<typeof normalizeCompanyPosts>;
}) {
  return (
    <GlassCard className="p-6">
      <h3 className="text-lg font-semibold mb-4">Raw JSON Data (Normalized)</h3>
      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">LinkedIn Posts</h4>
          <pre className="text-xs bg-muted/50 p-2 rounded border overflow-auto max-h-32">
            {JSON.stringify(linkedinPosts, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Basic Info</h4>
          <pre className="text-xs bg-muted/50 p-2 rounded border overflow-auto max-h-32">
            {JSON.stringify(basicInfo, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Company Posts</h4>
          <pre className="text-xs bg-muted/50 p-2 rounded border overflow-auto max-h-32">
            {JSON.stringify(companyPosts, null, 2)}
          </pre>
        </div>
        
        <div>
          <h4 className="font-medium mb-2">Company Data</h4>
          <pre className="text-xs bg-muted/50 p-2 rounded border overflow-auto max-h-32">
            {JSON.stringify(companyData, null, 2)}
          </pre>
        </div>
      </div>
    </GlassCard>
  );
}

export default LeadDrawer;