import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Building2, Loader2 } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const WAVE_LINK = "https://pay.wave.com/m/M_ci_mZX836uJEiGE/c/ci/";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    price: "15 000",
    period: "FCFA/mois",
    features: [
      "500 mentions/mois",
      "3 sources surveillées",
      "Dashboard complet",
      "Alertes email",
      "Rapports hebdomadaires",
    ],
    cta: "S'abonner",
    popular: false,
    planKey: "starter",
  },
  {
    name: "Pro",
    icon: Sparkles,
    price: "25 000",
    period: "FCFA/mois",
    features: [
      "Mentions illimitées",
      "Toutes les sources",
      "Assistant IA avancé",
      "Rapports PDF personnalisés",
      "Alertes temps réel",
      "Analyse concurrentielle",
      "Support prioritaire",
    ],
    cta: "Payer maintenant",
    popular: true,
    planKey: "pro",
  },
  {
    name: "Entreprise",
    icon: Building2,
    price: "Sur devis",
    period: "",
    features: [
      "Tout le plan Pro",
      "API dédiée",
      "SLA garanti 99,9%",
      "Support 24/7",
      "SSO & conformité",
      "Formation personnalisée",
      "Gestionnaire de compte dédié",
    ],
    cta: "Nous contacter",
    popular: false,
    planKey: "enterprise",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  const [subscribing, setSubscribing] = useState<string | null>(null);

  const handleSubscribe = async (plan: typeof plans[0]) => {
    if (plan.planKey === "enterprise") {
      toast.info("Contactez-nous à contact@focus-app.com pour un devis personnalisé");
      return;
    }

    // Save subscription in DB
    if (user) {
      setSubscribing(plan.planKey);
      await supabase.from("subscriptions").upsert({
        user_id: user.id,
        plan: plan.planKey,
        status: "active",
        start_date: new Date().toISOString(),
      }, { onConflict: "user_id" });
      setSubscribing(null);
    }

    // Redirect to Wave payment
    window.open(WAVE_LINK, "_blank");
    toast.success(`Abonnement ${plan.name} activé ! Finalisez le paiement via Wave.`);
  };

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-light tracking-tight">Tarification</h1>
          <p className="text-muted-foreground text-lg">Choisissez le plan adapté à vos besoins</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isEnterprise = plan.name === "Entreprise";

            return (
              <Card
                key={plan.name}
                className={`relative card-hover rounded-2xl overflow-hidden ${
                  plan.popular ? "glass-card glow-pulse border-primary/30 scale-105" : "glass-card"
                }`}
              >
                {plan.popular && <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />}
                {plan.popular && (
                  <Badge className="absolute right-4 top-4 bg-primary text-primary-foreground">Populaire</Badge>
                )}
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-medium">{plan.name}</CardTitle>
                  <div className="mt-4">
                    {!isEnterprise ? (
                      <>
                        <span className="text-4xl font-light">{plan.price}</span>
                        <span className="text-muted-foreground text-sm ml-1">{plan.period}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-light text-muted-foreground">Sur devis</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 pb-8">
                  <ul className="space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm">
                        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <Check className="h-3 w-3 text-primary" />
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full h-11 text-base font-medium rounded-xl ${plan.popular ? "bg-primary hover:bg-primary/90" : ""}`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan)}
                    disabled={subscribing === plan.planKey}
                  >
                    {subscribing === plan.planKey ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Paiement sécurisé via Wave · Annulation possible à tout moment
        </p>
      </div>
    </AnimatedPage>
  );
}
