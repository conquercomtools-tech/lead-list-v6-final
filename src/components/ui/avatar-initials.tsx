import { cn } from "@/lib/utils";

interface AvatarInitialsProps {
  initials: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AvatarInitials({ initials, className, size = "md" }: AvatarInitialsProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={cn(
        "rounded-full bg-gradient-to-br from-primary/80 to-accent/60 flex items-center justify-center font-semibold text-primary-foreground glass",
        sizeClasses[size],
        className
      )}
    >
      {initials}
    </div>
  );
}