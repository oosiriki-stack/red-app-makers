import { useNavigate } from "react-router-dom";
import { ReactNode } from "react";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";

type Props = {
  feature: string;
  description?: string;
  children?: ReactNode;
  /** When true (default), block the page entirely with an upgrade card. When false, just shows nothing if demo. */
  block?: boolean;
};

/**
 * Wrap any Pro-only feature. In demo (trial) mode, replaces children with an upgrade card.
 * In paid mode, renders children normally.
 */
export function DemoGate({ feature, description, children, block = true }: Props) {
  const navigate = useNavigate();
  const { loading, isTrial, isPaid } = useSubscription();

  if (loading) return null;
  if (isPaid) return <>{children}</>;
  if (!isTrial) return <>{children}</>; // locked state handled by TrialLockGuard

  // Demo mode → block
  if (!block) return null;
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="glass-card rounded-2xl max-w-md p-6 text-center space-y-4">
        <Badge variant="outline" className="mx-auto rounded-lg">Version Démo</Badge>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-medium">{feature} — Réservé Pro</h2>
        <p className="text-sm text-muted-foreground">
          {description || `Cette fonctionnalité n'est pas incluse dans la version démo. Passez à un plan payant pour débloquer ${feature}.`}
        </p>
        <Button className="rounded-xl w-full" onClick={() => navigate("/pricing")}>
          <Sparkles className="h-4 w-4 mr-2" />Passer Pro
        </Button>
      </Card>
    </div>
  );
}
