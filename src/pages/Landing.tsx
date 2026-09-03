import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import {
  Target, Shield, MessageSquare, Bell, BarChart3, Bot,
  ArrowRight, ArrowUpRight, CheckCircle2, ChevronDown, Globe, FileText, Sparkles,
  AlertTriangle, Eye, Brain, Smartphone, Lock, Scale, Cookie, ShieldCheck,
  Mail, MapPin, Languages,
} from "lucide-react";
import { motion } from "framer-motion";

const SITE_URL = "https://red-app-makers.lovable.app";

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const pillars = [
  { icon: Eye, title: "Écoute", kicker: "Social listening", desc: "Collecte continue des mentions sur les réseaux sociaux, médias, blogs et forums." },
  { icon: Brain, title: "Analyse", kicker: "Sentiment IA", desc: "Sentiment, ton émotionnel, sarcasme et détection des signaux faibles." },
  { icon: AlertTriangle, title: "Alerte", kicker: "Crise réputation", desc: "Détection des crises d'image en temps réel avec alertes multi-canaux." },
  { icon: Sparkles, title: "Décision", kicker: "Insights data", desc: "Recommandations IA, communiqués de crise et plans d'action sur mesure." },
];

const modules = [
  { icon: MessageSquare, title: "Veille digitale", desc: "Mots-clés, hashtags, marques, dirigeants, concurrents — par pays ou zone géographique." },
  { icon: Bot, title: "IA d'analyse", desc: "Sentiment, classification, détection d'influenceurs et de rumeurs, résumés automatiques." },
  { icon: BarChart3, title: "Tableau de bord", desc: "Score d'e-réputation, top hashtags, influenceurs, évolution et comparaison concurrentielle." },
  { icon: Bell, title: "Alertes multi-canaux", desc: "Mobile, email, SMS, WhatsApp Business, Slack, Teams — détection instantanée." },
  { icon: Sparkles, title: "Recommandations IA", desc: "Messages de réponse, communiqués de crise, niveau d'urgence, plan de sortie de crise." },
  { icon: FileText, title: "Rapports exécutifs", desc: "Quotidien, hebdo, mensuel, concurrentiel, de crise — export PDF, Excel, PowerPoint." },
];

const sources = ["Facebook", "Instagram", "TikTok", "X / Twitter", "LinkedIn", "YouTube", "Reddit", "Sites d'actualité", "Blogs", "Forums", "Podcasts", "Avis Google"];

const stats = [
  { value: "10+", label: "Sources surveillées" },
  { value: "24/7", label: "Surveillance continue" },
  { value: "<1s", label: "Temps de détection" },
  { value: "5", label: "Langues d'interface" },
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
  { q: "Puis-je essayer avant de payer ?", a: "Oui, un accès complet est offert dès l'inscription, sans carte bancaire, avec l'ensemble des modules principaux." },
  { q: "Comment se fait le paiement ?", a: "Paiement mensuel en FCFA via Wave ou Mobile Money. Facturation transparente, résiliation à tout moment." },
];

function SectionHead({ kicker, title, lead, align = "left" }: { kicker: string; title: React.ReactNode; lead?: string; align?: "left" | "center" }) {
  return (
    <motion.div
      initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}
    >
      <span className="kicker">{kicker}</span>
      <h2 className="font-display text-3xl md:text-5xl font-semibold mt-4 leading-[1.05]">{title}</h2>
      {lead && <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">{lead}</p>}
      <div className="gold-rule mt-8 w-24" />
    </motion.div>
  );
}

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
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="landing-theme min-h-screen overflow-x-hidden">
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

      {/* ================= Nav ================= */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3" aria-label="Focus — accueil">
            <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display text-lg font-semibold tracking-tight">Focus</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] tracking-wide">
            {[["#piliers", "Méthode"], ["#modules", "Modules"], ["#securite", "Sécurité"], ["#tarifs", "Tarifs"], ["#faq", "FAQ"]].map(([href, label]) => (
              <a key={href} href={href} className="text-muted-foreground hover:text-primary transition-colors">{label}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm" className="text-[13px]">Connexion</Button></Link>
            <Link to="/register"><Button size="sm" className="text-[13px] font-semibold px-5">Commencer</Button></Link>
          </div>
        </div>
      </nav>

      {/* ================= Hero (magazine split) ================= */}
      <header className="relative grain pt-28 pb-16 md:pt-36 md:pb-24 px-5 md:px-8 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-[520px] h-[520px] rounded-full bg-primary/10 blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start relative">
          {/* Editorial column */}
          <div className="lg:col-span-7">
            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0} className="flex items-center gap-3">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              <span className="kicker">Intelligence artificielle & social listening</span>
            </motion.div>

            <motion.h1
              initial="hidden" animate="visible" variants={fadeUp} custom={1}
              className="font-display text-[2.75rem] leading-[0.98] md:text-7xl md:leading-[0.94] font-semibold mt-7"
            >
              Maîtrisez votre influence en <span className="gold-text">Afrique</span> francophone.
            </motion.h1>

            <motion.p
              initial="hidden" animate="visible" variants={fadeUp} custom={2}
              className="mt-7 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl"
            >
              Focus transforme les conversations numériques en insights stratégiques : une plateforme
              d'intelligence multilingue qui écoute, comprend, alerte et recommande.
            </motion.p>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={3} className="mt-9 flex flex-col sm:flex-row gap-3">
              <Link to="/register" className="sm:w-auto w-full">
                <Button size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold">
                  Découvrir la plateforme <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <a href="#piliers" className="sm:w-auto w-full">
                <Button size="lg" variant="outline" className="w-full sm:w-auto h-12 px-8 text-base border-border hover:bg-secondary">
                  Notre méthode <ChevronDown className="ml-2 w-4 h-4" />
                </Button>
              </a>
            </motion.div>

            <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={4} className="mt-8 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Languages className="w-3.5 h-3.5 text-primary" />
              {languages.map(l => (
                <span key={l.label} className="px-2.5 py-1 rounded-sm border border-border/70 bg-card/60">{l.flag} {l.label}</span>
              ))}
            </motion.div>

            {/* Pillars strip */}
            <div id="piliers" className="mt-14 pt-10 border-t border-border/70 grid grid-cols-2 md:grid-cols-4 gap-8">
              {pillars.map((p, i) => (
                <motion.div key={p.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="group">
                  <span className="text-sm font-semibold text-primary">0{i + 1}.</span>
                  <h3 className="font-display font-semibold mt-2 flex items-center gap-1.5">
                    <p.icon className="w-4 h-4 text-primary/80" />{p.title}
                  </h3>
                  <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{p.kicker}</p>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live dashboard mockup */}
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={2} className="lg:col-span-5 relative w-full">
            <div className="relative z-10 rounded-lg overflow-hidden border border-border bg-card shadow-[0_40px_120px_-40px_hsl(44_54%_54%_/_0.25)]">
              <div className="bg-[hsl(0_0%_7%)] px-5 py-3.5 flex items-center justify-between border-b border-border/70">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                  <span className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground tracking-wider">FOCUS / AFRIQUE_OUEST / TEMPS_RÉEL</span>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Sentiment global</p>
                    <h3 className="font-display text-2xl font-semibold mt-1 text-primary">Positif +14 %</h3>
                  </div>
                  <div className="h-12 w-24 flex items-end gap-1 rounded-sm bg-primary/5 p-1">
                    {[50, 66, 100, 78, 88].map((h, i) => (
                      <span key={i} className="flex-1 rounded-sm bg-primary/70" style={{ height: `${h}%`, opacity: 0.45 + i * 0.12 }} />
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { p: "X (Twitter)", t: "Service client réactif, bravo à l'équipe.", tone: "Positif" },
                    { p: "Instagram", t: "Livraison en retard sur Abidjan…", tone: "Négatif" },
                    { p: "Presse en ligne", t: "Nouvelle levée de fonds annoncée.", tone: "Neutre" },
                  ].map(m => (
                    <div key={m.p} className="flex items-start gap-3 rounded-sm border border-border/60 bg-background/60 p-3">
                      <span className="mt-1 h-7 w-7 flex-shrink-0 rounded-sm bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center">
                        {m.p.slice(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{m.p} · {m.tone}</p>
                        <p className="text-sm mt-0.5 truncate">{m.t}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 text-[10px] text-muted-foreground border-t border-border/60">
                  <span>Dernière mise à jour : il y a 2 min</span>
                  <span className="text-primary font-bold tracking-widest">LIVE</span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
          </motion.div>
        </div>
      </header>

      {/* ================= Stats band ================= */}
      <section aria-label="Chiffres clés" className="border-y border-border/70 bg-[hsl(0_0%_8%)]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-12 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-border/60">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i} className="px-4 py-4 md:py-0 text-center">
              <div className="font-display text-3xl md:text-4xl font-semibold gold-text">{s.value}</div>
              <div className="mt-2 text-[11px] uppercase tracking-widest text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ================= Modules ================= */}
      <section id="modules" className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            kicker="Modules"
            title={<>Une suite complète,<br />pensée pour les directions com'.</>}
            lead="De la collecte des mentions à la génération automatique de rapports exécutifs."
          />
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-3 border-t border-l border-border/60">
            {modules.map((m, i) => (
              <motion.article
                key={m.title}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i % 3}
                className="group border-r border-b border-border/60 p-8 hover:bg-secondary/40 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <m.icon className="w-5 h-5 text-primary" />
                  <span className="text-xs font-mono text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="font-display text-lg font-semibold mt-6">{m.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{m.desc}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Editorial quote ================= */}
      <section className="px-5 md:px-8">
        <div className="max-w-4xl mx-auto border-y border-border/70 py-16 text-center">
          <blockquote className="font-display text-2xl md:text-4xl leading-snug font-medium">
            « Focus n'est pas un simple outil de monitoring : c'est l'œil stratégique
            dont toute organisation opérant en Afrique a besoin aujourd'hui. »
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-4">
            <span className="w-12 h-px bg-primary" />
            <span className="kicker">Expertise IA localisée</span>
            <span className="w-12 h-px bg-primary" />
          </div>
        </div>
      </section>

      {/* ================= Sources ================= */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5">
            <SectionHead
              kicker="Couverture"
              title="Sources surveillées"
              lead="Réseaux sociaux, médias web, blogs, forums, podcasts et avis en ligne — filtrables par pays et par secteur d'activité."
            />
            <Globe className="w-8 h-8 text-primary mt-8" />
          </div>
          <div className="lg:col-span-7 flex flex-wrap gap-2">
            {sources.map((s, i) => (
              <motion.span
                key={s}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.35}
                className="px-4 py-2 rounded-sm border border-border/70 bg-card/50 text-sm hover:border-primary/60 hover:text-primary transition-colors"
              >
                {s}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Sécurité ================= */}
      <section id="securite" className="py-20 md:py-28 px-5 md:px-8 bg-[hsl(0_0%_8%)] border-y border-border/70">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            kicker="Sécurité de niveau entreprise"
            title="Vos données, votre propriété."
            lead="Une architecture pensée pour résister aux menaces modernes et conforme aux standards internationaux."
          />
          <div className="mt-14 grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {securityItems.map((s, i) => (
              <motion.div key={s.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <s.icon className="w-5 h-5 text-primary" />
                <h3 className="font-display text-base font-semibold mt-5">{s.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Mobile ================= */}
      <section className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7">
            <SectionHead kicker="Mobilité" title="Pilotez votre réputation depuis votre poche." />
            <ul className="mt-8 space-y-3">
              {["Notifications push instantanées", "Interface responsive optimisée", "Validation des réponses IA en un tap", "Application installable (PWA) iOS & Android"].map(t => (
                <li key={t} className="flex gap-3 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />{t}
                </li>
              ))}
            </ul>
            <Link to="/install" className="inline-flex items-center gap-2 mt-8 text-sm text-primary hover:gap-3 transition-all">
              Installer l'application <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="lg:col-span-5 flex justify-center">
            <div className="w-60 h-[26rem] rounded-[2rem] border border-border bg-card flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-24 bg-primary/10 blur-2xl" />
              <Smartphone className="w-16 h-16 text-primary/50" />
            </div>
          </div>
        </div>
      </section>

      {/* ================= Tarifs ================= */}
      <section id="tarifs" className="py-20 md:py-28 px-5 md:px-8 bg-[hsl(0_0%_8%)] border-y border-border/70">
        <div className="max-w-5xl mx-auto">
          <SectionHead
            kicker="Tarifs"
            title="Une tarification simple."
            lead="Paiement Wave / Mobile Money. Sans engagement, résiliable à tout moment."
            align="center"
          />
          <div className="mt-14 grid md:grid-cols-2 gap-6">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className={`rounded-lg border p-8 bg-card/60 ${plan.featured ? "border-primary/60 shadow-[0_30px_90px_-50px_hsl(44_54%_54%_/_0.5)]" : "border-border/70"}`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                  {plan.featured && <span className="text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-sm bg-primary/15 text-primary font-bold">Populaire</span>}
                </div>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="font-display text-4xl font-semibold">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">FCFA / mois</span>
                </div>
                <div className="gold-rule my-7" />
                <ul className="space-y-3">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block mt-8">
                  <Button className="w-full" variant={plan.featured ? "default" : "outline"}>Choisir {plan.name}</Button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Juridique ================= */}
      <section id="juridique" className="py-20 md:py-28 px-5 md:px-8">
        <div className="max-w-7xl mx-auto">
          <SectionHead
            kicker="Cadre juridique"
            title="Transparence & conformité internationale."
            lead="Focus respecte le RGPD (UE), la loi ivoirienne 2013-450 sur la protection des données à caractère personnel, et s'aligne sur les principes du CCPA (Californie)."
          />
          <div className="mt-14 grid md:grid-cols-3 border-t border-l border-border/60">
            {legalItems.map((item, i) => (
              <motion.div key={item.title} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}>
                <Link to={item.to} className="block h-full border-r border-b border-border/60 p-8 hover:bg-secondary/40 transition-colors">
                  <item.icon className="w-5 h-5 text-primary" />
                  <h3 className="font-display text-lg font-semibold mt-6 flex items-center gap-2">
                    {item.title} <ArrowUpRight className="w-4 h-4 text-primary" />
                  </h3>
                  <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FAQ ================= */}
      <section id="faq" className="py-20 md:py-28 px-5 md:px-8 bg-[hsl(0_0%_8%)] border-y border-border/70">
        <div className="max-w-3xl mx-auto">
          <SectionHead kicker="FAQ" title="Questions fréquentes" align="center" />
          <div className="mt-12 border-t border-border/60">
            {faqs.map((f, i) => (
              <motion.details
                key={f.q}
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                className="group border-b border-border/60 py-6"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-display font-medium list-none">
                  {f.q}
                  <ChevronDown className="w-4 h-4 text-primary flex-shrink-0 transition-transform group-open:rotate-180" />
                </summary>
                <p className="mt-4 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative grain py-24 px-5 md:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="max-w-3xl mx-auto text-center relative">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
            <span className="kicker">Commencer</span>
            <h2 className="font-display text-3xl md:text-5xl font-semibold mt-4 leading-tight">
              Reprenez le contrôle de votre image.
            </h2>
            <p className="mt-5 text-muted-foreground text-lg">
              Rejoignez les marques qui confient leur veille e-réputation à Focus.
            </p>
            <Link to="/register" className="inline-block mt-9">
              <Button size="lg" className="h-12 px-10 text-base font-semibold">
                Créer mon compte <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ================= Footer ================= */}
      <footer className="border-t border-border/70 bg-[hsl(0_0%_7%)]">
        <div className="max-w-7xl mx-auto px-5 md:px-8 py-14 grid md:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-md bg-primary flex items-center justify-center">
                <Target className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-lg font-semibold">Focus</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plateforme IA de social listening et de gestion de l'e-réputation pour l'Afrique francophone.
            </p>
          </div>

          <div>
            <h3 className="kicker">Produit</h3>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li><a href="#modules" className="hover:text-primary transition-colors">Modules</a></li>
              <li><a href="#securite" className="hover:text-primary transition-colors">Sécurité</a></li>
              <li><a href="#tarifs" className="hover:text-primary transition-colors">Tarifs</a></li>
              <li><a href="#faq" className="hover:text-primary transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h3 className="kicker">Compte</h3>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/login" className="hover:text-primary transition-colors">Connexion</Link></li>
              <li><Link to="/register" className="hover:text-primary transition-colors">Inscription</Link></li>
              <li><Link to="/install" className="hover:text-primary transition-colors">Installer l'app</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="kicker">Juridique</h3>
            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Confidentialité (RGPD)</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Conditions d'utilisation</Link></li>
              <li><Link to="/cookies" className="hover:text-primary transition-colors">Politique cookies</Link></li>
            </ul>
            <div className="mt-5 space-y-1.5 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-primary" /> contact@focus-app.com</p>
              <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-primary" /> Abidjan, Côte d'Ivoire</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/70">
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
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
