import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mentionsOverTime, stats, reputationScore, trendingKeywords } from "@/data/mockData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import { TrendingUp, TrendingDown, Minus, MessageSquare, Heart, Bell, Zap, ArrowUp } from "lucide-react";
import { AnimatedPage, StaggerContainer, staggerItem } from "@/components/AnimatedPage";
import { ReputationGauge } from "@/components/ReputationGauge";
import { GeoHeatmap } from "@/components/GeoHeatmap";
import { RecentMentions } from "@/components/RecentMentions";
import { Tooltip as UITooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-80 md:col-span-2 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

const statCards = [
  { key: "mentions", label: "Mentions", icon: MessageSquare, value: stats.totalMentions.toLocaleString(), sub: "+12% ce mois", link: "/mentions", positive: true },
  { key: "sentiment", label: "Sentiment", icon: Heart, value: `${stats.sentimentAvg}%`, sub: "positif en moyenne", link: "/mentions", positive: true },
  { key: "alerts", label: "Alertes", icon: Bell, value: stats.activeAlerts.toString(), sub: "2 critiques", link: "/alerts", positive: false },
  { key: "response", label: "Taux réponse", icon: Zap, value: `${stats.responseRate}%`, sub: "objectif : 95%", link: "/ai-assistant", positive: true },
];

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState("Dashboard");
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    const stored = localStorage.getItem("arobase_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.name) {
          const firstName = user.name.split(" ")[0];
          setGreeting(`Bonjour, ${firstName}`);
        }
      } catch {}
    }
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight">{greeting}</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre e-réputation</p>
        </div>

        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Reputation Gauge */}
          <motion.div variants={staggerItem} className="md:col-span-2 lg:col-span-1">
            <Card className="glass-card hover-3d h-full rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Score e-Réputation</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ReputationGauge score={reputationScore} size={140} />
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                  <ArrowUp className="h-3 w-3 text-green-500" /> +3 vs mois dernier
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <motion.div key={stat.key} variants={staggerItem}>
                <Card
                  className="glass-card hover-3d h-full rounded-2xl cursor-pointer"
                  onClick={() => navigate(stat.link)}
                >
                  <CardHeader className="pb-2">
                    <UITooltip>
                      <TooltipTrigger asChild>
                        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-help">
                          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Icon className="h-4 w-4 text-primary" />
                          </div>
                          {stat.label}
                        </CardTitle>
                      </TooltipTrigger>
                      <TooltipContent>{stat.label} sur toutes les plateformes</TooltipContent>
                    </UITooltip>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className={`text-xs flex items-center gap-1 ${stat.positive ? "text-muted-foreground" : "text-destructive"}`}>
                      {stat.positive && <ArrowUp className="h-3 w-3 text-green-500" />}
                      {stat.sub}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </StaggerContainer>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2 glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Évolution des mentions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-2 px-2">
                <div className="min-w-[500px]">
                  <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={mentionsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" />
                      <YAxis className="text-xs" />
                      <Tooltip />
                      <Area type="monotone" dataKey="positive" stackId="1" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="neutral" stackId="1" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.2} />
                      <Area type="monotone" dataKey="negative" stackId="1" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card rounded-2xl">
            <CardHeader>
              <CardTitle className="text-base">Tendances & Mots-clés</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {trendingKeywords.map((kw) => (
                  <div key={kw.word} className="flex items-center justify-between">
                    <span className="text-sm font-medium">{kw.word}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{kw.count}</span>
                      {kw.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                      {kw.trend === "down" && <TrendingDown className="h-3 w-3 text-red-500" />}
                      {kw.trend === "stable" && <Minus className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Heatmap + Recent Mentions */}
        <div className="grid gap-4 md:grid-cols-2">
          <GeoHeatmap />
          <RecentMentions />
        </div>
      </div>
    </AnimatedPage>
  );
}
