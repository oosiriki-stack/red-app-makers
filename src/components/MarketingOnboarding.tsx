import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldCheck, TrendingUp, Eye, ArrowRight, Sparkles } from "lucide-react";

const STORAGE_KEY = "focus_marketing_onboarding_v1";

const SLIDES = [
  {
    icon: Eye,
    kicker: "Visibilité",
    title: "97 % des décisions passent par votre réputation en ligne",
    body: "Avant de vous appeler, on vous Google. Avant d'acheter, on lit les avis. Maîtriser ce que l'on dit de vous n'est plus optionnel — c'est ce qui transforme un prospect en client.",
    color: "from-amber-400 via-amber-500 to-orange-500",
    stat: "97%",
    statLabel: "des clients lisent les avis avant d'acheter",
  },
  {
    icon: ShieldCheck,
    kicker: "Protection",
    title: "Une crise se prépare avant qu'elle n'arrive",
    body: "Un seul commentaire négatif viral peut coûter 22 % de chiffre d'affaires. Focus surveille 24/7 votre marque sur le web, la presse et les réseaux pour vous alerter dès la première étincelle.",
    color: "from-orange-500 via-red-500 to-rose-600",
    stat: "24/7",
    statLabel: "veille automatisée multi-sources",
  },
  {
    icon: TrendingUp,
    kicker: "Croissance",
    title: "Transformez chaque mention en opportunité",
    body: "Réponses IA en 3 tons, rapports PDF professionnels, score e-Réputation en temps réel : passez de la défense à l'attaque. Construisez une image qui vend pendant que vous dormez.",
    color: "from-emerald-400 via-emerald-500 to-teal-600",
    stat: "+38%",
    statLabel: "de conversions avec une e-réputation maîtrisée",
  },
];

export function MarketingOnboarding() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const seen = localStorage.getItem(STORAGE_KEY);
    if (!seen) {
      const t = setTimeout(() => setOpen(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const close = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    setOpen(false);
  };

  const next = () => {
    if (step < SLIDES.length - 1) setStep(step + 1);
    else close();
  };

  const slide = SLIDES[step];
  const Icon = slide.icon;
  const isLast = step === SLIDES.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && close()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl border-0 bg-transparent shadow-2xl">
        <div className="relative bg-background rounded-3xl overflow-hidden">
          {/* Top gradient banner */}
          <div className={`relative h-44 bg-gradient-to-br ${slide.color} overflow-hidden`}>
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, white 0%, transparent 50%)" }} />
            <div className="absolute -bottom-8 -right-8 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-white/90" />
              <span className="text-[10px] tracking-[0.2em] uppercase text-white/90 font-semibold">{slide.kicker}</span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.6, opacity: 0, rotate: 10 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="w-20 h-20 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center shadow-xl">
                  <Icon className="w-10 h-10 text-white" strokeWidth={2} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Content */}
          <div className="p-6 pt-5 space-y-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3 }}
                className="space-y-3"
              >
                <h2 className="text-xl font-semibold leading-tight tracking-tight">{slide.title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{slide.body}</p>

                <div className="flex items-center gap-3 pt-2 rounded-2xl bg-muted/40 p-3">
                  <div className={`text-2xl font-bold bg-gradient-to-br ${slide.color} bg-clip-text text-transparent`}>
                    {slide.stat}
                  </div>
                  <p className="text-xs text-muted-foreground flex-1">{slide.statLabel}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 pt-2">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all ${i === step ? "w-8 bg-primary" : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"}`}
                  aria-label={`Aller à la slide ${i + 1}`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-1">
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={close}>
                Passer
              </Button>
              <Button onClick={next} className="rounded-xl gap-2 px-5">
                {isLast ? "Commencer" : "Suivant"}
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
