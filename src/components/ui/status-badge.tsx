import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status?: string;
  variant?: "default" | "verified" | "invalid" | "pending";
  className?: string;
}

export function StatusBadge({ status, variant, className }: StatusBadgeProps) {
  if (!status) return null;

  // Auto-detect variant based on status if not provided
  const getVariant = (statusText: string) => {
    const lower = statusText.toLowerCase();
    if (lower.includes('verified') || lower.includes('valid') || lower.includes('active')) {
      return 'verified';
    }
    if (lower.includes('invalid') || lower.includes('bounced') || lower.includes('failed')) {
      return 'invalid';
    }
    if (lower.includes('pending') || lower.includes('risky') || lower.includes('unknown')) {
      return 'pending';
    }
    return 'default';
  };

  const finalVariant = variant || getVariant(status);

  const variantClasses = {
    default: "bg-secondary/50 text-secondary-foreground border-secondary",
    verified: "bg-green-500/20 text-green-400 border-green-500/30",
    invalid: "bg-red-500/20 text-red-400 border-red-500/30",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <Badge
      className={cn(
        "glass border transition-smooth",
        variantClasses[finalVariant],
        className
      )}
    >
      {status}
    </Badge>
  );
}