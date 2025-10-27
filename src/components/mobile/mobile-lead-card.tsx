import { ChevronRight, Mail } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lead, getCountryFlag } from "@/lib/supabase";
import { getInitials } from "@/lib/initials";
import { hasJsonItems } from "@/lib/metrics";

interface MobileLeadCardProps {
  lead: Lead;
  onLeadClick: (lead: Lead) => void;
}

export function MobileLeadCard({ lead, onLeadClick }: MobileLeadCardProps) {
  const nameParts = (lead.name ?? '').trim().split(/\s+/);
  const derivedFirst = lead['First Name'] ?? (nameParts.length ? nameParts[0] : undefined);
  const derivedLast = lead['Last Name'] ?? (nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined);
  const displayName = lead.name || [lead['First Name'], lead['Last Name']].filter(Boolean).join(' ') || 'N/A';
  const title = lead.title ?? lead.Title;
  const companyName = lead.company ?? lead.Company;
  const email = lead.email ?? lead.Email;
  const country = lead.country ?? lead.Country ?? lead['Company Country'];
  const flags = {
    linkedin: hasJsonItems(lead.linkedin_posts) || hasJsonItems(lead.company_linkedin_post),
    youtube: hasJsonItems(lead.youtube_video),
    competitors: hasJsonItems(lead.competitors),
    googleAds: hasJsonItems(lead.google_ads ?? lead.googel_ads),
    metaAds: hasJsonItems(lead.meta_ads),
    similarweb: hasJsonItems(lead.website_analytic_similarweb ?? (lead as any)?.['website_analytic(similarweb)']),
    semrush: hasJsonItems(lead.website_analytic_semrush ?? (lead as any)?.['website_analytic(semrush)']),
  } as const;
  const flagLabels: Record<keyof typeof flags, string> = {
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    competitors: 'Competitors',
    googleAds: 'Google Ads',
    metaAds: 'Meta Ads',
    similarweb: 'Similarweb',
    semrush: 'SEMrush',
  };
  const activeFlags = (Object.keys(flags) as (keyof typeof flags)[]).filter((key) => flags[key]);

  const handleCardClick = () => {
    onLeadClick(lead);
  };

  return (
    <div 
      className="rounded-2xl bg-white/5 border border-white/10 p-3 cursor-pointer transition-smooth hover:bg-white/10 active:bg-white/15"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <Avatar
          src={lead.avatar_url ?? undefined}
          alt={displayName || companyName || 'Lead'}
          initialsText={getInitials(derivedFirst, derivedLast, companyName)}
          size="md"
          className="shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="font-semibold text-white truncate">
            {displayName}
          </div>

          {/* Title */}
          {title && (
            <div className="text-sm text-white/70 truncate">
              {title}
            </div>
          )}

          {/* Company with country flag */}
          <div className="flex items-center gap-2 mt-1">
            {companyName && (
              <div className="text-sm text-primary truncate font-medium">
                {companyName}
              </div>
            )}
            {country && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs">{getCountryFlag(country)}</span>
              </div>
            )}
          </div>

          {activeFlags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {activeFlags.map((key) => (
                <Badge key={key} variant="outline" className="bg-white/5 border-white/15 text-[10px] uppercase tracking-wide">
                  {flagLabels[key]}
                </Badge>
              ))}
            </div>
          )}

          {/* Email status */}
          <div className="flex items-center gap-2 mt-2">
            {email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-white/60" />
                <span className="text-xs text-white/60 truncate max-w-[120px]">
                  {email}
                </span>
              </div>
            )}
            <StatusBadge status={lead['Email Status']} size="sm" />
          </div>
        </div>

        {/* Arrow */}
        <Button
          variant="ghost"
          size="sm"
          className="tap-lg shrink-0 text-white/60 hover:text-white hover:bg-white/10"
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick();
          }}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}