import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePlanAccess, type FeatureKey } from "@/hooks/usePlanAccess";

type Props = {
  feature: FeatureKey;
  title: string;
  description?: string;
  children: ReactNode;
  /** Inline soft-lock instead of full-page block. */
  soft?: boolean;
};

const PLAN_LABEL: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  enterprise: "Entreprise",
};

export function PlanGate({ feature, title, description, children, soft = false }: Props) {
  const navigate = useNavigate();
  const { loading, hasAccess, requiredPlan, isTrial, isPaid } = usePlanAccess();

  if (loading) return null;
  if (hasAccess(feature)) return <>{children}</>;

  const reqLabel = PLAN_LABEL[requiredPlan(feature)] ?? "supérieur";
  const desc =
    description ||
    (isTrial
      ? `Cette fonctionnalité est incluse dans le plan ${reqLabel}. Activez votre licence pour y accéder.`
      : isPaid
      ? `Votre plan actuel ne couvre pas cette fonctionnalité. Passez au plan ${reqLabel}.`
      : `Une licence active (${reqLabel} minimum) est requise.`);

  if (soft) {
    return (
      <Card className="glass-card rounded-2xl p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          <Lock className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{desc}</p>
        </div>
        <Button size="sm" className="rounded-xl shrink-0" onClick={() => navigate("/pricing")}>
          Plan {reqLabel}
        </Button>
      </Card>
    );
  }

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-4">
      <Card className="glass-card rounded-2xl max-w-md p-6 text-center space-y-4">
        <Badge variant="outline" className="mx-auto rounded-lg">Plan {reqLabel} requis</Badge>
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{desc}</p>
        <Button className="rounded-xl w-full" onClick={() => navigate("/pricing")}>
          <Sparkles className="h-4 w-4 mr-2" />Passer au plan {reqLabel}
        </Button>
      </Card>
    </div>
  );
}
