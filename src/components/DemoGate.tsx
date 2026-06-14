import { useNavigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";

type Props = {
  feature: string;
  description?: string;
  children?: ReactNode;
  /** When true (default), block the page entirely with an upgrade card. When false, just shows nothing if demo. */
  block?: boolean;
  /** When true, auto-redirect to /pricing instead of showing the upgrade card. */
  redirect?: boolean;
};

/**
 * Wrap any Pro-only feature. In demo (trial) mode:
 *  - If redirect=true → auto-navigate to /pricing
 *  - Else → replace children with an upgrade card
 * In paid mode, renders children normally.
 */
export function DemoGate({ feature, description, children, block = true, redirect = false }: Props) {
  const navigate = useNavigate();
  const { loading, isTrial, isPaid } = useSubscription();

  useEffect(() => {
    if (!loading && isTrial && redirect) {
      toast.warning(`${feature} — activation requise`, {
        description: "Cette fonctionnalité nécessite une licence active. Choisissez un plan pour continuer.",
      });
      navigate("/pricing", { replace: true });
    }
  }, [loading, isTrial, redirect, feature, navigate]);

  if (loading) return null;
  if (isPaid) return <>{children}</>;
  if (!isTrial) return <>{children}</>; // locked state handled by TrialLockGuard
  if (redirect) return null;

  // Demo mode → block with upgrade card
  if (!block) return null;
  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="glass-card rounded-2xl max-w-md p-6 text-center space-y-4">
        <Badge variant="outline" className="mx-auto rounded-lg">Version Démo</Badge>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{feature} — Licence requise</h2>
        <p className="text-sm text-muted-foreground">
          {description || `Cette fonctionnalité n'est pas incluse dans la version démo. Activez votre licence pour débloquer ${feature}.`}
        </p>
        <Button className="rounded-xl w-full" onClick={() => navigate("/pricing")}>
          <Sparkles className="h-4 w-4 mr-2" />Activer ma licence
        </Button>
      </Card>
    </div>
  );
}
