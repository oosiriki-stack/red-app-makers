import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Loader2, Calendar } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generatePdfReport, filterByPeriod, type ReportPeriod, type Mention } from "@/lib/pdfReport";

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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  const totalsByPeriod = Object.fromEntries(PERIODS.map((p) => [p.key, filterByPeriod(mentions, p.key).length]));

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Rapports PDF</h1>
          <p className="text-muted-foreground">Rapports avec graphiques · {brand || "Aucune marque configurée"}</p>
        </div>

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
                  Rapport {p.label.toLowerCase()} avec graphiques de sentiment, top sources et 25 mentions.
                </p>
                {p.auto && <p className="text-xs text-primary">📅 {p.auto}</p>}
                <Button onClick={() => generate(p.key)} disabled={generating === p.key} className="w-full rounded-xl">
                  {generating === p.key ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  Télécharger PDF
                </Button>
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
