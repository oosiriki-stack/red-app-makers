import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip as RTooltip, CartesianGrid, Cell } from "recharts";
import { TrendingUp, TrendingDown, Plus, X, Trophy, Target, Loader2 } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const LS_KEY = "focus_competitors_v1";

type Sample = { content: string; author: string; source: string; sentiment: string };
type Stat = {
  name: string;
  isMe: boolean;
  total: number;
  positive: number;
  negative: number;
  neutral: number;
  score: number;
  topSources: { source: string; count: number }[];
  samples: Sample[];
};

export default function Competitors() {
  const { user } = useAuth();
  const [brand, setBrand] = useState("");
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [newCompetitor, setNewCompetitor] = useState("");
  const [mentions, setMentions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
      if (Array.isArray(saved)) setCompetitors(saved);
    } catch {}
  }, []);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: m }, { data: s }] = await Promise.all([
        supabase.from("mentions").select("content, author, sentiment, source").eq("user_id", user.id),
        supabase.from("monitoring_settings").select("brand").eq("user_id", user.id).maybeSingle(),
      ]);
      setMentions(m || []);
      setBrand(s?.brand || "");
      setLoading(false);
    })();
  }, [user]);

  const persist = (list: string[]) => {
    setCompetitors(list);
    localStorage.setItem(LS_KEY, JSON.stringify(list));
  };

  const addCompetitor = () => {
    const v = newCompetitor.trim();
    if (!v) return;
    if (competitors.some((c) => c.toLowerCase() === v.toLowerCase())) {
      toast.error("Ce concurrent est déjà ajouté");
      return;
    }
    if (competitors.length >= 8) {
      toast.error("8 concurrents maximum");
      return;
    }
    persist([...competitors, v]);
    setNewCompetitor("");
    toast.success(`${v} ajouté à la comparaison`);
  };

  const removeCompetitor = (name: string) => persist(competitors.filter((c) => c !== name));

  const stats: Stat[] = useMemo(() => {
    const names = [brand, ...competitors].filter(Boolean);
    return names.map((name) => {
      const re = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      const matches = mentions.filter((m) => re.test(m.content || "") || re.test(m.author || ""));
      const positive = matches.filter((m) => m.sentiment === "positive").length;
      const negative = matches.filter((m) => m.sentiment === "negative").length;
      const neutral = matches.filter((m) => m.sentiment === "neutral").length;
      const total = matches.length;
      const score = total > 0 ? Math.round(((positive - negative) / total) * 50 + 50) : 0;
      const srcMap = new Map<string, number>();
      matches.forEach((m) => srcMap.set(m.source, (srcMap.get(m.source) || 0) + 1));
      const topSources = Array.from(srcMap.entries()).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 3);
      const samples: Sample[] = matches.slice(0, 3).map((m) => ({ content: m.content, author: m.author, source: m.source, sentiment: m.sentiment }));
      return { name, isMe: name === brand, total, positive, negative, neutral, score, topSources, samples };
    });
  }, [brand, competitors, mentions]);

  const sortedByScore = [...stats].sort((a, b) => b.score - a.score);
  const myStat = stats.find((s) => s.isMe);
  const myRank = sortedByScore.findIndex((s) => s.isMe) + 1;
  const leader = sortedByScore[0];

  const recommendation = useMemo(() => {
    if (!myStat || stats.length < 2) return null;
    if (myStat.total === 0) return "Lancez le tracker pour collecter vos premières mentions et débloquer la comparaison.";
    if (myRank === 1) return `Excellent ! Vous menez avec ${myStat.score}/100. Maintenez la cadence en publiant régulièrement et en répondant rapidement aux avis.`;
    const gap = leader.score - myStat.score;
    if (gap > 20) return `${leader.name} vous devance de ${gap} points. Analysez ses sources les plus actives et adoptez une stratégie de réponse plus agressive sur les avis négatifs.`;
    return `Vous êtes à seulement ${gap} points du leader ${leader.name}. Quelques avis positifs supplémentaires suffisent à reprendre la tête.`;
  }, [myStat, leader, myRank, stats]);

  const chartData = stats.map((s) => ({
    name: s.name.length > 12 ? s.name.slice(0, 11) + "…" : s.name,
    Mentions: s.total,
    Score: s.score,
    isMe: s.isMe,
  }));

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <AnimatedPage>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">Analyse Concurrentielle</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Comparez votre e-réputation à celle de vos concurrents</p>
        </div>

        {!brand && (
          <Card className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
            Configurez d'abord votre marque dans <strong>Paramètres → Surveillance</strong> pour activer la comparaison.
          </Card>
        )}

        <Card className="glass-card rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><Target className="w-4 h-4 text-primary" />Concurrents à surveiller</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ajouter un concurrent (ex: Orange CI, MTN, Moov...)"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCompetitor())}
                className="rounded-xl"
              />
              <Button onClick={addCompetitor} className="rounded-xl shrink-0"><Plus className="w-4 h-4 mr-1" />Ajouter</Button>
            </div>
            {competitors.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {competitors.map((c) => (
                  <Badge key={c} variant="secondary" className="rounded-lg gap-1 pr-1 text-sm py-1">
                    {c}
                    <button onClick={() => removeCompetitor(c)} className="ml-1 hover:text-destructive p-0.5"><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
            )}
            {competitors.length === 0 && <p className="text-xs text-muted-foreground">Aucun concurrent encore. Ajoutez-en pour commencer la comparaison.</p>}
          </CardContent>
        </Card>

        {brand && competitors.length > 0 && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
              <Card className="glass-card rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-primary" />Leader actuel</div>
                  <p className="text-xl font-bold mt-1">{leader?.name || "—"}</p>
                  <p className="text-xs text-muted-foreground">Score {leader?.score || 0}/100</p>
                </CardContent>
              </Card>
              <Card className="glass-card rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">Votre position</div>
                  <p className="text-xl font-bold mt-1">{myRank > 0 ? `#${myRank}` : "—"} sur {stats.length}</p>
                  <p className="text-xs text-muted-foreground">Score {myStat?.score || 0}/100</p>
                </CardContent>
              </Card>
              <Card className="glass-card rounded-2xl">
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    {myStat && leader && myStat.score >= leader.score ? <TrendingUp className="w-3.5 h-3.5 text-green-600" /> : <TrendingDown className="w-3.5 h-3.5 text-red-600" />}
                    Écart au leader
                  </div>
                  <p className="text-xl font-bold mt-1">
                    {myStat && leader ? (myStat.score - leader.score >= 0 ? "+" : "") + (myStat.score - leader.score) : 0} pts
                  </p>
                  <p className="text-xs text-muted-foreground">Différence de score</p>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card rounded-2xl">
              <CardHeader><CardTitle className="text-base">Volume de mentions</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <RTooltip />
                    <Bar dataKey="Mentions" radius={[8, 8, 0, 0]}>
                      {chartData.map((d, i) => (
                        <Cell key={i} fill={d.isMe ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl">
              <CardHeader><CardTitle className="text-base">Détail par concurrent</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sortedByScore.map((s, i) => (
                    <div key={s.name} className={`rounded-xl p-3 border ${s.isMe ? "border-primary/40 bg-primary/5" : "border-border"}`}>
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="rounded-lg">#{i + 1}</Badge>
                          <p className="font-medium">{s.name} {s.isMe && <span className="text-xs text-primary">(vous)</span>}</p>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <span className="text-muted-foreground">{s.total} mentions</span>
                          <span className="font-bold text-primary">{s.score}/100</span>
                        </div>
                      </div>
                      <div className="mt-2 flex h-2 rounded-full overflow-hidden bg-muted">
                        {s.total > 0 ? (
                          <>
                            <div className="bg-green-500" style={{ width: `${(s.positive / s.total) * 100}%` }} />
                            <div className="bg-slate-400" style={{ width: `${(s.neutral / s.total) * 100}%` }} />
                            <div className="bg-red-500" style={{ width: `${(s.negative / s.total) * 100}%` }} />
                          </>
                        ) : (
                          <div className="bg-muted-foreground/20 w-full" />
                        )}
                      </div>
                      <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                        <span>{s.positive} pos.</span>
                        <span>{s.neutral} neutres</span>
                        <span>{s.negative} nég.</span>
                      </div>
                      {s.topSources.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          <span className="text-[10px] text-muted-foreground">Sources actives :</span>
                          {s.topSources.map((src) => (
                            <Badge key={src.source} variant="outline" className="text-[10px] rounded-md py-0">{src.source} · {src.count}</Badge>
                          ))}
                        </div>
                      )}
                      {s.samples.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {s.samples.map((sm, k) => (
                            <div key={k} className="text-[11px] rounded-lg bg-muted/40 px-2 py-1.5">
                              <span className="font-semibold">{sm.author}</span>
                              <span className="text-muted-foreground"> · {sm.source} · </span>
                              <span className={sm.sentiment === "positive" ? "text-green-600" : sm.sentiment === "negative" ? "text-red-600" : "text-muted-foreground"}>{sm.sentiment === "positive" ? "👍" : sm.sentiment === "negative" ? "👎" : "•"}</span>
                              <p className="line-clamp-2 mt-0.5">{sm.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {s.total === 0 && !s.isMe && (
                        <p className="text-[11px] text-muted-foreground italic mt-2">Aucune mention détectée. Le tracker enrichira automatiquement ce concurrent lors du prochain cycle.</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {recommendation && (
              <Card className="glass-card rounded-2xl border-primary/30">
                <CardHeader><CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Recommandation stratégique</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed">{recommendation}</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AnimatedPage>
  );
}
