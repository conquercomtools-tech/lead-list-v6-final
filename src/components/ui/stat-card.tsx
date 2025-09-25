import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  tooltip?: string;
  className?: string;
}

export function StatCard({ label, value, tooltip, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-white/10 bg-white/5 backdrop-blur p-3", className)}>
      <div className="text-xs text-white/60 mb-1" title={tooltip}>
        {label}
      </div>
      <div className="text-lg font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

interface StatsRowProps {
  children: React.ReactNode;
  className?: string;
}

export function StatsRow({ children, className }: StatsRowProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3", className)}>
      {children}
    </div>
  );
}