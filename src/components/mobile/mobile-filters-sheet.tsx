import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { FilterState } from "@/components/dashboard/filters-bar";

interface MobileFiltersSheetProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  uniqueValues: {
    emailStatuses: string[];
    industries: string[];
    countries: string[];
  };
}

export function MobileFiltersSheet({ filters, onFiltersChange, uniqueValues }: MobileFiltersSheetProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);
  const [isOpen, setIsOpen] = useState(false);

  const updateLocalFilter = (key: keyof FilterState, value: any) => {
    setLocalFilters({ ...localFilters, [key]: value });
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
    setIsOpen(false);
  };

  const resetFilters = () => {
    const defaultFilters = {
      search: "",
      emailStatus: "",
      industry: "",
      country: "",
      employeesRange: [0, 10000] as [number, number],
      fundingRange: [0, 1000000000] as [number, number],
      revenueRange: [0, 1000000000] as [number, number],
    };
    setLocalFilters(defaultFilters);
  };

  const hasActiveFilters = 
    filters.emailStatus ||
    filters.industry ||
    filters.country ||
    filters.employeesRange[0] > 0 ||
    filters.employeesRange[1] < 10000 ||
    filters.fundingRange[0] > 0 ||
    filters.fundingRange[1] < 1000000000 ||
    filters.revenueRange[0] > 0 ||
    filters.revenueRange[1] < 1000000000;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          className="tap-lg glass border-border/30 relative"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <div className="absolute -top-1 -right-1 h-3 w-3 bg-primary rounded-full"></div>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="glass-card border-border/30 max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filter Leads</SheetTitle>
          <SheetDescription>
            Refine your search with advanced filters
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Quick Selectors */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-base font-medium">Email Status</Label>
              <Select 
                value={localFilters.emailStatus || "all"} 
                onValueChange={(value) => updateLocalFilter('emailStatus', value === "all" ? "" : value)}
              >
                <SelectTrigger className="glass border-border/30 h-12 text-base">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/30">
                  <SelectItem value="all">All Statuses</SelectItem>
                  {uniqueValues.emailStatuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Industry</Label>
              <Select 
                value={localFilters.industry || "all"} 
                onValueChange={(value) => updateLocalFilter('industry', value === "all" ? "" : value)}
              >
                <SelectTrigger className="glass border-border/30 h-12 text-base">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/30">
                  <SelectItem value="all">All Industries</SelectItem>
                  {uniqueValues.industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-base font-medium">Country</Label>
              <Select 
                value={localFilters.country || "all"} 
                onValueChange={(value) => updateLocalFilter('country', value === "all" ? "" : value)}
              >
                <SelectTrigger className="glass border-border/30 h-12 text-base">
                  <SelectValue placeholder="All Countries" />
                </SelectTrigger>
                <SelectContent className="glass-card border-border/30">
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueValues.countries.map((country) => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Range Sliders */}
          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base font-medium">Employees</Label>
              <Slider
                value={localFilters.employeesRange}
                onValueChange={(value) => updateLocalFilter('employeesRange', value as [number, number])}
                max={10000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{localFilters.employeesRange[0].toLocaleString()}</span>
                <span>{localFilters.employeesRange[1].toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Total Funding</Label>
              <Slider
                value={localFilters.fundingRange}
                onValueChange={(value) => updateLocalFilter('fundingRange', value as [number, number])}
                max={1000000000}
                step={1000000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${(localFilters.fundingRange[0] / 1000000).toFixed(0)}M</span>
                <span>${(localFilters.fundingRange[1] / 1000000).toFixed(0)}M</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-base font-medium">Annual Revenue</Label>
              <Slider
                value={localFilters.revenueRange}
                onValueChange={(value) => updateLocalFilter('revenueRange', value as [number, number])}
                max={1000000000}
                step={1000000}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>${(localFilters.revenueRange[0] / 1000000).toFixed(0)}M</span>
                <span>${(localFilters.revenueRange[1] / 1000000).toFixed(0)}M</span>
              </div>
            </div>
          </div>
        </div>

        <SheetFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={resetFilters}
            className="tap-lg glass border-border/30 flex-1"
          >
            Reset
          </Button>
          <Button 
            onClick={applyFilters}
            className="tap-lg flex-1"
          >
            Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}