import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";

const plans = [
  {
    name: "Gratuit",
    price: "0€",
    period: "/mois",
    features: ["100 mentions/mois", "1 source surveillée", "Dashboard basique", "Alertes email"],
    cta: "Commencer",
    popular: false,
  },
  {
    name: "Pro",
    price: "79€",
    period: "/mois",
    features: ["5 000 mentions/mois", "Toutes les sources", "Assistant IA", "Rapports PDF", "Alertes temps réel", "Analyse concurrentielle"],
    cta: "Essai gratuit",
    popular: true,
  },
  {
    name: "Entreprise",
    price: "Sur devis",
    period: "",
    features: ["Mentions illimitées", "API dédiée", "SLA garanti", "Support prioritaire 24/7", "SSO & conformité", "Formation personnalisée"],
    cta: "Contacter",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Tarification</h1>
          <p className="text-muted-foreground">Choisissez le plan adapté à vos besoins</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.name} className={`relative ${plan.popular ? "border-primary ring-2 ring-primary/20" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Populaire</Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" /> {f}
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}
