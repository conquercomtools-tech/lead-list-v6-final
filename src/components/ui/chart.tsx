// Simple chart utilities without the complex shadcn implementation
import * as React from "react";

// Basic chart context - simplified version
const ChartContext = React.createContext<{
  config: Record<string, any>;
} | null>(null);

export function ChartContainer({
  config,
  children,
  className,
}: {
  config: Record<string, any>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <ChartContext.Provider value={{ config }}>
      <div className={className}>
        {children}
      </div>
    </ChartContext.Provider>
  );
}

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer");
  }
  return context;
}

// Simple tooltip component
export const ChartTooltip = ({ children }: { children: React.ReactNode }) => children;

// Export empty components for compatibility
export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));

ChartTooltipContent.displayName = "ChartTooltipContent";

export const ChartLegend = ({ children }: { children: React.ReactNode }) => children;

export const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={className} {...props} />
));

ChartLegendContent.displayName = "ChartLegendContent";