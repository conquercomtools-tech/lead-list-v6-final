import { ChevronRight, Mail } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Button } from "@/components/ui/button";
import { Lead, getCountryFlag } from "@/lib/supabase";
import { getInitials } from "@/lib/initials";

interface MobileLeadCardProps {
  lead: Lead;
  onLeadClick: (lead: Lead) => void;
}

export function MobileLeadCard({ lead, onLeadClick }: MobileLeadCardProps) {
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
          src={lead.avatar_url}
          alt={`${lead['First Name'] ?? ''} ${lead['Last Name'] ?? ''}`.trim() || lead.Company || 'Lead'}
          initialsText={getInitials(lead['First Name'], lead['Last Name'], lead.Company)}
          size="md"
          className="shrink-0"
        />

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name */}
          <div className="font-semibold text-white truncate">
            {[lead['First Name'], lead['Last Name']].filter(Boolean).join(' ') || 'N/A'}
          </div>

          {/* Title */}
          {lead.Title && (
            <div className="text-sm text-white/70 truncate">
              {lead.Title}
            </div>
          )}

          {/* Company with country flag */}
          <div className="flex items-center gap-2 mt-1">
            {lead.Company && (
              <div className="text-sm text-primary truncate font-medium">
                {lead.Company}
              </div>
            )}
            {lead.Country && (
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-xs">{getCountryFlag(lead.Country)}</span>
              </div>
            )}
          </div>

          {/* Email status */}
          <div className="flex items-center gap-2 mt-2">
            {lead.Email && (
              <div className="flex items-center gap-1">
                <Mail className="h-3 w-3 text-white/60" />
                <span className="text-xs text-white/60 truncate max-w-[120px]">
                  {lead.Email}
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