import { useState, useEffect } from "react";
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
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-80 md:col-span-2 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-64 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <DashboardSkeleton />;

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre e-réputation</p>
        </div>

        {/* Score + Stats */}
        <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {/* Reputation Gauge */}
          <motion.div variants={staggerItem} className="md:col-span-2 lg:col-span-1">
            <Card className="border-primary/20 h-full transition-transform duration-200 hover:scale-[1.02]">
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

          <motion.div variants={staggerItem}>
            <Card className="h-full transition-transform duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-help">
                      <MessageSquare className="h-4 w-4" /> Mentions
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>Nombre total de mentions sur toutes les plateformes</TooltipContent>
                </UITooltip>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMentions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ArrowUp className="h-3 w-3 text-green-500" /> +12% ce mois
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="h-full transition-transform duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-help">
                      <Heart className="h-4 w-4" /> Sentiment
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>Pourcentage moyen de sentiment positif</TooltipContent>
                </UITooltip>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.sentimentAvg}%</div>
                <p className="text-xs text-muted-foreground">positif en moyenne</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="h-full transition-transform duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-help">
                      <Bell className="h-4 w-4" /> Alertes
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>Alertes actives nécessitant une attention</TooltipContent>
                </UITooltip>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeAlerts}</div>
                <p className="text-xs text-destructive flex items-center gap-1">2 critiques</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="h-full transition-transform duration-200 hover:scale-[1.02]">
              <CardHeader className="pb-2">
                <UITooltip>
                  <TooltipTrigger asChild>
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2 cursor-help">
                      <Zap className="h-4 w-4" /> Taux réponse
                    </CardTitle>
                  </TooltipTrigger>
                  <TooltipContent>Pourcentage de mentions ayant reçu une réponse</TooltipContent>
                </UITooltip>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.responseRate}%</div>
                <p className="text-xs text-muted-foreground">objectif : 95%</p>
              </CardContent>
            </Card>
          </motion.div>
        </StaggerContainer>

        {/* Charts */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="md:col-span-2">
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
                      <Area type="monotone" dataKey="positive" stackId="1" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="neutral" stackId="1" stroke="hsl(38, 92%, 50%)" fill="hsl(38, 92%, 50%)" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="negative" stackId="1" stroke="hsl(0, 84%, 60%)" fill="hsl(0, 84%, 60%)" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
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
