import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MessageSquare, Heart, Bell, RefreshCw, Loader2 } from "lucide-react";
import { AnimatedPage, StaggerContainer, staggerItem } from "@/components/AnimatedPage";
import { ReputationGauge } from "@/components/ReputationGauge";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";

export default function Dashboard() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState({ mentions: 0, positivePercent: 0, alerts: 0, brand: "" });
  const [mentionsData, setMentionsData] = useState<any[]>([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  useNotifications();

  const fetchDashboard = async () => {
    if (!user) return;
    setLoading(true);
    const [mentionsRes, positiveRes, alertsRes, monitoringRes] = await Promise.all([
      supabase.from("mentions").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("mentions").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("sentiment", "positive"),
      supabase.from("alerts").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
      supabase.from("monitoring_settings").select("brand").eq("user_id", user.id).maybeSingle(),
    ]);

    const total = mentionsRes.count ?? 0;
    const positive = positiveRes.count ?? 0;
    const monitoring = monitoringRes.data;

    setStats({
      mentions: total,
      positivePercent: total > 0 ? Math.round((positive / total) * 100) : 0,
      alerts: alertsRes.count ?? 0,
      brand: monitoring?.brand || "",
    });

    // Check onboarding
    if (!monitoring?.brand) setShowOnboarding(true);

    setLoading(false);
  };

  useEffect(() => { fetchDashboard(); }, [user]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboard();
    setRefreshing(false);
    toast.success("Données actualisées");
  };

  // Get profile name
  const [greeting, setGreeting] = useState("Dashboard");
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name").eq("id", user.id).single().then(({ data }) => {
      if (data?.name) setGreeting(`Bonjour, ${data.name.split(" ")[0]}`);
    });
  }, [user]);

  const reputationScore = stats.positivePercent > 0 ? Math.min(stats.positivePercent + 10, 100) : 50;

  const statCards = [
    { key: "mentions", label: "Mentions", icon: MessageSquare, value: stats.mentions.toLocaleString(), sub: "total", link: "/mentions" },
    { key: "sentiment", label: "Sentiment", icon: Heart, value: `${stats.positivePercent}%`, sub: "positif", link: "/mentions" },
    { key: "alerts", label: "Alertes", icon: Bell, value: stats.alerts.toString(), sub: "non lues", link: "/alerts" },
  ];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-light tracking-tight">{greeting}</h1>
            <p className="text-muted-foreground">
              {stats.brand ? `Surveillance de ${stats.brand}` : "Vue d'ensemble de votre e-réputation"}
            </p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRefresh} disabled={refreshing}>
            {refreshing || loading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
            Actualiser
          </Button>
        </div>

        <StaggerContainer className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <motion.div variants={staggerItem} className="col-span-2 lg:col-span-1">
            <Card className="glass-card hover-3d h-full rounded-2xl">
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Score e-Réputation</CardTitle></CardHeader>
              <CardContent className="flex flex-col items-center">
                <ReputationGauge score={reputationScore} size={140} />
              </CardContent>
            </Card>
          </motion.div>
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.key} variants={staggerItem}>
                <Card className="glass-card hover-3d h-full rounded-2xl cursor-pointer" onClick={() => navigate(stat.link)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center"><Icon className="h-4 w-4 text-primary" /></div>
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

        {stats.mentions === 0 && (
          <Card className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground mb-4">Aucune donnée pour le moment. Configurez votre surveillance pour commencer.</p>
            <Button className="rounded-xl" onClick={() => navigate("/settings?tab=surveillance")}>Configurer la surveillance</Button>
          </Card>
        )}
      </div>

      <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
        <DialogContent className="glass-card rounded-2xl">
          <DialogHeader><DialogTitle>Bienvenue sur Focus 👋</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Pour commencer à surveiller votre e-réputation, configurez le nom de votre marque et les plateformes à tracker.</p>
            <div className="flex gap-2">
              <Button className="flex-1 rounded-xl" onClick={() => { setShowOnboarding(false); navigate("/settings?tab=surveillance"); }}>Configurer maintenant</Button>
              <Button variant="outline" className="rounded-xl" onClick={() => setShowOnboarding(false)}>Plus tard</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
