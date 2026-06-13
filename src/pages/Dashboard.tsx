import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Heart, Bell, RefreshCw, Loader2, Volume2, Activity } from "lucide-react";
import { AnimatedPage, StaggerContainer, staggerItem } from "@/components/AnimatedPage";
import { ReputationGauge } from "@/components/ReputationGauge";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { speak, summarizeMentions } from "@/lib/speech";

export default function Dashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState({ mentions: 0, positivePercent: 0, alerts: 0, brand: "", configured: false });
  const navigate = useNavigate();
  const { user } = useAuth();

  const fetchDashboard = async () => {
    if (!user) return;
    const [mRes, pRes, aRes, sRes] = await Promise.all([
      supabase.from("mentions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mentions").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("sentiment", "positive"),
      supabase.from("alerts").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
      supabase.from("monitoring_settings").select("brand").eq("user_id", user.id).maybeSingle(),
    ]);
    const total = mRes.count ?? 0;
    const positive = pRes.count ?? 0;
    const brand = sRes.data?.brand || "";
    setStats({
      mentions: total,
      positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
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
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">{greeting}</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {stats.brand ? (
                <span className="inline-flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                  Cycle de surveillance activé — {stats.brand}
                </span>
              ) : (
                "Configurez la surveillance pour activer les données"
              )}
            </p>
          </div>
          <div className="flex gap-1.5">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={audioToday}><Volume2 className="h-4 w-4 mr-1" />Écouter</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <StaggerContainer className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <motion.div variants={staggerItem} className="col-span-2 lg:col-span-1">
            <Card className="glass-card hover-3d h-full rounded-2xl">
              <CardHeader className="pb-2"><CardTitle className="text-xs font-medium text-muted-foreground">Score e-Réputation</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center pb-4">
                <ReputationGauge score={reputationScore} size={120} />
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
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.sub}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </StaggerContainer>

        {!stats.configured && (
          <Card className="glass-card rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">Configurez votre surveillance pour activer le score et collecter des mentions.</p>
            <Button className="rounded-xl" onClick={() => navigate("/settings?tab=surveillance")}>Configurer maintenant</Button>
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
