import { useNavigate } from "react-router-dom";
import { Sparkles, Lock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscription } from "@/hooks/useSubscription";

const FULL_ACCESS_UNTIL = new Date("2026-07-19T00:00:00Z").getTime();

export function TrialBanner() {
  const navigate = useNavigate();
  const { loading, daysLeft, locked } = useSubscription();
  if (loading) return null;

  const now = Date.now();
  const inPromo = now < FULL_ACCESS_UNTIL;

  // 🎁 Bandeau promo : accès complet pendant 21 jours pour tout le monde
  if (inPromo) {
    const promoDays = Math.max(0, Math.ceil((FULL_ACCESS_UNTIL - now) / 86400000));
    return (
      <div className="bg-gradient-to-r from-emerald-500/15 via-primary/10 to-amber-500/15 border-b border-primary/30 px-4 py-2 flex items-center gap-2 text-sm">
        <Gift className="h-4 w-4 text-primary shrink-0" />
        <span className="flex-1">
          <strong>🎁 Accès complet pendant {promoDays} jour{promoDays > 1 ? "s" : ""} !</strong>
          <span className="text-muted-foreground ml-2 hidden sm:inline">— tous les modules sont déverrouillés (offert par l'équipe Focus).</span>
        </span>
        <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => navigate("/pricing")}>Voir les plans</Button>
      </div>
    );
  }

  if (locked) {
    return (
      <div className="bg-destructive/10 border-b border-destructive/30 px-4 py-2 flex items-center gap-2 text-sm">
        <Lock className="h-4 w-4 text-destructive shrink-0" />
        <span className="flex-1"><strong>Période d'accès terminée.</strong> Activez un plan pour débloquer l'application.</span>
        <Button size="sm" className="rounded-xl" onClick={() => navigate("/pricing")}>Activer maintenant</Button>
      </div>
    );
  }

  return null;
}
