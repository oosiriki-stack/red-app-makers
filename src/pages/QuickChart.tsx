import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, PieChart as PieIcon, TrendingUp, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SENT_COLORS = { positive: "hsl(142, 71%, 45%)", neutral: "hsl(45, 93%, 47%)", negative: "hsl(0, 84%, 60%)" };
const PLATFORM_COLORS = ["#E5A100", "#FF7900", "#3B82F6", "#10B981", "#EF4444", "#8B5CF6", "#EC4899"];

export default function QuickChart() {
  const { user } = useAuth();
  const [mentions, setMentions] = useState<any[]>([]);
  const [period, setPeriod] = useState("30");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      const since = new Date(); since.setDate(since.getDate() - parseInt(period));
      const { data } = await supabase.from("mentions").select("source,sentiment,engagement,mention_date").eq("user_id", user.id).gte("mention_date", since.toISOString()).limit(2000);
      setMentions(data || []);
      setLoading(false);
    })();
  }, [user, period]);

  const timeline = useMemo(() => {
    const map = new Map<string, { date: string; positive: number; neutral: number; negative: number; total: number }>();
    for (const m of mentions) {
      const d = new Date(m.mention_date).toISOString().slice(0, 10);
      const cur = map.get(d) || { date: d, positive: 0, neutral: 0, negative: 0, total: 0 };
      cur[m.sentiment as "positive" | "neutral" | "negative"] += 1;
      cur.total += 1;
      map.set(d, cur);
    }
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [mentions]);

  const sentimentData = useMemo(() => {
    const c = { positive: 0, neutral: 0, negative: 0 };
    for (const m of mentions) c[m.sentiment as "positive" | "neutral" | "negative"] += 1;
    return [
      { name: "Positif", value: c.positive, color: SENT_COLORS.positive },
      { name: "Neutre", value: c.neutral, color: SENT_COLORS.neutral },
      { name: "Négatif", value: c.negative, color: SENT_COLORS.negative },
    ];
  }, [mentions]);

  const platformData = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of mentions) m.set(x.source, (m.get(x.source) || 0) + 1);
    return Array.from(m.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count);
  }, [mentions]);

  const engagementData = useMemo(() => {
    const m = new Map<string, { source: string; engagement: number }>();
    for (const x of mentions) {
      const cur = m.get(x.source) || { source: x.source, engagement: 0 };
      cur.engagement += x.engagement || 0;
      m.set(x.source, cur);
    }
    return Array.from(m.values()).sort((a, b) => b.engagement - a.engagement);
  }, [mentions]);

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-6xl mx-auto pb-24">
      <header>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Graphiques rapides</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">Vue d'ensemble visuelle de vos mentions sur la période choisie.</p>
      </header>

      <Card className="glass-card p-2.5 sm:p-3 flex flex-wrap items-center gap-2 sm:gap-3">
        <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-36 sm:w-44 h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto text-xs sm:text-sm text-muted-foreground tabular-nums">{mentions.length.toLocaleString("fr-FR")} mention{mentions.length > 1 ? "s" : ""}</div>
      </Card>

      {loading ? (
        <Card className="glass-card p-10 text-center text-muted-foreground">Chargement des données...</Card>
      ) : (
        <Tabs defaultValue="timeline">
          <TabsList className="glass-card w-full overflow-x-auto flex sm:grid sm:grid-cols-4 gap-1 p-1 h-auto">
            <TabsTrigger value="timeline" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap flex-1"><TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /><span className="hidden xs:inline sm:inline">Évolution</span></TabsTrigger>
            <TabsTrigger value="sentiment" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap flex-1"><PieIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Sentiment</TabsTrigger>
            <TabsTrigger value="platforms" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap flex-1"><BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Plateformes</TabsTrigger>
            <TabsTrigger value="engagement" className="gap-1.5 text-xs sm:text-sm whitespace-nowrap flex-1"><BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline">
            <Card className="glass-card p-3 sm:p-5">
              <h3 className="font-bold mb-4">Évolution des mentions par sentiment</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={timeline}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="positive" name="Positif" stroke={SENT_COLORS.positive} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="neutral" name="Neutre" stroke={SENT_COLORS.neutral} strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="negative" name="Négatif" stroke={SENT_COLORS.negative} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="sentiment">
            <Card className="glass-card p-3 sm:p-5">
              <h3 className="font-bold mb-4">Répartition des sentiments</h3>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={sentimentData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} label={(e: any) => `${e.name}: ${e.value}`}>
                    {sentimentData.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 mt-2">
                {sentimentData.map((d) => (
                  <div key={d.name} className="rounded-xl p-3 text-center" style={{ background: `${d.color}15`, border: `1px solid ${d.color}40` }}>
                    <div className="text-2xl font-bold" style={{ color: d.color }}>{d.value}</div>
                    <div className="text-xs text-muted-foreground">{d.name}</div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="platforms">
            <Card className="glass-card p-3 sm:p-5">
              <h3 className="font-bold mb-4">Mentions par plateforme</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={platformData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="source" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {platformData.map((_, i) => <Cell key={i} fill={PLATFORM_COLORS[i % PLATFORM_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card className="glass-card p-3 sm:p-5">
              <h3 className="font-bold mb-4">Engagement total par plateforme</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={engagementData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis dataKey="source" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={80} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                  <Bar dataKey="engagement" radius={[0, 8, 8, 0]}>
                    {engagementData.map((_, i) => <Cell key={i} fill={PLATFORM_COLORS[i % PLATFORM_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </motion.div>
  );
}
