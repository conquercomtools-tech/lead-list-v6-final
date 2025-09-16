import React, { useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge } from "@/components/ui/status-badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Copy, ExternalLink, Phone, Mail, MapPin, ChevronDown, Calendar, TrendingUp, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Lead, formatCurrency, formatNumber, getCountryFlag } from "@/lib/supabase";
import { safeJson } from "@/lib/utils";

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
  
  // Parse JSON fields safely
  type Post = {
    date?: string;
    post_type?: string;
    summaries?: string[];
    pain_points?: string[];
    brag_metrics?: string[];
    voice_phrases?: string[];
    stated_priorities?: string[];
    events_conferences?: string[];
  };
  
  const linkedinPosts = safeJson<Post[]>(lead?.linkedin_posts, []);
  const basicInfo = safeJson<Record<string, any>>(lead?.basic_info, {});
  const companyLinkedinPost = safeJson<any>(lead?.company_linkedin_post, null);
  const companyData = safeJson<Record<string, any>>(lead?.company_data, {});
  const technologies = lead?.Technologies ? lead.Technologies.split(',').map(tech => tech.trim()).filter(Boolean) : [];

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
            {linkedinPosts.length > 0 ? (
              <div className="space-y-4">
                {linkedinPosts.map((post, index) => (
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
                            {new Date(post.date).toLocaleDateString()}
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
            ) : (
              <GlassCard className="p-12 text-center">
                <div className="text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                  <p className="text-sm">No LinkedIn posts found for this lead.</p>
                </div>
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="company" className="space-y-6">
            {/* Basic Info */}
            {Object.keys(basicInfo).length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(basicInfo).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <span className="text-sm font-medium text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <p className="text-sm">{String(value) || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Company LinkedIn Posts */}
            {companyLinkedinPost && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Company LinkedIn Activity</h3>
                {Array.isArray(companyLinkedinPost) ? (
                  <div className="space-y-4">
                    {companyLinkedinPost.slice(0, 3).map((post, index) => (
                      <div key={index} className="p-4 rounded-lg bg-muted/20">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline">Company Post</Badge>
                          {post.link && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(post.link, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {post.content || post.text || 'No content available'}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground">
                      {companyLinkedinPost.content || companyLinkedinPost.text || 'No content available'}
                    </p>
                  </div>
                )}
              </GlassCard>
            )}

            {/* Company Data */}
            {Object.keys(companyData).length > 0 && (
              <div className="space-y-6">
                {/* Website & Socials */}
                {(companyData.website || companyData.social_media) && (
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Website & Social</h3>
                    <div className="space-y-2">
                      {companyData.website && (
                        <div className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <a href={companyData.website} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {companyData.website}
                          </a>
                        </div>
                      )}
                      {companyData.social_media && Object.entries(companyData.social_media).map(([platform, url]) => (
                        <div key={platform} className="flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize text-sm font-medium">{platform}:</span>
                          <a href={String(url)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm">
                            {String(url)}
                          </a>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Tech Stack */}
                {companyData.technologies && (
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(companyData.technologies) ? companyData.technologies : [companyData.technologies]).map((tech, index) => (
                        <Badge key={index} variant="secondary" className="glass">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </GlassCard>
                )}

                {/* Description */}
                {companyData.description && (
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Description</h3>
                    <p className="text-sm text-muted-foreground">{companyData.description}</p>
                  </GlassCard>
                )}

                {/* Funding Milestones */}
                {companyData.funding_rounds && (
                  <GlassCard className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Funding Milestones</h3>
                    <div className="space-y-3">
                      {(Array.isArray(companyData.funding_rounds) ? companyData.funding_rounds : [companyData.funding_rounds]).map((round, index) => (
                        <div key={index} className="p-3 rounded-lg bg-muted/20">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{round.round_type || 'Funding Round'}</span>
                              {round.date && (
                                <span className="text-sm text-muted-foreground ml-2">
                                  ({new Date(round.date).toLocaleDateString()})
                                </span>
                              )}
                            </div>
                            {round.amount && (
                              <Badge variant="outline">{formatCurrency(round.amount)}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                )}
              </div>
            )}

            {/* Technologies */}
            {technologies.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Listed Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech, index) => (
                    <Badge key={index} variant="secondary" className="glass">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="raw" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">LinkedIn Posts</h3>
                <pre className="text-xs bg-muted/20 p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
                  {JSON.stringify(lead?.linkedin_posts, null, 2)}
                </pre>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Basic Info</h3>
                <pre className="text-xs bg-muted/20 p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
                  {JSON.stringify(lead?.basic_info, null, 2)}
                </pre>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Company LinkedIn Post</h3>
                <pre className="text-xs bg-muted/20 p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
                  {JSON.stringify(lead?.company_linkedin_post, null, 2)}
                </pre>
              </GlassCard>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Company Data</h3>
                <pre className="text-xs bg-muted/20 p-4 rounded-lg overflow-auto max-h-64 whitespace-pre-wrap">
                  {JSON.stringify(lead?.company_data, null, 2)}
                </pre>
              </GlassCard>
            </div>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Complete Lead Data</h3>
              <pre className="text-xs bg-muted/20 p-4 rounded-lg overflow-auto max-h-96 whitespace-pre-wrap">
                {JSON.stringify(lead, null, 2)}
              </pre>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}