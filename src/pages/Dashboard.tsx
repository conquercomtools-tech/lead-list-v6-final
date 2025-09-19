import { useState } from "react";
import { Settings } from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { EnvBanner } from "@/components/ui/env-banner";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { FiltersBar, FilterState } from "@/components/dashboard/filters-bar";
import { LeadsTable } from "@/components/dashboard/leads-table";
import { ChartsPanel } from "@/components/charts/charts-panel";
import { LeadDrawer } from "@/components/dashboard/lead-drawer";
import { MobileStatsChips } from "@/components/mobile/mobile-stats-chips";
import { MobileChartsCarousel } from "@/components/mobile/mobile-charts-carousel";
import { useLeads } from "@/hooks/use-leads";
import { useIsMobile } from "@/hooks/use-mobile";
import { Lead, checkEnvVars } from "@/lib/supabase";
import conquerLogo from "@/assets/conquer-logo.png";

const DEFAULT_FILTERS: FilterState = {
  search: "",
  emailStatus: "",
  industry: "",
  country: "",
  employeesRange: [0, 10000],
  fundingRange: [0, 1000000000],
  revenueRange: [0, 1000000000],
};

export default function Dashboard() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isMobile = useIsMobile();
  const missingEnvVars = checkEnvVars();

  const {
    leads,
    totalCount,
    stats,
    uniqueValues,
    isLoading,
    error,
  } = useLeads(currentPage, pageSize, sortColumn, sortDirection, filters);

  const handleSort = (column: string, direction: "asc" | "desc") => {
    setSortColumn(column);
    setSortDirection(direction);
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleLeadClick = (lead: Lead) => {
    setSelectedLead(lead);
    setDrawerOpen(true);
  };

  if (error) {
    return (
      <div className="min-h-screen p-6">
        <GlassCard className="p-8 text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Data</h1>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : "An unexpected error occurred"}
          </p>
          <Button onClick={() => window.location.reload()}>
            Retry
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/20 backdrop-blur-xl bg-background/80">
        <div className="container mx-auto px-4 md:px-6 py-3 md:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
              <img 
                src={conquerLogo} 
                alt="Conquer Logo" 
                className="h-6 md:h-8 w-auto cursor-pointer shrink-0"
                onClick={() => window.location.href = '/'}
              />
              <div className="min-w-0">
                <h1 className={`font-bold gradient-text ${isMobile ? 'text-lg' : 'text-3xl'}`}>
                  Conquer Lead Dashboard
                </h1>
                {!isMobile && (
                  <p className="text-muted-foreground">Analyze and manage your lead data with advanced insights</p>
                )}
              </div>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  size={isMobile ? "sm" : "sm"}
                  className={`glass border-border/30 ${isMobile ? 'tap-lg p-2' : ''}`}
                >
                  <Settings className="h-4 w-4" />
                  {!isMobile && <span className="ml-2">Settings</span>}
                </Button>
              </DialogTrigger>
              <DialogContent className="glass-card border-border/30">
                <DialogHeader>
                  <DialogTitle>Environment Configuration</DialogTitle>
                  <DialogDescription>
                    Set these environment variables in your Lovable project settings:
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <code className="text-sm font-mono bg-muted/20 p-2 rounded block">
                      VITE_SUPABASE_URL=your_supabase_url
                    </code>
                    <code className="text-sm font-mono bg-muted/20 p-2 rounded block">
                      VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
                    </code>
                    <code className="text-sm font-mono bg-muted/20 p-2 rounded block">
                      VITE_SUPABASE_TABLE_NAME=your_table_name (optional, defaults to "5LEAD TEST")
                    </code>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Navigate to Project → Settings → Environment Variables in Lovable to set these values.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <EnvBanner missingVars={missingEnvVars} />
        
        {/* Stats - Cards on desktop, chips on mobile */}
        {isMobile ? (
          <div className="mb-6">
            <MobileStatsChips stats={stats} isLoading={isLoading} />
          </div>
        ) : (
          <StatsCards stats={stats} isLoading={isLoading} />
        )}

        {/* Filters */}
        <FiltersBar
          filters={filters}
          onFiltersChange={handleFiltersChange}
          uniqueValues={uniqueValues}
        />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
          {/* Leads Table */}
          <div className="lg:col-span-2">
            <LeadsTable
              leads={leads}
              isLoading={isLoading}
              totalCount={totalCount}
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSort={handleSort}
              onLeadClick={handleLeadClick}
            />
          </div>

          {/* Charts Panel */}
          <div className="lg:col-span-1">
            {isMobile ? (
              <MobileChartsCarousel leads={leads} isLoading={isLoading} />
            ) : (
              <ChartsPanel leads={leads} isLoading={isLoading} />
            )}
          </div>
        </div>

        {/* Lead Details Drawer */}
        <LeadDrawer
          lead={selectedLead}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        />
      </main>
    </div>
  );
}