import { useLocation, useNavigate } from "react-router-dom";
import { ReactNode, useEffect } from "react";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSubscription } from "@/hooks/useSubscription";

// Routes always accessible even when locked
const ALLOW = ["/pricing", "/support", "/settings"];

export function TrialLockGuard({ children }: { children: ReactNode }) {
  const { loading, locked } = useSubscription();
  const location = useLocation();
  const navigate = useNavigate();
  const allowed = ALLOW.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    if (!loading && locked && !allowed) {
      // redirect once
      navigate("/pricing", { replace: true });
    }
  }, [loading, locked, allowed, location.pathname]);

  if (!loading && locked && !allowed) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="glass-card rounded-2xl max-w-md p-6 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto">
            <Lock className="h-6 w-6 text-destructive" />
          </div>
          <h2 className="text-xl font-medium">Période d'essai terminée</h2>
          <p className="text-sm text-muted-foreground">
            Votre essai gratuit de 14 jours est terminé. Activez un plan pour continuer à utiliser Focus.
          </p>
          <Button className="rounded-xl w-full" onClick={() => navigate("/pricing")}>Voir les plans</Button>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
}
