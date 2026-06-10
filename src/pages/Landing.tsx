import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target, Shield, Zap, TrendingUp, MessageSquare, Bell, BarChart3, Bot,
  ArrowRight, CheckCircle2, ChevronDown, Globe, Users, FileText, Sparkles,
  AlertTriangle, Eye, Brain, Smartphone,
} from "lucide-react";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const principles = [
  { icon: Eye, title: "Surveiller", desc: "Collecte automatique des mentions sur réseaux sociaux et médias web." },
  { icon: Brain, title: "Comprendre", desc: "Analyse IA des sentiments, du ton émotionnel et détection de bad buzz." },
  { icon: AlertTriangle, title: "Anticiper", desc: "Détection des crises d'image en temps réel avec alertes multi-canaux." },
  { icon: Sparkles, title: "Décider", desc: "Recommandations IA, communiqués de crise et plans d'action personnalisés." },
];

const modules = [
  { icon: MessageSquare, title: "Veille digitale", desc: "Mots-clés, hashtags, marques, dirigeants, concurrents — par pays ou zone géographique." },
  { icon: Bot, title: "IA d'analyse", desc: "Sentiment, classification, détection d'influenceurs et de rumeurs, résumés automatiques." },
  { icon: BarChart3, title: "Tableau de bord", desc: "Score d'e-réputation, top hashtags, influenceurs, courbe d'évolution, comparaison concurrentielle." },
  { icon: Bell, title: "Alertes multi-canaux", desc: "Notification mobile, email, SMS, WhatsApp Business — détection de crise instantanée." },
  { icon: Sparkles, title: "Recommandations IA", desc: "Messages de réponse, communiqués de crise, niveau d'urgence, plan de sortie de crise." },
  { icon: FileText, title: "Rapports automatiques", desc: "Quotidien, hebdo, mensuel, concurrentiel, de crise — export PDF, Excel, PowerPoint." },
];

const sources = ["Facebook", "Instagram", "TikTok", "X / Twitter", "LinkedIn", "YouTube", "Sites d'actualité", "Blogs", "Forums", "Commentaires publics"];

const stats = [
  { value: "10+", label: "Sources surveillées" },
  { value: "24/7", label: "Surveillance continue" },
  { value: "<1s", label: "Temps de détection" },
  { value: "IA", label: "Analyse en français" },
];

const plans = [
  { name: "Starter", price: "15 000", features: ["5 sources", "500 mentions/mois", "Alertes email", "Rapports mensuels"] },
  { name: "Pro", price: "25 000", features: ["Toutes les sources", "Mentions illimitées", "Alertes temps réel + WhatsApp", "IA générative", "Veille concurrentielle", "Rapports personnalisés"] },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Focus
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"><Button variant="ghost" size="sm" className="text-sm font-medium">Connexion</Button></Link>
            <Link to="/register"><Button size="sm" className="text-sm font-semibold rounded-full px-5">Commencer</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Plateforme IA — Afrique francophone
            </span>
          </motion.div>
          <motion.h1
            className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Le <span className="text-primary">social listening</span><br />
            qui anticipe les crises
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            Focus automatise la surveillance, l'analyse et le pilotage de votre e-réputation.
            Une intelligence artificielle qui écoute, comprend, alerte — et recommande.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Link to="/register">
              <Button size="lg" className="text-base font-semibold rounded-full px-8 h-12 w-full sm:w-auto">
                Démarrer maintenant <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="#principes">
              <Button size="lg" variant="outline" className="text-base rounded-full px-8 h-12 w-full sm:w-auto">
                Découvrir les principes <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 border-y border-border/40 bg-card/50 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Principes (4 piliers) */}
      <section id="principes" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm uppercase tracking-widest text-primary font-semibold">Nos principes</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Quatre piliers, une mission
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Surveiller votre image. Comprendre l'opinion publique. Anticiper les crises. Décider rapidement grâce à l'IA.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((p, i) => (
              <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/50 bg-card/80 backdrop-blur-sm hover:shadow-xl hover:border-primary/30 transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <p.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="text-xs font-semibold text-primary mb-1">0{i + 1}</div>
                    <h3 className="text-lg font-semibold mb-2">{p.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Objectifs */}
      <section className="py-24 px-6 bg-card/50 border-y border-border/40">
        <div className="max-w-5xl mx-auto">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm uppercase tracking-widest text-primary font-semibold">Objectifs</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Ce que Focus rend possible
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              "Collecter automatiquement les mentions de votre marque",
              "Analyser le sentiment : positif, négatif, neutre",
              "Détecter les crises d'image en temps réel",
              "Générer des recommandations IA contextualisées",
              "Produire des rapports automatiques exportables",
              "Offrir un tableau de bord clair aux dirigeants et CM",
            ].map((obj, i) => (
              <motion.div key={obj} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="flex items-start gap-3 p-4 rounded-2xl bg-background/60 border border-border/50">
                <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <span className="text-sm md:text-base">{obj}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm uppercase tracking-widest text-primary font-semibold">Modules</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Une suite complète
            </h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <motion.div key={m.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/50 hover:shadow-lg hover:border-primary/20 transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <m.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{m.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{m.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="py-20 px-6 bg-card/50 border-y border-border/40">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>
              Sources surveillées
            </h2>
            <p className="text-muted-foreground mb-8">Réseaux sociaux, médias web, blogs et forums.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-2">
            {sources.map((s, i) => (
              <motion.span
                key={s}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
                className="px-4 py-2 rounded-full bg-background border border-border/60 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile + Sécurité */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Card className="h-full border-border/50">
              <CardContent className="p-8">
                <Smartphone className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>Application mobile</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Notifications push instantanées</li>
                  <li>• Consultation du dashboard en mobilité</li>
                  <li>• Validation des réponses IA en un tap</li>
                  <li>• Historique des alertes et rapports</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
            <Card className="h-full border-border/50">
              <CardContent className="p-8">
                <Shield className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>Sécurité</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>• Authentification forte & double facteur</li>
                  <li>• Chiffrement des données & sauvegardes</li>
                  <li>• Gestion fine des rôles et permissions</li>
                  <li>• Journalisation et conformité RGPD</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-6 bg-card/50 border-y border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <h2 className="text-3xl md:text-5xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Tarification simple
            </h2>
            <p className="text-muted-foreground text-lg">Pas de frais cachés. Paiement Wave / Mobile Money.</p>
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
                          <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />{f}
                        </li>
                      ))}
                    </ul>
                    <Link to="/register">
                      <Button className="w-full rounded-full" variant={i === 0 ? "outline" : "default"}>
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
              Prêt à reprendre le contrôle de votre image ?
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Rejoignez les marques qui font confiance à Focus pour leur veille e-réputation.
            </p>
            <Link to="/register">
              <Button size="lg" className="text-base font-semibold rounded-full px-10 h-12">
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
              <Target className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold" style={{ fontFamily: "'Space Grotesk'" }}>Focus</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 Focus — Plateforme IA de social listening</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/login" className="hover:text-foreground transition-colors">Connexion</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Inscription</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
