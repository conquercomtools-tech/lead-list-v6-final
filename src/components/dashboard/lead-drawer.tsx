import { useState } from "react";
import { X, Copy, ExternalLink, Mail, Phone, MapPin, Building, Users, DollarSign, Calendar, Link as LinkIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GlassCard } from "@/components/ui/glass-card";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge } from "@/components/ui/status-badge";
import { Lead, formatCurrency, formatNumber, getInitials, getCountryFlag } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface LeadDrawerProps {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
}

export function LeadDrawer({ lead, open, onClose }: LeadDrawerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  if (!lead) return null;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${type} copied successfully!`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy manually",
        variant: "destructive",
      });
    }
  };

  const fullName = [lead['First Name'], lead['Last Name']].filter(Boolean).join(' ') || 'Unknown';
  
  const linkedinPosts = lead.linkedin_posts ? 
    (Array.isArray(lead.linkedin_posts) ? lead.linkedin_posts : [lead.linkedin_posts]) : [];

  const technologies = lead.Technologies ? 
    lead.Technologies.split(',').map(tech => tech.trim()).filter(Boolean) : [];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-2xl glass-card border-border/30 overflow-y-auto">
        <SheetHeader className="pb-6 border-b border-border/20">
          <div className="flex items-start gap-4">
            <AvatarInitials 
              initials={getInitials(lead['First Name'], lead['Last Name'], lead.Company)}
              size="lg"
            />
            <div className="flex-1">
              <SheetTitle className="text-2xl gradient-text">{fullName}</SheetTitle>
              <p className="text-lg text-muted-foreground">{lead.Title || 'No title'}</p>
              <p className="text-lg font-medium">{lead.Company || 'No company'}</p>
              <div className="flex gap-2 mt-2">
                <StatusBadge status={lead['Email Status']} />
                {lead.Industry && <Badge variant="outline" className="glass">{lead.Industry}</Badge>}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-3 glass">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="signals">Signals</TabsTrigger>
            <TabsTrigger value="raw">Raw Data</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Contact Information */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </h3>
              <div className="space-y-3">
                {lead.Email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>Primary Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${lead.Email}`, '_blank')}
                        className="text-primary hover:bg-transparent"
                      >
                        {lead.Email}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(lead.Email!, 'Email')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {lead['Secondary Email'] && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>Secondary Email</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`mailto:${lead['Secondary Email']}`, '_blank')}
                        className="text-primary hover:bg-transparent"
                      >
                        {lead['Secondary Email']}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(lead['Secondary Email']!, 'Secondary Email')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {lead['Company Phone'] && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>Company Phone</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(`tel:${lead['Company Phone']}`, '_blank')}
                        className="text-primary hover:bg-transparent"
                      >
                        {lead['Company Phone']}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(lead['Company Phone']!, 'Phone')}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {lead['Person Linkedin Url'] && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-muted-foreground" />
                      <span>LinkedIn Profile</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(lead['Person Linkedin Url'], '_blank')}
                      className="text-primary hover:bg-transparent"
                    >
                      View Profile <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Company Information */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Industry</p>
                  <p className="font-medium">{lead.Industry || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium flex items-center gap-2">
                    {getCountryFlag(lead.Country)}
                    {[lead['Company City'], lead['Company State'], lead['Company Country']].filter(Boolean).join(', ') || 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Employees</p>
                  <p className="font-medium">{formatNumber(lead['# Employees'])}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Annual Revenue</p>
                  <p className="font-medium">{formatCurrency(lead['Annual Revenue'])}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Funding</p>
                  <p className="font-medium">{formatCurrency(lead['Total Funding'])}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Latest Funding</p>
                  <p className="font-medium">{formatCurrency(lead['Latest Funding Amount'])}</p>
                </div>
                {lead['Last Raised At'] && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Raised</p>
                    <p className="font-medium">{new Date(lead['Last Raised At']).toLocaleDateString()}</p>
                  </div>
                )}
                {lead['Latest Funding'] && (
                  <div>
                    <p className="text-sm text-muted-foreground">Funding Stage</p>
                    <p className="font-medium">{lead['Latest Funding']}</p>
                  </div>
                )}
              </div>

              {lead['Company Linkedin Url'] && (
                <div className="mt-4 pt-4 border-t border-border/20">
                  <Button
                    variant="outline"
                    onClick={() => window.open(lead['Company Linkedin Url'], '_blank')}
                    className="glass border-border/30"
                  >
                    View Company LinkedIn <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </GlassCard>
          </TabsContent>

          <TabsContent value="signals" className="space-y-6 mt-6">
            {/* Technologies */}
            {technologies.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Technologies</h3>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech, index) => (
                    <Badge key={index} variant="outline" className="glass">
                      {tech}
                    </Badge>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* LinkedIn Posts */}
            {linkedinPosts.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Recent LinkedIn Activity</h3>
                <div className="space-y-4">
                  {linkedinPosts.slice(0, 3).map((post: any, index: number) => (
                    <div key={index} className="p-4 glass rounded-lg">
                      <p className="text-sm">{typeof post === 'string' ? post : JSON.stringify(post)}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {/* Basic Info */}
            {lead.basic_info && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
                <div className="p-4 glass rounded-lg">
                  <pre className="text-sm whitespace-pre-wrap text-muted-foreground">
                    {typeof lead.basic_info === 'string' ? lead.basic_info : JSON.stringify(lead.basic_info, null, 2)}
                  </pre>
                </div>
              </GlassCard>
            )}
          </TabsContent>

          <TabsContent value="raw" className="mt-6">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold mb-4">Raw Lead Data</h3>
              <pre className="text-xs whitespace-pre-wrap text-muted-foreground bg-muted/5 p-4 rounded-lg overflow-auto max-h-96">
                {JSON.stringify(lead, null, 2)}
              </pre>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}