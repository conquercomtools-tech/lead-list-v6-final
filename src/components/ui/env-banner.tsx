import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface EnvBannerProps {
  missingVars: string[];
}

export function EnvBanner({ missingVars }: EnvBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (missingVars.length === 0 || dismissed) return null;

  return (
    <Alert className="border-destructive/50 bg-destructive/10 glass-card relative mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="pr-8">
        <strong>Missing Environment Variables:</strong> {missingVars.join(', ')}
        <br />
        <span className="text-sm text-muted-foreground">
          Set these in your Lovable project settings to connect to Supabase.
        </span>
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        className="absolute right-2 top-2 h-6 w-6 p-0"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}