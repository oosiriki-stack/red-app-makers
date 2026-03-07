import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Building2 } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";

const WAVE_LINK = "https://pay.wave.com/m/M_ci_mZX836uJEiGE/c/ci/";

const plans = [
  {
    name: "Starter",
    icon: Zap,
    monthlyPrice: "15 000",
    yearlyPrice: "150 000",
    period: "FCFA",
    features: [
      "500 mentions/mois",
      "3 sources surveillées",
      "Dashboard complet",
      "Alertes email",
      "Rapports hebdomadaires",
    ],
    cta: "S'abonner",
    popular: false,
  },
  {
    name: "Pro",
    icon: Sparkles,
    monthlyPrice: "25 000",
    yearlyPrice: "250 000",
    period: "FCFA",
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
  },
  {
    name: "Entreprise",
    icon: Building2,
    monthlyPrice: "Sur devis",
    yearlyPrice: "Sur devis",
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
  },
];

export default function Pricing() {
  const [annual, setAnnual] = useState(true);

  const handleSubscribe = (plan: typeof plans[0]) => {
    if (plan.popular && annual) {
      window.open(WAVE_LINK, "_blank");
    } else if (plan.name === "Entreprise") {
      toast.info("Contactez-nous à contact@arobase.ai pour un devis personnalisé");
    } else {
      toast.info("Pour souscrire, choisissez l'offre annuelle Pro à 5 000 FCFA via Wave");
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <h1 className="text-3xl font-light tracking-tight">Tarification</h1>
          <p className="text-muted-foreground text-lg">Choisissez le plan adapté à vos besoins</p>
        </div>

        {/* Annual promo banner */}
        {annual && (
          <div className="glass-card rounded-2xl p-4 text-center max-w-2xl mx-auto glow-gold-subtle">
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge className="bg-primary text-primary-foreground text-sm px-3 py-1">
                🔥 Économisez 46%
              </Badge>
              <span className="text-sm font-medium">
                Offre annuelle Pro à <strong className="text-primary">5 000 FCFA</strong> seulement !
              </span>
            </div>
          </div>
        )}

        {/* Toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={`text-sm font-medium transition-colors ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
            Mensuel
          </span>
          <button
            onClick={() => setAnnual(!annual)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${annual ? "bg-primary" : "bg-muted"}`}
          >
            <div className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300 ${annual ? "translate-x-7" : "translate-x-0.5"}`} />
          </button>
          <span className={`text-sm font-medium transition-colors ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Annuel
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const price = annual ? plan.yearlyPrice : plan.monthlyPrice;
            const isEnterprise = plan.name === "Entreprise";

            return (
              <Card
                key={plan.name}
                className={`relative card-hover rounded-2xl overflow-hidden ${
                  plan.popular
                    ? "glass-card glow-pulse border-primary/30 scale-105"
                    : "glass-card"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-amber-400" />
                )}
                {plan.popular && (
                  <Badge className="absolute -top-0 right-4 top-4 bg-primary text-primary-foreground">
                    Populaire
                  </Badge>
                )}
                <CardHeader className="text-center pt-8 pb-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-medium">{plan.name}</CardTitle>
                  <div className="mt-4">
                    {!isEnterprise ? (
                      <>
                        <span className="text-4xl font-light">{price}</span>
                        <span className="text-muted-foreground text-sm ml-1">
                          {plan.period}{annual ? "/an" : "/mois"}
                        </span>
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
                    className={`w-full h-11 text-base font-medium rounded-xl ${
                      plan.popular
                        ? "bg-primary hover:bg-primary/90"
                        : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => handleSubscribe(plan)}
                  >
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
