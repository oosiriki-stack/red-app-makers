import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  AtSign, Shield, Zap, Globe, TrendingUp, MessageSquare, 
  Bell, BarChart3, Bot, ArrowRight, CheckCircle2, ChevronDown 
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }
  })
};

const features = [
  {
    icon: MessageSquare,
    title: "Surveillance en temps réel",
    desc: "Suivez chaque mention de votre marque sur X, Facebook, Instagram, LinkedIn, TikTok, Google et les blogs."
  },
  {
    icon: TrendingUp,
    title: "Analyse de sentiment IA",
    desc: "Notre intelligence artificielle analyse le ton de chaque mention : positif, neutre ou négatif, instantanément."
  },
  {
    icon: Bell,
    title: "Alertes intelligentes",
    desc: "Soyez notifié en temps réel des crises potentielles, pics de mentions négatives ou opportunités virales."
  },
  {
    icon: BarChart3,
    title: "Veille concurrentielle",
    desc: "Comparez votre e-réputation à vos concurrents avec des métriques précises et des rapports détaillés."
  },
  {
    icon: Bot,
    title: "Assistant IA",
    desc: "Générez des réponses adaptées automatiquement grâce à l'IA pour gérer votre image de marque."
  },
  {
    icon: Shield,
    title: "Protection de marque",
    desc: "Détectez les usurpations d'identité, les faux avis et les campagnes de désinformation ciblant votre marque."
  },
];

const stats = [
  { value: "7+", label: "Plateformes surveillées" },
  { value: "24/7", label: "Surveillance continue" },
  { value: "<1s", label: "Temps de détection" },
  { value: "99.9%", label: "Disponibilité" },
];

const plans = [
  { name: "Starter", price: "15 000", features: ["5 plateformes", "500 mentions/mois", "Alertes email", "Rapports mensuels"] },
  { name: "Pro", price: "25 000", features: ["Toutes les plateformes", "Mentions illimitées", "Alertes temps réel", "Assistant IA", "Veille concurrentielle", "Rapports personnalisés"] },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <AtSign className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              @robase
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm" className="text-sm font-medium">
                Connexion
              </Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="text-sm font-semibold rounded-full px-5">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/8 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Propulsé par l'Intelligence Artificielle
            </span>
          </motion.div>
          <motion.h1 
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Maîtrisez votre{" "}
            <span className="text-primary">e-réputation</span>
            <br />en temps réel
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            @robase surveille, analyse et protège votre image de marque sur toutes les plateformes. 
            Détectez les crises avant qu'elles n'éclatent.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <Link to="/register">
              <Button size="lg" className="text-base font-semibold rounded-full px-8 h-13 w-full sm:w-auto">
                Démarrer maintenant <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="text-base rounded-full px-8 h-13 w-full sm:w-auto">
                Découvrir <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="py-12 border-y border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div 
              key={s.label} className="text-center"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Tout ce dont vous avez besoin
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Une suite complète d'outils pour surveiller, analyser et gérer votre réputation en ligne.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div key={f.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <f.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 bg-card/50 border-y border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Comment ça marche
            </h2>
          </motion.div>
          <div className="space-y-12">
            {[
              { step: "01", title: "Créez votre compte", desc: "Inscrivez-vous en 30 secondes et configurez votre marque à surveiller." },
              { step: "02", title: "Choisissez vos plateformes", desc: "Sélectionnez les réseaux sociaux et sources à surveiller : X, Facebook, Instagram, LinkedIn, TikTok, Google, blogs." },
              { step: "03", title: "Recevez vos insights", desc: "L'IA analyse chaque mention en temps réel. Recevez des alertes, rapports et suggestions de réponses automatiquement." },
            ].map((item, i) => (
              <motion.div 
                key={item.step} 
                className="flex gap-6 items-start"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="text-5xl font-bold text-primary/20" style={{ fontFamily: "'Space Grotesk'" }}>{item.step}</div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing preview */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Tarification simple
            </h2>
            <p className="text-muted-foreground text-lg">Pas de frais cachés. Annulez à tout moment.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className={`h-full border-border/50 ${i === 1 ? "ring-2 ring-primary shadow-xl" : ""}`}>
                  <CardContent className="p-8">
                    <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>{plan.price}</span>
                      <span className="text-muted-foreground text-sm">FCFA/mois</span>
                    </div>
                    <ul className="space-y-3 mb-8">
                      {plan.features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/register">
                      <Button className={`w-full rounded-full ${i === 1 ? "" : "variant-outline"}`} variant={i === 0 ? "outline" : "default"}>
                        Choisir {plan.name}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-primary/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Prêt à protéger votre marque ?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Rejoignez les entreprises qui font confiance à @robase pour leur veille e-réputation.
            </p>
            <Link to="/register">
              <Button size="lg" className="text-base font-semibold rounded-full px-10 h-13">
                Commencer maintenant <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border/40">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <AtSign className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold" style={{ fontFamily: "'Space Grotesk'" }}>@robase</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 @robase — Plateforme de veille e-réputation propulsée par l'IA</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">Connexion</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
