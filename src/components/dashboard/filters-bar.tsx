import { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MobileFiltersSheet } from "@/components/mobile/mobile-filters-sheet";
import { useIsMobile } from "@/hooks/use-mobile";

export interface FilterState {
  search: string;
  emailStatus: string;
  industry: string;
  country: string;
  employeesRange: [number, number];
  fundingRange: [number, number];
  revenueRange: [number, number];
}

interface FiltersBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  uniqueValues: {
    emailStatuses: string[];
    industries: string[];
    countries: string[];
  };
}

export function FiltersBar({ filters, onFiltersChange, uniqueValues }: FiltersBarProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useIsMobile();

  const updateFilter = (key: keyof FilterState, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      emailStatus: "",
      industry: "",
      country: "",
      employeesRange: [0, 10000],
      fundingRange: [0, 1000000000],
      revenueRange: [0, 1000000000],
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.emailStatus ||
    filters.industry ||
    filters.country ||
    filters.employeesRange[0] > 0 ||
    filters.employeesRange[1] < 10000 ||
    filters.fundingRange[0] > 0 ||
    filters.fundingRange[1] < 1000000000 ||
    filters.revenueRange[0] > 0 ||
    filters.revenueRange[1] < 1000000000;

  if (isMobile) {
    return (
      <GlassCard className="p-4 mb-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-10 glass border-border/30 h-12 text-base"
            />
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {/* Status Chip */}
            {filters.emailStatus && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-lg text-sm">
                <span>Status: {filters.emailStatus}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-white/10"
                  onClick={() => updateFilter('emailStatus', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Industry Chip */}
            {filters.industry && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-lg text-sm">
                <span>Industry: {filters.industry}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-white/10"
                  onClick={() => updateFilter('industry', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Country Chip */}
            {filters.country && (
              <div className="flex items-center gap-1 px-3 py-1.5 bg-primary/20 border border-primary/30 rounded-lg text-sm">
                <span>Country: {filters.country}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 hover:bg-white/10"
                  onClick={() => updateFilter('country', '')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            {/* Filters Button */}
            <MobileFiltersSheet
              filters={filters}
              onFiltersChange={onFiltersChange}
              uniqueValues={uniqueValues}
            />

            {/* Clear All */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="tap-lg glass border-border/30"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-4 sticky top-4 z-10 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads by name, company, title, or email..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-10 glass border-border/30"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex flex-wrap lg:flex-nowrap gap-2">
          <Select value={filters.emailStatus || "all"} onValueChange={(value) => updateFilter('emailStatus', value === "all" ? "" : value)}>
            <SelectTrigger className="w-[140px] glass border-border/30">
              <SelectValue placeholder="Email Status" />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/30">
              <SelectItem value="all">All Statuses</SelectItem>
              {uniqueValues.emailStatuses.map((status) => (
                <SelectItem key={status} value={status}>{status}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.industry || "all"} onValueChange={(value) => updateFilter('industry', value === "all" ? "" : value)}>
            <SelectTrigger className="w-[140px] glass border-border/30">
              <SelectValue placeholder="Industry" />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/30">
              <SelectItem value="all">All Industries</SelectItem>
              {uniqueValues.industries.map((industry) => (
                <SelectItem key={industry} value={industry}>{industry}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.country || "all"} onValueChange={(value) => updateFilter('country', value === "all" ? "" : value)}>
            <SelectTrigger className="w-[140px] glass border-border/30">
              <SelectValue placeholder="Country" />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/30">
              <SelectItem value="all">All Countries</SelectItem>
              {uniqueValues.countries.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="outline" className="glass border-border/30">
                <Filter className="h-4 w-4 mr-2" />
                Advanced
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="absolute top-full left-0 right-0 mt-2 z-20">
              <GlassCard className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Employees Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Employees</Label>
                    <Slider
                      value={filters.employeesRange}
                      onValueChange={(value) => updateFilter('employeesRange', value as [number, number])}
                      max={10000}
                      step={100}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{filters.employeesRange[0].toLocaleString()}</span>
                      <span>{filters.employeesRange[1].toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Funding Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Total Funding</Label>
                    <Slider
                      value={filters.fundingRange}
                      onValueChange={(value) => updateFilter('fundingRange', value as [number, number])}
                      max={1000000000}
                      step={1000000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${(filters.fundingRange[0] / 1000000).toFixed(0)}M</span>
                      <span>${(filters.fundingRange[1] / 1000000).toFixed(0)}M</span>
                    </div>
                  </div>

                  {/* Revenue Range */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Annual Revenue</Label>
                    <Slider
                      value={filters.revenueRange}
                      onValueChange={(value) => updateFilter('revenueRange', value as [number, number])}
                      max={1000000000}
                      step={1000000}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>${(filters.revenueRange[0] / 1000000).toFixed(0)}M</span>
                      <span>${(filters.revenueRange[1] / 1000000).toFixed(0)}M</span>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </CollapsibleContent>
          </Collapsible>

          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="glass border-border/30"
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>
    </GlassCard>
  );
}