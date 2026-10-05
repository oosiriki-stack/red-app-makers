import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Bell, RefreshCw, Loader2, Volume2, Activity, Clock } from "lucide-react";
import { AnimatedPage, StaggerContainer, staggerItem } from "@/components/AnimatedPage";
import { ReputationGauge } from "@/components/ReputationGauge";
import { QuotaGauge } from "@/components/QuotaGauge";
import { RecentMentions } from "@/components/RecentMentions";
import { OnboardingTutorial } from "@/components/OnboardingTutorial";
import { InviteCollaboratorDialog } from "@/components/InviteCollaboratorDialog";
import { RiskScoreCard } from "@/components/RiskScoreCard";
import { MentionsByLanguageCard } from "@/components/MentionsByLanguageCard";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { speak, summarizeMentions } from "@/lib/speech";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState({ mentions: 0, positive: 0, neutral: 0, negative: 0, positivePercent: 0, neutralPercent: 0, negativePercent: 0, alerts: 0, brand: "", configured: false });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, daysLeft, isTrial, isPaid } = useSubscription();
  const quotaMax = isTrial ? 14 : isPaid ? 30 : 14;
  const quotaLabel = "jours";



  const fetchDashboard = async () => {
    if (!user) return;
    const [mRes, pRes, nuRes, neRes, aRes, sRes] = await Promise.all([
      supabase.from("mentions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mentions").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("sentiment", "positive"),
      supabase.from("mentions").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("sentiment", "neutral"),
      supabase.from("mentions").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("sentiment", "negative"),
      supabase.from("alerts").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
      supabase.from("monitoring_settings").select("brand").eq("user_id", user.id).maybeSingle(),
    ]);
    const total = mRes.count ?? 0;
    const positive = pRes.count ?? 0;
    const neutral = nuRes.count ?? 0;
    const negative = neRes.count ?? 0;
    const brand = sRes.data?.brand || "";
    setStats({
      mentions: total,
      positive, neutral, negative,
      positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
      neutralPercent: total > 0 ? Math.round((neutral / total) * 100) : 0,
      negativePercent: total > 0 ? Math.round((negative / total) * 100) : 0,
      alerts: aRes.count ?? 0,
      brand,
      configured: Boolean(brand),
    });
    if (!brand) setShowOnboarding(true);
  };


  useEffect(() => { fetchDashboard(); }, [user]);

  useRealtimeTable("mentions", user?.id, { onInsert: () => fetchDashboard() });
  useRealtimeTable("alerts", user?.id, { onInsert: () => fetchDashboard(), onUpdate: () => fetchDashboard() });

  const handleRefresh = async () => { setRefreshing(true); await fetchDashboard(); setRefreshing(false); toast.success("Données actualisées"); };

  const [greeting, setGreeting] = useState("Tableau de bord");
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name").eq("id", user.id).single().then(({ data }) => {
      if (data?.name) setGreeting(`Bonjour, ${data.name.split(" ")[0]}`);
    });
  }, [user]);

  // Score 0 par défaut tant que rien n'est configuré ou collecté
  const reputationScore = !stats.configured || stats.mentions === 0
    ? 0
    : Math.round(((stats.positivePercent * 2) + 50) / 2);

  const audioToday = async () => {
    if (!user) return;
    const since = new Date(Date.now() - 24 * 3600e3).toISOString();
    const { data } = await supabase.from("mentions").select("source, sentiment, content").eq("user_id", user.id).gte("mention_date", since).limit(20);
    speak(summarizeMentions((data || []) as any, "aujourd'hui"));
  };

  const statCards = [
    { key: "mentions", label: "Mentions", icon: MessageSquare, value: stats.mentions.toLocaleString(), sub: "total", link: "/mentions" },
    { key: "sentiment", label: "Sentiment", icon: Heart, value: stats.configured && stats.mentions > 0 ? `${stats.positivePercent}%` : "—", sub: "positif", link: "/mentions" },
    { key: "alerts", label: "Alertes", icon: Bell, value: stats.alerts.toString(), sub: "non lues", link: "/alerts" },
  ];

  

  return (
    <AnimatedPage>
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="mb-1 text-[11px] font-bold uppercase text-primary">Tableau de bord</p>
            <h1 className="truncate text-2xl font-bold md:text-3xl">{greeting}</h1>
            <p className="mt-1 text-xs text-muted-foreground md:text-sm">
              {stats.brand ? (
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-green-500 animate-pulse shrink-0" />
                  <span className="truncate">Surveillance active — {stats.brand}</span>
                </span>
              ) : (
                "Configurez la surveillance pour activer les données"
              )}
            </p>
          </div>
          <div className="flex w-full gap-2 sm:w-auto sm:shrink-0">
            <InviteCollaboratorDialog />
            <Button variant="outline" size="sm" className="h-10 flex-1 rounded-xl px-3 font-semibold sm:flex-none" onClick={audioToday}>
              <Volume2 className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Écouter</span>
            </Button>
            <Button variant="outline" size="icon" className="h-10 w-10 shrink-0 rounded-xl" onClick={handleRefresh} disabled={refreshing} aria-label="Actualiser les données">
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <OnboardingTutorial />

        <StaggerContainer className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <motion.div variants={staggerItem} className="col-span-2 lg:col-span-1 lg:row-span-2">
            <Card className="dashboard-card h-full overflow-hidden bg-card text-card-foreground">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-semibold text-muted-foreground">Score e-Réputation</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center pb-4">
                <ReputationGauge score={reputationScore} size={110} />
                {!stats.configured && <p className="mt-2 text-center text-[10px] text-muted-foreground">Configurez la surveillance pour activer</p>}
              </CardContent>
            </Card>
          </motion.div>
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.key} variants={staggerItem}>
                <Card className="dashboard-card h-full cursor-pointer" onClick={() => navigate(stat.link)}>
                  <CardHeader className="p-3 pb-1 sm:p-5 sm:pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent"><Icon className="h-4 w-4 text-primary" /></div>
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-1 sm:p-5 sm:pt-1">
                    <div className="text-2xl font-bold md:text-3xl">{stat.value}</div>
                    <p className="text-[11px] md:text-xs text-muted-foreground">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          <motion.div variants={staggerItem}><RiskScoreCard /></motion.div>
        </StaggerContainer>

        {/* Répartition des sentiments */}
        <Card className="dashboard-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
              <Heart className="h-3.5 w-3.5 text-primary" />
              Répartition des sentiments
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {stats.mentions === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Aucune mention collectée pour le moment.</p>
            ) : (
              <>
                <div className="mb-4 grid grid-cols-3 gap-2 md:gap-3">
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-green-500">{stats.positive}</div>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Positif · {stats.positivePercent}%</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-muted-foreground">{stats.neutral}</div>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Neutre · {stats.neutralPercent}%</p>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-2xl font-bold text-red-500">{stats.negative}</div>
                    <p className="text-[9px] md:text-[10px] text-muted-foreground uppercase tracking-wider">Négatif · {stats.negativePercent}%</p>
                  </div>
                </div>
                <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                  <div className="bg-green-500 transition-all" style={{ width: `${stats.positivePercent}%` }} />
                  <div className="bg-muted-foreground/50 transition-all" style={{ width: `${stats.neutralPercent}%` }} />
                  <div className="bg-red-500 transition-all" style={{ width: `${stats.negativePercent}%` }} />
                </div>
              </>
            )}
          </CardContent>
        </Card>


        <MentionsByLanguageCard />

        <div className="grid items-stretch gap-3 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="dashboard-card h-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="h-3.5 w-3.5 text-primary" /></div>
                  Quota — {plan ?? "—"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center gap-4 lg:flex-col lg:gap-2">
                  <div className="shrink-0 lg:hidden">
                    <QuotaGauge value={daysLeft} max={quotaMax} size={92} label={quotaLabel} />
                  </div>
                  <div className="hidden lg:block">
                    <QuotaGauge value={daysLeft} max={quotaMax} size={130} label={quotaLabel} />
                  </div>
                  <div className="min-w-0 flex-1 lg:w-full">
                    <p className="mb-2 text-[11px] font-medium leading-tight text-muted-foreground lg:hidden">
                      {isTrial ? "Période démo en cours" : "Abonnement actif"}
                    </p>
                    <Button
                      size="sm"
                      variant={isTrial ? "default" : "outline"}
                       className="w-full rounded-xl text-xs font-semibold lg:mt-3 lg:w-auto lg:text-sm"
                      onClick={() => navigate("/pricing")}
                    >
                      {isTrial ? "Activer une licence" : "Gérer mon abonnement"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <RecentMentions />
          </div>
        </div>

        {!stats.configured && (
          <Card className="dashboard-card p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3 font-medium">Configurez votre surveillance pour activer le score et collecter des mentions.</p>
            <Button className="rounded-xl font-semibold" onClick={() => navigate("/settings?tab=surveillance")}>Configurer maintenant</Button>
          </Card>
        )}
      </div>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="rounded-xl border-border/70 bg-card">
          <DialogHeader><DialogTitle>Bienvenue sur Focus 👋</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Pour activer votre score de réputation et commencer à surveiller, configurez le nom de votre marque ou de la personne à suivre.</p>
            <div className="flex gap-2">
              <Button className="flex-1 rounded-xl" onClick={() => { setShowOnboarding(false); navigate("/settings?tab=surveillance"); }}>Configurer</Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setShowOnboarding(false)}>Plus tard</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
