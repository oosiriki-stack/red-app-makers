import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Bell, RefreshCw, Loader2, Volume2, Activity, Clock } from "lucide-react";
import { AnimatedPage, StaggerContainer, staggerItem } from "@/components/AnimatedPage";
import { ReputationGauge } from "@/components/ReputationGauge";
import { QuotaGauge } from "@/components/QuotaGauge";
import { RecentMentions } from "@/components/RecentMentions";
import { InviteCollaboratorDialog } from "@/components/InviteCollaboratorDialog";
import { RiskScoreCard } from "@/components/RiskScoreCard";
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
  const quotaLabel = isTrial ? "jours démo" : isPaid ? "jours actifs" : "jours";



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
      <div className="space-y-4 md:space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-3xl font-light tracking-tight truncate">{greeting}</h1>
            <p className="text-[11px] md:text-sm text-muted-foreground mt-0.5">
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
          <div className="flex gap-1.5 shrink-0">
            <InviteCollaboratorDialog />
            <Button variant="outline" size="sm" className="rounded-xl font-semibold px-2 md:px-3" onClick={audioToday}>
              <Volume2 className="h-4 w-4 md:mr-1" />
              <span className="hidden md:inline">Écouter</span>
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl px-2 md:px-3" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <StaggerContainer className="grid gap-2.5 md:gap-3 grid-cols-2 lg:grid-cols-4">
          <motion.div variants={staggerItem} className="col-span-2 lg:col-span-1">
            <Card className="glass-card hover-3d h-full rounded-2xl">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Score e-Réputation</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center pb-4">
                <ReputationGauge score={reputationScore} size={110} />
                {!stats.configured && <p className="text-[10px] text-muted-foreground mt-2 text-center">Configurez la surveillance pour activer</p>}
              </CardContent>
            </Card>
          </motion.div>
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.key} variants={staggerItem}>
                <Card className="glass-card hover-3d h-full rounded-2xl cursor-pointer" onClick={() => navigate(stat.link)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="h-3.5 w-3.5 text-primary" /></div>
                      {stat.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl md:text-2xl font-bold">{stat.value}</div>
                    <p className="text-[11px] md:text-xs text-muted-foreground">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
          <motion.div variants={staggerItem}><RiskScoreCard /></motion.div>
        </StaggerContainer>

        {/* Répartition des sentiments */}
        <Card className="glass-card rounded-2xl">
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
                <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
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


        <div className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="glass-card hover-3d h-full rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center"><Clock className="h-3.5 w-3.5 text-primary" /></div>
                  Quota — {plan ?? "—"}
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                {/* Mobile: gauge à gauche, infos à droite. Desktop: centré */}
                <div className="flex md:flex-col items-center md:items-center gap-3 md:gap-2">
                  <div className="shrink-0 md:hidden">
                    <QuotaGauge value={daysLeft} max={quotaMax} size={92} label={quotaLabel} />
                  </div>
                  <div className="hidden md:block">
                    <QuotaGauge value={daysLeft} max={quotaMax} size={130} label={quotaLabel} />
                  </div>
                  <div className="flex-1 min-w-0 md:w-full">
                    <p className="md:hidden text-[11px] text-muted-foreground font-medium mb-2 leading-tight">
                      {isTrial ? "Période démo en cours" : "Abonnement actif"}
                    </p>
                    <Button
                      size="sm"
                      variant={isTrial ? "default" : "outline"}
                      className="rounded-xl md:mt-3 font-semibold w-full md:w-auto text-xs md:text-sm"
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
          <Card className="glass-card rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3 font-medium">Configurez votre surveillance pour activer le score et collecter des mentions.</p>
            <Button className="rounded-xl font-semibold" onClick={() => navigate("/settings?tab=surveillance")}>Configurer maintenant</Button>
          </Card>
        )}
      </div>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="glass-card rounded-2xl">
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
