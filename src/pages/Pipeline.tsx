import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/AnimatedPage";
import { motion } from "framer-motion";
import {
  Radar,
  Database,
  Filter,
  Brain,
  AlertTriangle,
  Lightbulb,
  FileBarChart,
  Repeat,
  Eye,
  Compass,
  ShieldAlert,
  Target,
} from "lucide-react";

const pillars = [
  { key: "watch", title: "Surveiller", desc: "Collecte continue des mentions sur l'ensemble des sources africaines et internationales.", icon: Eye, color: "from-blue-500/20 to-blue-500/5", iconColor: "text-blue-500" },
  { key: "understand", title: "Comprendre", desc: "Analyse de sentiments, émotions secondaires et thématiques en français, anglais et camfranglais.", icon: Compass, color: "from-emerald-500/20 to-emerald-500/5", iconColor: "text-emerald-500" },
  { key: "anticipate", title: "Anticiper", desc: "Détection des signaux faibles et anomalies avant la propagation d'une crise.", icon: ShieldAlert, color: "from-amber-500/20 to-amber-500/5", iconColor: "text-amber-500" },
  { key: "decide", title: "Décider", desc: "Recommandations IA et rapports actionnables pour réduire le temps de réaction à <15 min.", icon: Target, color: "from-primary/20 to-primary/5", iconColor: "text-primary" },
];

const steps = [
  { n: 1, title: "Collecte multi-sources", desc: "Réseaux sociaux, blogs, forums, médias en ligne, groupes Facebook, WhatsApp Business, RSS africains.", icon: Radar },
  { n: 2, title: "Normalisation & stockage", desc: "Nettoyage, déduplication, enrichissement métadonnées (auteur, audience, source).", icon: Database },
  { n: 3, title: "Filtrage contextuel", desc: "Détection de la marque, désambiguïsation, filtrage des bots et faux comptes.", icon: Filter },
  { n: 4, title: "Analyse IA", desc: "Sentiment (positif / neutre / négatif), émotions secondaires (colère, satisfaction, inquiétude, enthousiasme), thématiques.", icon: Brain },
  { n: 5, title: "Détection d'anomalies", desc: "Modèle de détection de pics, ruptures de tendance et signaux faibles de crise.", icon: AlertTriangle },
  { n: 6, title: "Recommandations FOCUS GPT", desc: "Génération d'actions prioritaires et réponses contextualisées par l'IA propriétaire FOCUS.", icon: Lightbulb },
  { n: 7, title: "Reporting & alertes", desc: "Alertes multi-canal (App, Email, SMS, WhatsApp, Slack, Teams) + rapports PDF/PPTX automatiques.", icon: FileBarChart },
  { n: 8, title: "Boucle d'amélioration", desc: "Apprentissage continu à partir des décisions humaines pour affiner sentiments et alertes.", icon: Repeat },
];

export default function Pipeline() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <Badge variant="outline" className="rounded-full text-[10px] mb-2 font-semibold uppercase tracking-wider">Méthodologie FOCUS</Badge>
          <h1 className="text-xl md:text-3xl font-light tracking-tight">Le pipeline FOCUS</h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1 max-w-2xl">
            De la collecte d'une mention à la décision business : 8 étapes orchestrées autour de 4 piliers pour transformer le bruit social en intelligence actionnable.
          </p>
        </div>

        {/* 4 piliers */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.key}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card className={`glass-card rounded-2xl h-full bg-gradient-to-br ${p.color} border-border/40`}>
                  <CardContent className="p-4 md:p-5">
                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl bg-background/60 flex items-center justify-center mb-3`}>
                      <Icon className={`h-4 w-4 md:h-5 md:w-5 ${p.iconColor}`} />
                    </div>
                    <h3 className="font-bold text-sm md:text-base mb-1">{p.title}</h3>
                    <p className="text-[11px] md:text-xs text-muted-foreground leading-relaxed">{p.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* 8 étapes */}
        <div>
          <h2 className="text-base md:text-lg font-semibold mb-3 tracking-tight">Les 8 étapes du pipeline</h2>
          <div className="relative">
            {/* Ligne verticale */}
            <div className="absolute left-4 md:left-5 top-2 bottom-2 w-px bg-gradient-to-b from-primary/40 via-border to-transparent" aria-hidden />
            <div className="space-y-3">
              {steps.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div
                    key={s.n}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="relative flex gap-3 md:gap-4 items-start"
                  >
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-background border-2 border-primary/30 flex items-center justify-center shadow-sm">
                        <Icon className="h-4 w-4 md:h-[18px] md:w-[18px] text-primary" />
                      </div>
                      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary text-primary-foreground text-[9px] md:text-[10px] font-bold flex items-center justify-center">
                        {s.n}
                      </span>
                    </div>
                    <Card className="glass-card rounded-2xl flex-1">
                      <CardContent className="p-3 md:p-4">
                        <h4 className="font-semibold text-sm md:text-base">{s.title}</h4>
                        <p className="text-[11px] md:text-xs text-muted-foreground mt-0.5 leading-relaxed">{s.desc}</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <Card className="glass-card rounded-2xl bg-gradient-to-br from-primary/10 to-transparent">
          <CardContent className="p-4 md:p-5">
            <p className="text-xs md:text-sm font-medium">
              <span className="text-primary font-bold">Objectif FOCUS :</span> réduire le temps de réaction face à une crise à moins de <span className="font-bold">15 minutes</span> grâce à l'automatisation complète du pipeline.
            </p>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
