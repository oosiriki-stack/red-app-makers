import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Rocket, Settings2, Bell, BarChart3, ArrowRight, Check } from "lucide-react";

const KEY = "focus_onboarding_tutorial_v1";

const STEPS = [
  {
    icon: Settings2,
    color: "from-primary to-orange-500",
    title: "1. Configurez votre surveillance",
    desc: "Renseignez votre marque, vos mots-clés et sélectionnez les plateformes à suivre.",
    cta: "Configurer",
    to: "/settings?tab=surveillance",
  },
  {
    icon: Bell,
    color: "from-amber-500 to-yellow-500",
    title: "2. Activez vos canaux d'alerte",
    desc: "SMS, WhatsApp, Slack, Teams ou Email — recevez les mentions critiques instantanément.",
    cta: "Activer",
    to: "/settings?tab=notifications",
  },
  {
    icon: BarChart3,
    color: "from-emerald-500 to-teal-500",
    title: "3. Suivez votre score de réputation",
    desc: "Sentiments, langues, influenceurs, concurrents — tout est consolidé en temps réel.",
    cta: "Voir les mentions",
    to: "/mentions",
  },
];

export function OnboardingTutorial() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem(KEY)) setVisible(true);
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;
  const s = STEPS[step];
  const Icon = s.icon;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <Card className="glass-card rounded-2xl border-primary/30 overflow-hidden relative">
          <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${s.color}`} />
          <CardContent className="p-4 md:p-5 relative">
            <div className="flex items-start gap-3">
              <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-lg shrink-0`}>
                <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Rocket className="h-3.5 w-3.5 text-primary" />
                  <span className="text-[10px] uppercase tracking-widest text-primary font-semibold">Prise en main</span>
                </div>
                <h3 className="font-semibold text-sm md:text-base">{s.title}</h3>
                <p className="text-xs md:text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Button size="sm" className="rounded-xl font-semibold" onClick={() => navigate(s.to)}>
                    {s.cta} <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </Button>
                  {step < STEPS.length - 1 ? (
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => setStep(step + 1)}>
                      Étape suivante
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" className="rounded-xl" onClick={dismiss}>
                      <Check className="h-3.5 w-3.5 mr-1" /> Terminer
                    </Button>
                  )}
                  <div className="flex gap-1 ml-auto">
                    {STEPS.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setStep(i)}
                        className={`h-1.5 rounded-full transition-all ${
                          i === step ? "w-6 bg-primary" : "w-1.5 bg-muted-foreground/30"
                        }`}
                        aria-label={`Étape ${i + 1}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <button
                onClick={dismiss}
                className="text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Fermer le tutoriel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
