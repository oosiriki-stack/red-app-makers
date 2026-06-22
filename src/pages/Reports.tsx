import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Loader2, Calendar, TrendingUp, BarChart3, PieChart as PieIcon, Presentation } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generatePdfReport, filterByPeriod, type ReportPeriod, type Mention } from "@/lib/pdfReport";
import { generatePptxReport } from "@/lib/pptxReport";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, BarChart, Bar, Legend } from "recharts";

const PERIODS: { key: ReportPeriod; label: string; auto?: string }[] = [
  { key: "daily", label: "Quotidien" },
  { key: "weekly", label: "Hebdomadaire", auto: "Auto chaque lundi" },
  { key: "monthly", label: "Mensuel", auto: "Auto le 1er du mois" },
  { key: "yearly", label: "Annuel" },
];

export default function Reports() {
  const { user } = useAuth();
  const [brand, setBrand] = useState("");
  const [settings, setSettings] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [alertsCount, setAlertsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<ReportPeriod | null>(null);
  const [generatingPptx, setGeneratingPptx] = useState<ReportPeriod | null>(null);

  const generatePptx = async (period: ReportPeriod) => {
    setGeneratingPptx(period);
    try {
      generatePptxReport({
        brand: brand || "Surveillance",
        period,
        mentions: filterByPeriod(mentions, period),
        alertsCount,
        ownerName: profile?.name,
        ownerEmail: user?.email ?? undefined,
      });
      toast.success(`Présentation ${period} téléchargée`);
    } catch (e: any) { toast.error(e.message); }
    finally { setGeneratingPptx(null); }
  };

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ data: m }, { data: s }, { count }, { data: p }] = await Promise.all([
        supabase.from("mentions").select("*").eq("user_id", user.id).order("mention_date", { ascending: false }),
        supabase.from("monitoring_settings").select("*").eq("user_id", user.id).maybeSingle(),
        supabase.from("alerts").select("*", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
      ]);
      setMentions((m as Mention[]) || []);
      setSettings(s);
      setProfile(p);
      setBrand(s?.brand || "");
      setAlertsCount(count || 0);
      setLoading(false);
    })();
  }, [user]);

  const generate = async (period: ReportPeriod) => {
    setGenerating(period);
    try {
      const filtered = filterByPeriod(mentions, period);
      const doc = generatePdfReport({
        brand,
        period,
        mentions: filtered,
        alertsCount,
        person: settings?.person,
        country: settings?.country,
        city: settings?.city,
        commune: settings?.commune,
        ownerName: profile?.name,
        ownerEmail: user?.email,
      });
      doc.save(`focus-rapport-${period}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success(`Rapport ${period} téléchargé`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(null);
    }
  };

  const totalsByPeriod = Object.fromEntries(PERIODS.map((p) => [p.key, filterByPeriod(mentions, p.key).length]));

  const chartData = useMemo(() => {
    const days: Record<string, { date: string; total: number; positive: number; negative: number; neutral: number }> = {};
    const now = Date.now();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now - i * 86400000).toISOString().slice(0, 10);
      days[d] = { date: d.slice(5), total: 0, positive: 0, negative: 0, neutral: 0 };
    }
    for (const m of mentions) {
      const k = (m as any).mention_date?.slice(0, 10);
      if (k && days[k]) {
        days[k].total++;
        const s = (m as any).sentiment || "neutral";
        if (s === "positive") days[k].positive++;
        else if (s === "negative") days[k].negative++;
        else days[k].neutral++;
      }
    }
    return Object.values(days);
  }, [mentions]);

  const sentimentData = useMemo(() => {
    const acc = { positive: 0, negative: 0, neutral: 0 } as Record<string, number>;
    for (const m of mentions) acc[(m as any).sentiment || "neutral"]++;
    return [
      { name: "Positives", value: acc.positive, color: "hsl(142 71% 45%)" },
      { name: "Négatives", value: acc.negative, color: "hsl(0 84% 60%)" },
      { name: "Neutres", value: acc.neutral, color: "hsl(220 9% 60%)" },
    ];
  }, [mentions]);

  const sourcesData = useMemo(() => {
    const acc: Record<string, number> = {};
    for (const m of mentions) acc[(m as any).source || "autre"] = (acc[(m as any).source || "autre"] || 0) + 1;
    return Object.entries(acc).map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 6);
  }, [mentions]);

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <AnimatedPage>
      <div className="space-y-4 md:space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-light tracking-tight">Rapports auto · PDF & PPTX</h1>
          <p className="text-xs md:text-sm text-muted-foreground">Génération automatique · {brand || "Aucune marque configurée"}</p>
        </div>

        {mentions.length > 0 && (
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="glass-card rounded-2xl lg:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" />Évolution des mentions (14 jours)</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.5} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="total" stroke="hsl(var(--primary))" fill="url(#gTotal)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><PieIcon className="w-4 h-4 text-primary" />Sentiments</CardTitle>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={sentimentData} dataKey="value" nameKey="name" innerRadius={45} outerRadius={75} paddingAngle={2}>
                      {sentimentData.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="glass-card rounded-2xl lg:col-span-3">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" />Top sources</CardTitle>
              </CardHeader>
              <CardContent className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sourcesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="source" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {mentions.length === 0 && (
          <Card className="glass-card rounded-2xl p-6 text-center text-sm text-muted-foreground">
            Aucune mention encore collectée. Configurez la surveillance puis lancez un cycle de tracker pour générer des rapports.
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {PERIODS.map((p) => (
            <Card key={p.key} className="glass-card rounded-2xl card-hover">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />{p.label}</span>
                  <Badge variant="outline" className="rounded-lg">{totalsByPeriod[p.key]} mentions</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Rapport {p.label.toLowerCase()} avec graphiques de sentiment, top sources, mentions à fort impact et recommandations IA.
                </p>
                {p.auto && <p className="text-xs text-primary">📅 {p.auto}</p>}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    onClick={() => generate(p.key)}
                    disabled={generating === p.key || mentions.length === 0 || totalsByPeriod[p.key] === 0}
                    className="w-full rounded-xl"
                  >
                    {generating === p.key ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => generatePptx(p.key)}
                    disabled={generatingPptx === p.key || mentions.length === 0 || totalsByPeriod[p.key] === 0}
                    className="w-full rounded-xl"
                  >
                    {generatingPptx === p.key ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Presentation className="w-4 h-4 mr-2" />}
                    PPTX
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="glass-card rounded-2xl">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="w-4 h-4 text-primary" />Rapports automatiques</CardTitle></CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>📨 <strong>Hebdomadaire</strong> : envoyé par email tous les lundis matin avec synthèse de la semaine écoulée.</p>
            <p>📊 <strong>Mensuel complet</strong> : envoyé le 1er de chaque mois avec analyse approfondie, comparaisons et recommandations.</p>
            <p className="text-xs">Pour activer les envois automatiques, gérez vos préférences dans Paramètres → Notifications.</p>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
