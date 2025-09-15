import { useState } from "react";
import { ChevronUp, ChevronDown, ExternalLink, Copy, Mail, Phone } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { AvatarInitials } from "@/components/ui/avatar-initials";
import { StatusBadge } from "@/components/ui/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Lead, formatCurrency, formatNumber, getInitials, getCountryFlag } from "@/lib/supabase";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface LeadsTableProps {
  leads: Lead[];
  isLoading: boolean;
  totalCount: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onSort: (column: string, direction: 'asc' | 'desc') => void;
  onLeadClick: (lead: Lead) => void;
}

type SortColumn = string;
type SortDirection = 'asc' | 'desc';

export function LeadsTable({
  leads,
  isLoading,
  totalCount,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSort,
  onLeadClick,
}: LeadsTableProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const { toast } = useToast();

  const handleSort = (column: string) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
    onSort(column, newDirection);
  };

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

  const SortButton = ({ column, children }: { column: string; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      className="h-auto p-0 font-semibold justify-start hover:bg-transparent"
      onClick={() => handleSort(column)}
    >
      {children}
      {sortColumn === column && (
        sortDirection === 'asc' 
          ? <ChevronUp className="ml-2 h-4 w-4" />
          : <ChevronDown className="ml-2 h-4 w-4" />
      )}
    </Button>
  );

  const totalPages = Math.ceil(totalCount / pageSize);

  if (isLoading) {
    return (
      <GlassCard className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex space-x-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="overflow-hidden">
      <div className="p-6 border-b border-border/20">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold gradient-text">
            Leads ({totalCount.toLocaleString()})
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => onPageSizeChange(Number(value))}>
              <SelectTrigger className="w-20 glass border-border/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-card border-border/30">
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/10">
            <tr className="border-b border-border/20">
              <th className="text-left p-4 min-w-[200px]">
                <SortButton column="name">Contact</SortButton>
              </th>
              <th className="text-left p-4 min-w-[150px]">
                <SortButton column="title">Title</SortButton>
              </th>
              <th className="text-left p-4 min-w-[150px]">
                <SortButton column="company">Company</SortButton>
              </th>
              <th className="text-left p-4 min-w-[180px]">
                <SortButton column="email">Email</SortButton>
              </th>
              <th className="text-left p-4 min-w-[120px]">
                <SortButton column="country">Country</SortButton>
              </th>
              <th className="text-left p-4 min-w-[100px]">
                <SortButton column="employees">Employees</SortButton>
              </th>
              <th className="text-left p-4 min-w-[120px]">
                <SortButton column="funding">Funding</SortButton>
              </th>
              <th className="text-left p-4 min-w-[120px]">
                <SortButton column="revenue">Revenue</SortButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, index) => (
              <tr
                key={index}
                className="border-b border-border/10 hover:bg-muted/5 cursor-pointer transition-smooth"
                onClick={() => onLeadClick(lead)}
              >
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <AvatarInitials 
                      initials={getInitials(lead['First Name'], lead['Last Name'], lead.Company)}
                      size="sm"
                    />
                    <div>
                      <div className="font-medium">
                        {[lead['First Name'], lead['Last Name']].filter(Boolean).join(' ') || 'N/A'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {lead['Person Linkedin Url'] && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-primary hover:bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(lead['Person Linkedin Url'], '_blank');
                            }}
                          >
                            LinkedIn <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm">{lead.Title || 'N/A'}</div>
                </td>
                <td className="p-4">
                  <div className="font-medium">{lead.Company || 'N/A'}</div>
                  {lead['Company Linkedin Url'] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary hover:bg-transparent"
                      onClick={(e) => {
                        e.stopPropagation();
                        window.open(lead['Company Linkedin Url'], '_blank');
                      }}
                    >
                      Company Page <ExternalLink className="ml-1 h-3 w-3" />
                    </Button>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      {lead.Email && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-sm font-medium hover:bg-transparent"
                            onClick={(e) => {
                              e.stopPropagation();
                              window.open(`mailto:${lead.Email}`, '_blank');
                            }}
                          >
                            <Mail className="mr-1 h-3 w-3" />
                            {lead.Email}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyToClipboard(lead.Email!, 'Email');
                            }}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      <StatusBadge status={lead['Email Status']} />
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span>{getCountryFlag(lead.Country)}</span>
                    <span className="text-sm">{lead.Country || 'N/A'}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium">
                    {formatNumber(lead['# Employees'])}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium">
                    {formatCurrency(lead['Total Funding'])}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm font-medium">
                    {formatCurrency(lead['Annual Revenue'])}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between p-4 border-t border-border/20">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * pageSize + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} results
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="glass border-border/30"
            >
              Previous
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, Math.min(currentPage - 2 + i, totalPages - 4 + i));
                if (pageNum < 1 || pageNum > totalPages) return null;
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(pageNum)}
                    className={currentPage === pageNum ? "bg-primary" : "glass border-border/30"}
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="glass border-border/30"
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </GlassCard>
  );
}