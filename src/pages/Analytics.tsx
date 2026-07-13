import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/AnimatedPage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Cell,
} from "recharts";
import { Loader2, Users2, TrendingDown, TrendingUp, Layers } from "lucide-react";

type Mention = { sentiment: string; mention_date: string; source: string };

function isoWeek(d: Date): string {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const day = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  const wk = Math.ceil((((t.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${t.getUTCFullYear()}-W${String(wk).padStart(2, "0")}`;
}

function weekStart(d: Date): Date {
  const t = new Date(d);
  const day = t.getDay() || 7;
  t.setDate(t.getDate() - (day - 1));
  t.setHours(0, 0, 0, 0);
  return t;
}

export default function Analytics() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [sector, setSector] = useState<string>("");
  const [benchmark, setBenchmark] = useState<any>(null);
  const [benchLoading, setBenchLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const since = new Date(Date.now() - 90 * 86400e3).toISOString();
      const [{ data: m }, { data: s }] = await Promise.all([
        supabase.from("mentions").select("sentiment, mention_date, source")
          .eq("user_id", user.id).gte("mention_date", since).order("mention_date", { ascending: true }),
        supabase.from("monitoring_settings").select("sector").eq("user_id", user.id).maybeSingle(),
      ]);
      setMentions((m || []) as Mention[]);
      setSector(s?.sector || "");
      setLoading(false);

      if (s?.sector) {
        setBenchLoading(true);
        const { data: bench } = await supabase.rpc("sector_benchmarks", { _sector: s.sector });
        setBenchmark(bench?.[0] || null);
        setBenchLoading(false);
      } else {
        setBenchLoading(false);
      }
    })();
  }, [user]);

  // === Cohortes : source x semaine relative depuis la 1re mention par source ===
  const cohortData = useMemo(() => {
    if (!mentions.length) return { rows: [], sources: [], weeks: [] as string[] };
    const bySource: Record<string, Date[]> = {};
    for (const m of mentions) {
      (bySource[m.source] ||= []).push(new Date(m.mention_date));
    }
    const rows: any[] = [];
    const weeks = ["W0", "W1", "W2", "W3", "W4", "W5", "W6", "W7"];
    for (const [source, dates] of Object.entries(bySource)) {
      dates.sort((a, b) => a.getTime() - b.getTime());
      const start = weekStart(dates[0]);
      const buckets: Record<string, number> = Object.fromEntries(weeks.map(w => [w, 0]));
      for (const d of dates) {
        const diff = Math.floor((weekStart(d).getTime() - start.getTime()) / (7 * 86400e3));
        if (diff >= 0 && diff < weeks.length) buckets[`W${diff}`]++;
      }
      rows.push({ source, ...buckets, total: dates.length });
    }
    return { rows, sources: Object.keys(bySource), weeks };
  }, [mentions]);

  // === Rétention sentiment : % positif / semaine ===
  const retentionData = useMemo(() => {
    if (!mentions.length) return [];
    const perWeek: Record<string, { pos: number; neg: number; neu: number; total: number }> = {};
    for (const m of mentions) {
      const w = isoWeek(new Date(m.mention_date));
      const b = (perWeek[w] ||= { pos: 0, neg: 0, neu: 0, total: 0 });
      b.total++;
      if (m.sentiment === "positive") b.pos++;
      else if (m.sentiment === "negative") b.neg++;
      else b.neu++;
    }
    return Object.entries(perWeek)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([week, v]) => ({
        week,
        positif: Math.round((v.pos / v.total) * 100),
        negatif: Math.round((v.neg / v.total) * 100),
        neutre: Math.round((v.neu / v.total) * 100),
      }));
  }, [mentions]);

  // === Bench (moi vs secteur) ===
  const myStats = useMemo(() => {
    const since = Date.now() - 30 * 86400e3;
    const recent = mentions.filter(m => new Date(m.mention_date).getTime() >= since);
    const total = recent.length;
    const pos = recent.filter(m => m.sentiment === "positive").length;
    const neg = recent.filter(m => m.sentiment === "negative").length;
    return {
      total,
      positive_pct: total ? Math.round((pos / total) * 100) : 0,
      negative_pct: total ? Math.round((neg / total) * 100) : 0,
    };
  }, [mentions]);

  const benchChart = useMemo(() => {
    if (!benchmark) return [];
    return [
      { metric: "Volume", moi: myStats.total, secteur: Number(benchmark.avg_per_user) || 0 },
      { metric: "% Positif", moi: myStats.positive_pct, secteur: Number(benchmark.positive_pct) || 0 },
      { metric: "% Négatif", moi: myStats.negative_pct, secteur: Number(benchmark.negative_pct) || 0 },
    ];
  }, [benchmark, myStats]);

  const cellColor = (v: number, max: number) => {
    if (!v) return "hsl(var(--muted))";
    const ratio = Math.min(1, v / Math.max(max, 1));
    // Utilise la couleur primary avec opacité
    return `hsl(var(--primary) / ${0.15 + ratio * 0.7})`;
  };

  const maxCohortValue = useMemo(() => {
    let max = 0;
    for (const r of cohortData.rows) {
      for (const w of cohortData.weeks) if (r[w] > max) max = r[w];
    }
    return max;
  }, [cohortData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div className="space-y-4 md:space-y-5">
        <div>
          <h1 className="text-xl md:text-3xl font-light tracking-tight">Analytics avancé</h1>
          <p className="text-[11px] md:text-sm text-muted-foreground mt-0.5">
            Cohortes, rétention sentiment et benchmarks sectoriels — données anonymisées.
          </p>
        </div>

        {mentions.length === 0 && (
          <Card className="glass-card rounded-2xl">
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Aucune donnée sur les 90 derniers jours. Configurez une surveillance active pour voir vos analyses.
            </CardContent>
          </Card>
        )}

        {mentions.length > 0 && (
          <Tabs defaultValue="cohortes" className="space-y-4">
            <TabsList className="glass-card rounded-2xl">
              <TabsTrigger value="cohortes" className="rounded-xl gap-2"><Layers className="h-4 w-4" />Cohortes</TabsTrigger>
              <TabsTrigger value="retention" className="rounded-xl gap-2"><TrendingUp className="h-4 w-4" />Rétention</TabsTrigger>
              <TabsTrigger value="benchmark" className="rounded-xl gap-2"><Users2 className="h-4 w-4" />Benchmarks</TabsTrigger>
            </TabsList>

            {/* Cohortes */}
            <TabsContent value="cohortes">
              <Card className="glass-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm">Matrice de cohortes par plateforme</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Volume de mentions par plateforme depuis leur 1re apparition (W0 = semaine d'entrée).
                  </p>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground">
                        <th className="text-left py-2 pr-3 font-medium">Plateforme</th>
                        {cohortData.weeks.map(w => <th key={w} className="text-center px-2 py-2 font-medium">{w}</th>)}
                        <th className="text-right pl-3 py-2 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cohortData.rows.map((r) => (
                        <tr key={r.source} className="border-t border-border/40">
                          <td className="py-2 pr-3 font-medium capitalize">{r.source}</td>
                          {cohortData.weeks.map(w => (
                            <td key={w} className="text-center p-1">
                              <div className="mx-auto h-8 min-w-[36px] flex items-center justify-center rounded-md font-semibold" style={{ background: cellColor(r[w], maxCohortValue) }}>
                                {r[w] || ""}
                              </div>
                            </td>
                          ))}
                          <td className="text-right pl-3 py-2 font-semibold">{r.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rétention */}
            <TabsContent value="retention">
              <Card className="glass-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm">Évolution du sentiment (12 dernières semaines)</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Stabilité du sentiment positif vs dégradation. Une chute du positif signale un risque de crise.
                  </p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <LineChart data={retentionData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                      <YAxis unit="%" tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                      <Line type="monotone" dataKey="positif" stroke="hsl(142 76% 45%)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="neutre" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="negatif" stroke="hsl(0 84% 60%)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Benchmark */}
            <TabsContent value="benchmark">
              <Card className="glass-card rounded-2xl">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2 flex-wrap">
                    Comparaison sectorielle
                    {sector && <Badge variant="outline" className="text-[10px]">Secteur : {sector}</Badge>}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Vos performances sur 30 jours vs la moyenne des autres marques de votre secteur (anonymisé).
                  </p>
                </CardHeader>
                <CardContent>
                  {!sector && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Renseignez votre secteur d'activité dans la surveillance pour activer les benchmarks.
                    </p>
                  )}
                  {sector && benchLoading && (
                    <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                  )}
                  {sector && !benchLoading && benchmark && Number(benchmark.user_count) < 3 && (
                    <div className="text-center py-8 space-y-2">
                      <TrendingDown className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Données insuffisantes ({benchmark.user_count} utilisateur{Number(benchmark.user_count) > 1 ? "s" : ""} dans « {sector} »).
                        Le benchmark s'active à partir de 3 utilisateurs.
                      </p>
                    </div>
                  )}
                  {sector && !benchLoading && benchmark && Number(benchmark.user_count) >= 3 && (
                    <>
                      <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="glass-card rounded-xl p-3 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase">Utilisateurs</p>
                          <p className="text-lg font-bold">{benchmark.user_count}</p>
                        </div>
                        <div className="glass-card rounded-xl p-3 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase">Vol. secteur</p>
                          <p className="text-lg font-bold">{benchmark.total}</p>
                        </div>
                        <div className="glass-card rounded-xl p-3 text-center">
                          <p className="text-[10px] text-muted-foreground uppercase">Moy/util</p>
                          <p className="text-lg font-bold">{benchmark.avg_per_user}</p>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={benchChart}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                          <XAxis dataKey="metric" tick={{ fontSize: 11 }} />
                          <YAxis tick={{ fontSize: 10 }} />
                          <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12 }} />
                          <Legend wrapperStyle={{ fontSize: 11 }} />
                          <Bar dataKey="moi" name="Ma marque" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                          <Bar dataKey="secteur" name="Moyenne secteur" fill="hsl(var(--muted-foreground) / 0.5)" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </AnimatedPage>
  );
}
