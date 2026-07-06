import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Target, Shield, Zap, MessageSquare, Bell, BarChart3, Bot,
  ArrowRight, CheckCircle2, ChevronDown, Globe, FileText, Sparkles,
  AlertTriangle, Eye, Brain, Smartphone, Lock, Scale, Cookie, ShieldCheck,
  Mail, MapPin, Languages,
} from "lucide-react";
import { motion } from "framer-motion";

const SITE_URL = "https://red-app-makers.lovable.app";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }
  })
};

const principles = [
  { icon: Eye, title: "Surveiller", desc: "Collecte automatique des mentions sur les réseaux sociaux, médias, blogs et forums." },
  { icon: Brain, title: "Comprendre", desc: "Analyse IA du sentiment, du ton émotionnel et détection des signaux faibles." },
  { icon: AlertTriangle, title: "Anticiper", desc: "Détection des crises d'image en temps réel avec alertes multi-canaux." },
  { icon: Sparkles, title: "Décider", desc: "Recommandations IA, communiqués de crise et plans d'action personnalisés." },
];

const modules = [
  { icon: MessageSquare, title: "Veille digitale", desc: "Mots-clés, hashtags, marques, dirigeants, concurrents — par pays ou zone géographique." },
  { icon: Bot, title: "IA d'analyse", desc: "Sentiment, classification, détection d'influenceurs et de rumeurs, résumés automatiques." },
  { icon: BarChart3, title: "Tableau de bord", desc: "Score d'e-réputation, top hashtags, influenceurs, évolution et comparaison concurrentielle." },
  { icon: Bell, title: "Alertes multi-canaux", desc: "Notifications mobile, email, SMS, WhatsApp Business, Slack, Teams — détection instantanée." },
  { icon: Sparkles, title: "Recommandations IA", desc: "Messages de réponse, communiqués de crise, niveau d'urgence, plan de sortie de crise." },
  { icon: FileText, title: "Rapports automatiques", desc: "Quotidien, hebdo, mensuel, concurrentiel, de crise — export PDF, Excel, PowerPoint." },
];

const sources = ["Facebook", "Instagram", "TikTok", "X / Twitter", "LinkedIn", "YouTube", "Reddit", "Sites d'actualité", "Blogs", "Forums", "Podcasts", "Avis Google"];

const stats = [
  { value: "10+", label: "Sources surveillées" },
  { value: "24/7", label: "Surveillance continue" },
  { value: "<1s", label: "Temps de détection" },
  { value: "5", label: "Langues supportées" },
];

const languages = [
  { flag: "🇫🇷", label: "Français" },
  { flag: "🇬🇧", label: "English" },
  { flag: "🇸🇳", label: "Wolof" },
  { flag: "🇲🇱", label: "Bambara" },
  { flag: "🇨🇩", label: "Lingala" },
];

const plans = [
  { name: "Starter", price: "15 000", features: ["5 sources", "500 mentions/mois", "Alertes email", "Rapports mensuels"] },
  { name: "Pro", price: "25 000", features: ["Toutes les sources", "Mentions illimitées", "Alertes temps réel + WhatsApp", "IA générative", "Veille concurrentielle", "Rapports personnalisés"], featured: true },
];

const securityItems = [
  { icon: Lock, title: "Chiffrement bout-en-bout", desc: "TLS 1.3 en transit, AES-256 au repos, sauvegardes chiffrées." },
  { icon: ShieldCheck, title: "Authentification forte", desc: "MFA, SSO, rotation des jetons, politique de mots de passe stricte." },
  { icon: Shield, title: "Isolation des données", desc: "Row-Level Security PostgreSQL, séparation stricte par organisation." },
  { icon: Eye, title: "Audit & journalisation", desc: "Traçabilité complète des accès administrateurs et actions sensibles." },
];

const legalItems = [
  { icon: Scale, title: "Conformité RGPD", desc: "Droit d'accès, rectification, portabilité et effacement. DPO joignable.", to: "/privacy" },
  { icon: FileText, title: "Conditions générales", desc: "CGU claires, obligations mutuelles, propriété intellectuelle, résiliation.", to: "/terms" },
  { icon: Cookie, title: "Politique cookies", desc: "Aucun traceur publicitaire. Cookies essentiels uniquement, choix modifiable.", to: "/cookies" },
];

const faqs = [
  { q: "Focus est-il conforme au RGPD ?", a: "Oui. Nous appliquons le RGPD européen, la loi ivoirienne 2013-450 et les meilleures pratiques CCPA. Les données sont hébergées sur infrastructure certifiée, chiffrées, et vous conservez la maîtrise complète de leur suppression." },
  { q: "Quelles sources sont surveillées ?", a: "Réseaux sociaux (Facebook, Instagram, TikTok, X, LinkedIn, YouTube, Reddit), sites d'actualité, blogs, forums, podcasts et avis en ligne — par pays ou zone géographique." },
  { q: "Puis-je essayer avant de payer ?", a: "Oui, un mode démo de 14 jours est disponible dès l'inscription, sans carte bancaire, avec accès aux principales fonctionnalités." },
  { q: "Comment se fait le paiement ?", a: "Paiement mensuel en FCFA via Wave ou Mobile Money. Facturation transparente, résiliation à tout moment." },
];

export default function Landing() {
  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Focus",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web, iOS, Android",
    description: "Plateforme IA de social listening et de gestion de l'e-réputation pour l'Afrique francophone.",
    offers: [
      { "@type": "Offer", name: "Starter", price: "15000", priceCurrency: "XOF" },
      { "@type": "Offer", name: "Pro", price: "25000", priceCurrency: "XOF" },
    ],
    inLanguage: ["fr", "en", "wo", "bm", "ln"],
  };
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(f => ({
      "@type": "Question", name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a }
    })),
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <Helmet>
        <html lang="fr" />
        <title>Focus — Social listening & e-réputation IA pour l'Afrique francophone</title>
        <meta name="description" content="Focus surveille, analyse et pilote votre e-réputation en temps réel. IA multilingue (FR, EN, Wolof, Bambara, Lingala), alertes de crise, rapports automatisés. Conforme RGPD." />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:site_name" content="Focus" />
        <meta property="og:title" content="Focus — Social listening & e-réputation IA" />
        <meta property="og:description" content="Surveillance IA multilingue, détection de crise et rapports automatisés. Conforme RGPD." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:locale" content="fr_FR" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Focus — Social listening & e-réputation IA" />
        <meta name="twitter:description" content="Surveillez, analysez et pilotez votre e-réputation grâce à l'IA multilingue." />
        <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
      </Helmet>

      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border/40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Focus — accueil">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Focus
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <a href="#modules" className="text-muted-foreground hover:text-foreground transition-colors">Modules</a>
            <a href="#securite" className="text-muted-foreground hover:text-foreground transition-colors">Sécurité</a>
            <a href="#tarifs" className="text-muted-foreground hover:text-foreground transition-colors">Tarifs</a>
            <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm" className="text-sm font-medium">Connexion</Button></Link>
            <Link to="/register"><Button size="sm" className="text-sm font-semibold rounded-full px-5">Commencer</Button></Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="pt-32 pb-20 px-6 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Zap className="w-3.5 h-3.5" /> Plateforme IA multilingue — Afrique francophone
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
            Une IA qui écoute en 5 langues, comprend, alerte — et recommande.
          </motion.p>
          <motion.div className="flex flex-col sm:flex-row gap-4 justify-center" initial="hidden" animate="visible" variants={fadeUp} custom={3}>
            <Link to="/register">
              <Button size="lg" className="text-base font-semibold rounded-full px-8 h-12 w-full sm:w-auto">
                Démarrer l'essai gratuit <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="#principes">
              <Button size="lg" variant="outline" className="text-base rounded-full px-8 h-12 w-full sm:w-auto">
                Voir comment ça marche <ChevronDown className="ml-2 w-4 h-4" />
              </Button>
            </a>
          </motion.div>
          <motion.div
            className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-muted-foreground"
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
          >
            <Languages className="w-3.5 h-3.5" />
            {languages.map(l => (
              <span key={l.label} className="px-2.5 py-1 rounded-full bg-card border border-border/50">
                {l.flag} {l.label}
              </span>
            ))}
          </motion.div>
        </div>
      </header>

      {/* Stats */}
      <section className="py-12 border-y border-border/40 bg-card/50 backdrop-blur-sm" aria-label="Chiffres clés">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div key={s.label} className="text-center" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
              <div className="text-3xl md:text-4xl font-bold text-primary mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Principes */}
      <section id="principes" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm uppercase tracking-widest text-primary font-semibold">Notre méthode</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Quatre piliers, une mission
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Surveiller votre image. Comprendre l'opinion. Anticiper les crises. Décider grâce à l'IA.
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

      {/* Modules */}
      <section id="modules" className="py-24 px-6 bg-card/50 border-y border-border/40">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm uppercase tracking-widest text-primary font-semibold">Modules</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Une suite complète
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              De la collecte des mentions à la génération automatique de rapports exécutifs.
            </p>
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
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="text-2xl md:text-4xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>
              Sources surveillées
            </h2>
            <p className="text-muted-foreground mb-8">Réseaux sociaux, médias web, blogs, forums et avis en ligne.</p>
          </motion.div>
          <div className="flex flex-wrap justify-center gap-2">
            {sources.map((s, i) => (
              <motion.span
                key={s}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
                className="px-4 py-2 rounded-full bg-card border border-border/60 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* Sécurité */}
      <section id="securite" className="py-24 px-6 bg-card/50 border-y border-border/40">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm uppercase tracking-widest text-primary font-semibold">Sécurité de niveau entreprise</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Vos données, votre propriété
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Une architecture pensée pour résister aux menaces modernes et conforme aux standards internationaux.
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {securityItems.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className="h-full border-border/50">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                      <s.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{s.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Mobile */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <Card className="border-border/50 overflow-hidden">
              <CardContent className="p-10 md:p-14 grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <Smartphone className="w-10 h-10 text-primary mb-4" />
                  <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
                    Piloter votre réputation depuis votre mobile
                  </h2>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Notifications push instantanées</li>
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Dashboard responsive optimisé</li>
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Validation des réponses IA en un tap</li>
                    <li className="flex gap-2"><CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />Application PWA installable</li>
                  </ul>
                </div>
                <div className="flex justify-center">
                  <div className="w-64 h-96 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center backdrop-blur-sm">
                    <Target className="w-24 h-24 text-primary/60" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Tarifs */}
      <section id="tarifs" className="py-24 px-6 bg-card/50 border-y border-border/40">
        <div className="max-w-4xl mx-auto">
          <motion.div className="text-center mb-16" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm uppercase tracking-widest text-primary font-semibold">Tarifs</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Une tarification simple
            </h2>
            <p className="text-muted-foreground text-lg">Paiement Wave / Mobile Money. Sans engagement. 14 jours d'essai gratuit.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {plans.map((plan, i) => (
              <motion.div key={plan.name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Card className={`h-full border-border/50 ${plan.featured ? "ring-2 ring-primary shadow-xl" : ""}`}>
                  <CardContent className="p-8">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-semibold">{plan.name}</h3>
                      {plan.featured && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">Populaire</span>}
                    </div>
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
                      <Button className="w-full rounded-full" variant={plan.featured ? "default" : "outline"}>
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

      {/* Cadre juridique */}
      <section id="juridique" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div className="text-center mb-14" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm uppercase tracking-widest text-primary font-semibold">Cadre juridique</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Transparence & conformité internationale
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Focus respecte le RGPD (UE), la loi ivoirienne 2013-450 sur la protection des données à caractère personnel, et s'aligne sur les principes du CCPA (Californie).
            </p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {legalItems.map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Link to={item.to}>
                  <Card className="h-full border-border/50 hover:border-primary/40 hover:shadow-lg transition-all">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                        <item.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                        {item.title} <ArrowRight className="w-4 h-4 text-primary" />
                      </h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 px-6 bg-card/50 border-y border-border/40">
        <div className="max-w-3xl mx-auto">
          <motion.div className="text-center mb-12" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="text-sm uppercase tracking-widest text-primary font-semibold">FAQ</span>
            <h2 className="text-3xl md:text-5xl font-bold mt-3 mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
              Questions fréquentes
            </h2>
          </motion.div>
          <div className="space-y-4">
            {faqs.map((f, i) => (
              <motion.details
                key={f.q}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="group rounded-2xl border border-border/50 bg-background/60 p-6 hover:border-primary/30 transition-colors"
              >
                <summary className="flex cursor-pointer items-center justify-between font-semibold text-base list-none">
                  {f.q}
                  <ChevronDown className="w-5 h-5 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </motion.details>
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
                Commencer gratuitement <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="max-w-6xl mx-auto px-6 py-14 grid md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk'" }}>Focus</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plateforme IA de social listening et de gestion de l'e-réputation pour l'Afrique francophone.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Produit</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#modules" className="hover:text-foreground transition-colors">Modules</a></li>
              <li><a href="#securite" className="hover:text-foreground transition-colors">Sécurité</a></li>
              <li><a href="#tarifs" className="hover:text-foreground transition-colors">Tarifs</a></li>
              <li><a href="#faq" className="hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Compte</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-foreground transition-colors">Connexion</Link></li>
              <li><Link to="/register" className="hover:text-foreground transition-colors">Inscription</Link></li>
              <li><Link to="/install" className="hover:text-foreground transition-colors">Installer l'app</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-4">Juridique</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Confidentialité (RGPD)</Link></li>
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/cookies" className="hover:text-foreground transition-colors">Politique cookies</Link></li>
            </ul>
            <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> contact@focus-app.com</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> Abidjan, Côte d'Ivoire</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Focus — Tous droits réservés.</p>
            <p className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-primary" />
              Conforme RGPD · Loi ivoirienne 2013-450 · CCPA
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
