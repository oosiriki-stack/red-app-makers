import { useNavigate } from "react-router-dom";
import { Sparkles, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

export function TrialBanner() {
  const navigate = useNavigate();
  const { loading, isTrial, isPaid, daysLeft, locked } = useSubscription();
  if (loading || isPaid) return null;

  if (locked) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-2 flex items-center gap-2 text-sm">
        <Lock className="h-4 w-4 text-destructive shrink-0" />
        <span className="flex-1"><strong>Période d'essai terminée.</strong> Activez un plan pour débloquer l'application.</span>
        <Button size="sm" className="rounded-xl" onClick={() => navigate("/pricing")}>Activer maintenant</Button>
      </div>
    );
  }

  if (isTrial) {
    const urgent = daysLeft <= 3;
    return (
      <div className={`${urgent ? "bg-orange-500/15 border-orange-500/30" : "bg-primary/10 border-primary/30"} border-b px-4 py-2 flex items-center gap-2 text-sm`}>
        <Sparkles className={`h-4 w-4 shrink-0 ${urgent ? "text-orange-500" : "text-primary"}`} />
        <span className="flex-1">
          <strong>Version Démo · {daysLeft} jour{daysLeft > 1 ? "s" : ""} restant{daysLeft > 1 ? "s" : ""}</strong>
          <span className="text-muted-foreground ml-2 hidden sm:inline">— accès limité (Dashboard, Mentions, Alertes). Rapports, FocusGPT, Concurrents & Crise réservés Pro.</span>
        </span>
        <Button size="sm" variant={urgent ? "default" : "outline"} className="rounded-xl" onClick={() => navigate("/pricing")}>Passer Pro</Button>
      </div>
    );
  }
  return null;
}
