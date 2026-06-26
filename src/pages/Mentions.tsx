import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, ExternalLink, Download, RefreshCw, Loader2, Volume2, Sparkles, Copy, User, Search, Radio, Activity, CalendarDays, UserCircle, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { useSubscription } from "@/hooks/useSubscription";
import { playAlertSound, isSoundEnabled } from "@/lib/sound";
import { speak, summarizeMentions, stopSpeaking } from "@/lib/speech";

const sentimentConfig = {
  positive: { label: "Positif", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: ThumbsUp },
  neutral: { label: "Neutre", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: Minus },
  negative: { label: "Négatif", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: ThumbsDown },
};

const PLATFORM_LABEL: Record<string, string> = { x: "X (Twitter)", facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", tiktok: "TikTok", blog: "Blogs & forums", google: "Google News" };

type Mention = {
  id: string;
  source: string;
  author: string;
  avatar: string | null;
  content: string;
  sentiment: string;
  engagement: number | null;
  mention_date: string;
  source_url: string | null;
  interactions: any;
  query: string | null;
  requester: string | null;
  emotion?: string | null;
  is_sarcastic?: boolean | null;
  theme?: string | null;
  entities?: any;
  impact_score?: number | null;
};

const impactStyle = (score: number) => {
  if (score >= 75) return { label: "🔥 Impact critique", cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" };
  if (score >= 55) return { label: "⚡ Impact élevé", cls: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" };
  if (score >= 35) return { label: "Impact moyen", cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" };
  return { label: "Impact faible", cls: "bg-muted text-muted-foreground" };
};

const EMOTION_LABEL: Record<string, { label: string; cls: string }> = {
  colere: { label: "😠 Colère", cls: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" },
  satisfaction: { label: "😊 Satisfaction", cls: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  inquietude: { label: "😟 Inquiétude", cls: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400" },
  enthousiasme: { label: "🎉 Enthousiasme", cls: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" },
  tristesse: { label: "😢 Tristesse", cls: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-400" },
  neutre: { label: "Neutre", cls: "bg-muted text-muted-foreground" },
};

const THEME_LABEL: Record<string, string> = {
  prix: "💰 Prix",
  service_client: "🎧 Service client",
  qualite_produit: "📦 Qualité",
  delais: "⏱️ Délais",
  experience_utilisateur: "✨ UX",
  communication: "📣 Communication",
  autre: "Autre",
};

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryFromUrl = searchParams.get("q") || "";
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [nameFilter, setNameFilter] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [selected, setSelected] = useState<Mention | null>(null);
  const [interactionsOpen, setInteractionsOpen] = useState<Mention | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<{ pro?: string; commercial?: string; humor?: string }>({});
  const [generating, setGenerating] = useState<string | null>(null);
  const { user } = useAuth();
  const { isTrial, isPaid } = useSubscription();
  const trialLocked = isTrial && !isPaid; // accès limité à 3 mentions visibles, le reste flouté
  const FREE_PREVIEW = 3;

  const fetchMentions = async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase.from("mentions").select("*").eq("user_id", user.id).order("mention_date", { ascending: false }).limit(5000);
    if (sourceFilter !== "all") query = query.eq("source", sourceFilter);
    if (sentimentFilter !== "all") query = query.eq("sentiment", sentimentFilter);
    if (queryFromUrl) query = query.or(`content.ilike.%${queryFromUrl}%,author.ilike.%${queryFromUrl}%`);
    if (dateFilter) {
      const start = new Date(dateFilter);
      start.setHours(0, 0, 0, 0);
      const end = new Date(dateFilter);
      end.setHours(23, 59, 59, 999);
      query = query.gte("mention_date", start.toISOString()).lte("mention_date", end.toISOString());
    }
    if (nameFilter) query = query.ilike("author", `%${nameFilter}%`);
    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setMentions((data || []) as Mention[]);
    setLoading(false);
  };

  useEffect(() => { fetchMentions(); }, [user, sourceFilter, sentimentFilter, queryFromUrl, dateFilter, nameFilter]);

  // Fenêtre prioritaire post-activation surveillance : indicateur visuel,
  // re-fetch toutes les 15s pendant ~2 min, puis bilan de la fenêtre.
  const [priorityActive, setPriorityActive] = useState(false);
  const [priorityRemaining, setPriorityRemaining] = useState(0);
  useEffect(() => {
    if (!user) return;
    let until = 0;
    try { until = Number(localStorage.getItem("arobase_priority_until") || 0); } catch {}
    if (!until || Date.now() > until) { setPriorityActive(false); return; }
    setPriorityActive(true);
    const baseline = mentions.length;
    const baselineAt = Date.now();
    const tick = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((until - Date.now()) / 1000));
      setPriorityRemaining(remaining);
      if (Date.now() > until) {
        clearInterval(tick);
        clearInterval(poll);
        setPriorityActive(false);
        try { localStorage.removeItem("arobase_priority_until"); } catch {}
        // Bilan : nombre de réactions arrivées pendant la fenêtre
        supabase
          .from("mentions")
          .select("id", { count: "exact", head: true })
          .eq("user_id", user.id)
          .gte("mention_date", new Date(baselineAt).toISOString())
          .then(({ count }) => {
            const n = count ?? 0;
            if (n > 0) {
              toast.success(`✅ ${n} réaction(s) détectée(s) durant la fenêtre prioritaire`, {
                description: "La surveillance continue normalement en arrière-plan.",
                duration: 8000,
              });
            } else {
              toast.info("Aucune réaction durant la fenêtre prioritaire", {
                description: "La surveillance reste active — vous serez notifié dès qu'une mention apparaît.",
                duration: 8000,
              });
            }
          });
      }
    }, 1000);
    const poll = setInterval(() => { if (Date.now() <= until) fetchMentions(); }, 15_000);
    return () => { clearInterval(tick); clearInterval(poll); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const displayMentions = useMemo(() => {
    if (timeFilter === "all") return mentions;
    return mentions.filter((m) => {
      const hour = new Date(m.mention_date).getHours();
      switch (timeFilter) {
        case "morning": return hour >= 6 && hour < 12;
        case "afternoon": return hour >= 12 && hour < 18;
        case "evening": return hour >= 18 && hour < 22;
        case "night": return hour >= 22 || hour < 6;
        default: return true;
      }
    });
  }, [mentions, timeFilter]);


  useRealtimeTable("mentions", user?.id, {
    onInsert: (row) => {
      const m = row as Mention;
      setMentions((prev) => [m, ...prev]);
      if (isSoundEnabled()) playAlertSound(m.sentiment === "negative" ? "warning" : "info");
      toast.info(`Nouvelle mention de ${m.author}`, {
        description: (m.content || "").slice(0, 100),
        action: { label: "Ouvrir", onClick: () => { setSelected(m); setReply({}); setTimeout(() => generateReplyFor(m, "pro"), 200); } },
        duration: 8000,
      });
      // Auto-ouverture si aucune mention n'est déjà ouverte (réaction automatique)
      setSelected((cur) => {
        if (cur) return cur;
        setReply({});
        setTimeout(() => generateReplyFor(m, "pro"), 300);
        return m;
      });
    },
    onUpdate: (row) => setMentions((prev) => prev.map((m) => (m.id === row.id ? (row as Mention) : m))),
    onDelete: (row) => setMentions((prev) => prev.filter((m) => m.id !== row.id)),
  });

  const handleRefresh = async () => { setRefreshing(true); await fetchMentions(); setRefreshing(false); toast.success("Flux actualisé"); };

  const runTracker = async (adhoc?: string) => {
    setTracking(true);
    const { data: profile } = user ? await supabase.from("profiles").select("name").eq("id", user.id).maybeSingle() : { data: null as any };
    const requester = (profile?.name?.trim() || user?.email || "Vous").toString();
    const queryLabel = (adhoc || queryFromUrl || "").trim();
    const reqToast = queryLabel
      ? toast.loading(`🔎 Tracker lancé par ${requester}`, { description: `Surveillance: « ${queryLabel} »` })
      : toast.loading(`🔎 Tracker lancé par ${requester}`);
    const { data, error } = await supabase.functions.invoke("track-mentions", {
      body: queryLabel ? { query: queryLabel } : {},
    });
    setTracking(false);
    toast.dismiss(reqToast);
    if (error) return toast.error("Tracker: " + error.message);
    await fetchMentions();
    toast.success(`${data?.count ?? 0} mention(s) collectée(s)`, {
      description: queryLabel ? `Surveillance: « ${queryLabel} » · Émetteur: ${requester}` : `Émetteur: ${requester}`,
    });
  };

  const [aiScoring, setAiScoring] = useState(false);
  const reScoreAI = async () => {
    setAiScoring(true);
    try {
      const ids = mentions.slice(0, 50).map((m) => m.id);
      const { data, error } = await supabase.functions.invoke("analyze-sentiment", { body: { ids } });
      if (error) throw error;
      toast.success(`IA: ${data?.updated ?? 0} mention(s) re-scorée(s)`);
      await fetchMentions();
    } catch (e: any) { toast.error(e.message || "Erreur IA"); }
    finally { setAiScoring(false); }
  };

  const [enriching, setEnriching] = useState(false);
  const enrichAI = async () => {
    setEnriching(true);
    try {
      const { data, error } = await supabase.functions.invoke("enrich-mention", { body: { user_id: user?.id, limit: 30 } });
      if (error) throw error;
      toast.success(`IA: ${data?.enriched ?? 0} mention(s) enrichie(s)`, { description: "Émotions, thèmes et entités détectés" });
      await fetchMentions();
    } catch (e: any) { toast.error(e.message || "Erreur enrichissement IA"); }
    finally { setEnriching(false); }
  };

  const [redditing, setRedditing] = useState(false);
  const scanReddit = async () => {
    setRedditing(true);
    try {
      const { data, error } = await supabase.functions.invoke("reddit-scan", { body: {} });
      if (error) throw error;
      toast.success(`Reddit: ${data?.inserted ?? 0} nouvelle(s) discussion(s)`);
      await fetchMentions();
    } catch (e: any) { toast.error(e.message || "Erreur Reddit"); }
    finally { setRedditing(false); }
  };

  const deleteOne = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("mentions").delete().eq("id", id).eq("user_id", user.id);
    if (error) return toast.error(error.message);
    setMentions((prev) => prev.filter((m) => m.id !== id));
    toast.success("Mention supprimée");
  };

  const deleteAll = async () => {
    if (!user) return;
    const { error } = await supabase.from("mentions").delete().eq("user_id", user.id);
    if (error) return toast.error(error.message);
    setMentions([]);
    toast.success("Toutes les mentions ont été supprimées");
  };

  // Auto-tracker dès qu'une surveillance est saisie (depuis la barre de recherche)
  const autoTrackedRef = useState<string>("")[0];
  useEffect(() => {
    if (!user || !queryFromUrl) return;
    const key = `arobase_autotrack_${user.id}_${queryFromUrl}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    runTracker(queryFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, queryFromUrl]);

  const downloadCSV = () => {
    const header = "Date,Heure,Source,Auteur,Sentiment,Contenu,URL\n";
    const rows = mentions.map((m) => {
      const d = new Date(m.mention_date);
      return `"${d.toLocaleDateString("fr-FR")}","${d.toLocaleTimeString("fr-FR")}","${m.source}","${m.author}","${m.sentiment}","${(m.content || "").replace(/"/g, '""')}","${m.source_url || ""}"`;
    }).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "mentions.csv"; a.click();
  };

  const audioSummary = (period: "today" | "week" | "month") => {
    const now = Date.now();
    const ms = period === "today" ? 24 * 3600e3 : period === "week" ? 7 * 24 * 3600e3 : 30 * 24 * 3600e3;
    const filtered = mentions.filter((m) => now - new Date(m.mention_date).getTime() <= ms);
    const label = period === "today" ? "Aujourd'hui" : period === "week" ? "Cette semaine" : "Ce mois-ci";
    speak(summarizeMentions(filtered, label.toLowerCase()));
    toast.success(`🔊 Lecture audio · ${label}`);
  };

  const openSource = (m: Mention) => {
    if (m.source_url) { window.open(m.source_url, "_blank"); return; }
    const q = encodeURIComponent(`"${m.author}" "${m.content.slice(0, 60)}"`);
    window.open(`https://www.google.com/search?q=${q}`, "_blank");
    toast.info("Recherche sur Google (URL source non disponible)");
  };

  const generateReplyFor = async (target: Mention, tone: "pro" | "commercial" | "humor") => {
    setGenerating(tone);
    try {
      const prompts = {
        pro: "professionnel et empathique, courtois, formel",
        commercial: "orienté fidélisation client, proposant une action commerciale concrète",
        humor: "avec une touche d'humour respectueux, ton léger mais professionnel",
      };
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/focus-gpt`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({
          messages: [{ role: "user", content: `Rédige une réponse ${prompts[tone]} à cet avis client :\n\nAuteur: ${target.author}\nSource: ${target.source}\nSentiment: ${target.sentiment}\n\n"${target.content}"\n\nDonne uniquement le texte de la réponse, sans introduction.` }],
        }),
      });
      if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`);
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) { acc += delta; setReply((r) => ({ ...r, [tone]: acc })); }
          } catch {}
        }
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGenerating(null);
    }
  };

  const generateReply = (tone: "pro" | "commercial" | "humor") => {
    if (!selected) return;
    return generateReplyFor(selected, tone);
  };

  const sources = [...new Set(mentions.map((m) => m.source))];

  return (
    <AnimatedPage>
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">Flux de Mentions</h1>
            <p className="text-xs md:text-sm text-muted-foreground">
              {displayMentions.length} résultat{displayMentions.length > 1 ? "s" : ""}
              {queryFromUrl && <span> pour « {queryFromUrl} » <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setSearchParams({})}>Effacer</Button></span>}
              {priorityActive && (
                <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  Surveillance prioritaire · {Math.floor(priorityRemaining / 60)}:{String(priorityRemaining % 60).padStart(2, "0")}
                </span>
              )}
              {!priorityActive && !queryFromUrl && displayMentions.length > 0 && (
                <span className="inline-flex items-center gap-1 ml-2">
                  <Activity className="h-3 w-3 text-green-500 animate-pulse" />
                  Cycle de surveillance activé
                </span>
              )}
            </p>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <Button size="sm" className="rounded-xl" onClick={() => runTracker()} disabled={tracking}>{tracking ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}Relancer le tracker</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={scanReddit} disabled={redditing}>{redditing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Radio className="h-4 w-4 mr-1" />}Reddit</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={reScoreAI} disabled={aiScoring || !mentions.length}>{aiScoring ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}IA score</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={enrichAI} disabled={enriching || !mentions.length}>{enriching ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Sparkles className="h-4 w-4 mr-1" />}Enrichir IA</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRefresh} disabled={refreshing}>{refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}</Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={downloadCSV}><Download className="h-4 w-4 mr-1" />CSV</Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-900/20" disabled={!mentions.length}>
                  <Trash2 className="h-4 w-4 mr-1" />Tout supprimer
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-card rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer toutes les mentions ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Cette action supprimera définitivement les {mentions.length} mentions de votre flux. Cette opération est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                  <AlertDialogAction className="rounded-xl bg-red-600 hover:bg-red-700" onClick={deleteAll}>Tout supprimer</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-36 rounded-xl h-9"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Toutes sources</SelectItem>{sources.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}</SelectContent>
          </Select>
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-36 rounded-xl h-9"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Tous sentiments</SelectItem><SelectItem value="positive">Positif</SelectItem><SelectItem value="neutral">Neutre</SelectItem><SelectItem value="negative">Négatif</SelectItem></SelectContent>
          </Select>
          <div className="relative">
            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-40 rounded-xl h-9 pl-8 text-sm" />
          </div>
          <div className="relative">
            <UserCircle className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input type="text" placeholder="Nom..." value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} className="w-36 rounded-xl h-9 pl-8 text-sm" />
          </div>
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-36 rounded-xl h-9"><SelectValue placeholder="Heure" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes heures</SelectItem>
              <SelectItem value="morning">Matin (6h–12h)</SelectItem>
              <SelectItem value="afternoon">Après-midi (12h–18h)</SelectItem>
              <SelectItem value="evening">Soir (18h–22h)</SelectItem>
              <SelectItem value="night">Nuit (22h–6h)</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex gap-1 ml-auto">
            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => audioSummary("today")} title="Résumé audio du jour"><Volume2 className="h-4 w-4 mr-1" />Jour</Button>
            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => audioSummary("week")}><Volume2 className="h-4 w-4 mr-1" />Sem.</Button>
            <Button size="sm" variant="outline" className="rounded-xl" onClick={() => audioSummary("month")}><Volume2 className="h-4 w-4 mr-1" />Mois</Button>
            <Button size="sm" variant="ghost" className="rounded-xl" onClick={stopSpeaking}>⏹</Button>
          </div>
        </div>

        <div className="space-y-2">
          {!loading && displayMentions.length === 0 && (
            <Card className="glass-card rounded-2xl">
              <CardContent className="p-8 text-center space-y-3">
                <p className="text-sm text-muted-foreground">Aucune mention pour l'instant. Lancez un cycle de collecte pour vérifier immédiatement les résultats.</p>
                <Button onClick={() => runTracker()} disabled={tracking} className="rounded-xl">
                  {tracking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                  Relancer le tracker maintenant
                </Button>
              </CardContent>
            </Card>
          )}
          {displayMentions.map((m, idx) => {
            const sc = sentimentConfig[m.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
            const avatarText = (m.author || "?").split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
            const d = new Date(m.mention_date);
            const isLocked = trialLocked && idx >= FREE_PREVIEW;
            return (
              <Card key={m.id} className="glass-card rounded-2xl card-hover relative overflow-hidden">
                <CardContent className={`p-4 flex items-start gap-3 ${isLocked ? "blur-md select-none pointer-events-none" : ""}`}>
                  <Avatar className="h-9 w-9"><AvatarFallback className="bg-muted text-xs">{avatarText}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => { if (isLocked) return; setSelected(m); setReply({}); }}>
                    <div className="flex items-center gap-1.5 flex-wrap text-xs">
                      <span className="font-medium text-sm">{m.author}</span>
                      <Badge variant="outline" className="text-[10px] rounded-md py-0">{PLATFORM_LABEL[m.source] || m.source}</Badge>
                      <Badge className={`text-[10px] border-0 rounded-md py-0 ${sc.className}`}>{sc.label}</Badge>
                      {m.emotion && m.emotion !== "neutre" && EMOTION_LABEL[m.emotion] && (
                        <Badge className={`text-[10px] border-0 rounded-md py-0 ${EMOTION_LABEL[m.emotion].cls}`}>{EMOTION_LABEL[m.emotion].label}</Badge>
                      )}
                      {m.theme && m.theme !== "autre" && THEME_LABEL[m.theme] && (
                        <Badge variant="outline" className="text-[10px] rounded-md py-0">{THEME_LABEL[m.theme]}</Badge>
                      )}
                      {m.is_sarcastic && (
                        <Badge variant="outline" className="text-[10px] rounded-md py-0 border-purple-500/50 text-purple-600 dark:text-purple-400">🎭 Sarcasme</Badge>
                      )}
                      {typeof m.impact_score === "number" && m.impact_score > 0 && (
                        <Badge className={`text-[10px] border-0 rounded-md py-0 ${impactStyle(m.impact_score).cls}`} title={`Score d'impact : ${m.impact_score}/100`}>{impactStyle(m.impact_score).label} · {m.impact_score}</Badge>
                      )}
                      <span className="text-muted-foreground ml-auto">{d.toLocaleDateString("fr-FR")} · {d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="text-sm mt-1 text-foreground/90 line-clamp-2">{m.content}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5"><Radio className="h-3 w-3 text-primary" />Plateforme · <span className="font-medium text-foreground/80">{PLATFORM_LABEL[m.source] || m.source}</span></span>
                      {m.query && <span className="inline-flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5"><Search className="h-3 w-3 text-primary" />Surveillance · <span className="font-medium text-foreground/80 truncate max-w-[180px]">« {m.query} »</span></span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button size="sm" variant="ghost" className="rounded-lg h-7 px-2" onClick={(e) => { e.stopPropagation(); setInteractionsOpen(m); }}>
                      <MessageSquare className="h-3 w-3 mr-1" />{m.engagement ?? 0}
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-lg h-7 px-2 text-primary" onClick={(e) => { e.stopPropagation(); openSource(m); }}>
                      <ExternalLink className="h-3 w-3 mr-1" />Voir
                    </Button>
                    <Button size="sm" variant="ghost" className="rounded-lg h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20" title="Supprimer cette mention" onClick={(e) => { e.stopPropagation(); deleteOne(m.id); }}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
                {isLocked && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[2px]">
                    <Button size="sm" className="rounded-xl gap-1.5 shadow-lg" onClick={() => navigate("/pricing")}>
                      <Lock className="h-3.5 w-3.5" />Débloquer avec une licence
                    </Button>
                  </div>
                )}
              </Card>
            );
          })}
          {trialLocked && displayMentions.length > FREE_PREVIEW && (
            <Card className="glass-card rounded-2xl border-primary/30">
              <CardContent className="p-5 text-center space-y-2">
                <p className="text-sm font-medium">🔒 {displayMentions.length - FREE_PREVIEW} mention(s) supplémentaire(s) verrouillée(s)</p>
                <p className="text-xs text-muted-foreground">Votre essai gratuit vous permet de voir 3 mentions. Activez une licence pour accéder à l'intégralité du flux, aux réponses IA et aux exports.</p>
                <Button className="rounded-xl mt-2" onClick={() => navigate("/pricing")}>
                  <Lock className="h-4 w-4 mr-1.5" />Activer ma licence
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Mention detail with AI replies */}
        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="glass-card rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Détail de la mention</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{selected.author.slice(0, 2)}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{selected.author}</p>
                    <p className="text-xs text-muted-foreground">{selected.source} · {new Date(selected.mention_date).toLocaleString("fr-FR")}</p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => openSource(selected)}><ExternalLink className="h-3 w-3 mr-1" />Voir la source</Button>
                </div>
                <p className="text-sm bg-muted/50 p-3 rounded-xl">{selected.content}</p>
                <div className={`grid gap-2 ${selected.query ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
                  <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Radio className="h-3 w-3" />Plateforme</p>
                    <p className="text-sm font-medium mt-1 truncate">{PLATFORM_LABEL[selected.source] || selected.source}</p>
                  </div>
                  {selected.query && (
                    <div className="rounded-xl border border-border/50 bg-background/40 p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1"><Search className="h-3 w-3" />Surveillance surveillée</p>
                      <p className="text-sm font-medium mt-1 truncate">« {selected.query} »</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Badge className={(sentimentConfig[selected.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral).className}>{(sentimentConfig[selected.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral).label}</Badge>
                  <Badge variant="outline">{selected.engagement ?? 0} interactions</Badge>
                </div>

                <div className="border-t pt-3 space-y-2">
                  <p className="text-sm font-medium flex items-center gap-1"><Sparkles className="h-4 w-4 text-primary" />Réponses IA suggérées</p>
                  <div className="flex gap-2 flex-wrap">
                    {(["pro", "commercial", "humor"] as const).map((t) => (
                      <Button key={t} size="sm" variant="outline" className="rounded-xl" onClick={() => generateReply(t)} disabled={generating === t}>
                        {generating === t && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                        {t === "pro" ? "Professionnelle" : t === "commercial" ? "Commerciale" : "Humoristique"}
                      </Button>
                    ))}
                  </div>
                  {(["pro", "commercial", "humor"] as const).map((t) => reply[t] && (
                    <div key={t} className="rounded-xl bg-primary/5 p-3 text-sm space-y-2">
                      <p className="text-xs font-medium text-primary capitalize">{t === "pro" ? "Professionnelle" : t === "commercial" ? "Commerciale" : "Humoristique"}</p>
                      <p className="whitespace-pre-wrap">{reply[t]}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Button size="sm" variant="ghost" className="rounded-lg h-7" onClick={() => { navigator.clipboard.writeText(reply[t]!); toast.success("Copié"); }}><Copy className="h-3 w-3 mr-1" />Copier</Button>
                        {selected?.source_url && (
                          <Button size="sm" className="rounded-lg h-7" onClick={() => { navigator.clipboard.writeText(reply[t]!); window.open(selected.source_url!, "_blank"); toast.success("Réponse copiée · ouverture de la plateforme"); }}>
                            <ExternalLink className="h-3 w-3 mr-1" />Répondre sur la plateforme
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Interactions detail */}
        <Dialog open={!!interactionsOpen} onOpenChange={() => setInteractionsOpen(null)}>
          <DialogContent className="glass-card rounded-2xl">
            <DialogHeader><DialogTitle>Interactions · {interactionsOpen?.engagement ?? 0}</DialogTitle></DialogHeader>
            {interactionsOpen && (
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground text-xs">Détail des interactions agrégées sur {interactionsOpen.source}</p>
                {Array.isArray(interactionsOpen.interactions) && interactionsOpen.interactions.length > 0 ? (
                  <ul className="space-y-1">
                    {(interactionsOpen.interactions as any[]).map((it, i) => (
                      <li key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="font-medium">{it.author || it.name || "Anonyme"}</span>
                        <Badge variant="outline" className="rounded-md text-xs">{it.type || "interaction"}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="space-y-1.5">
                    <p className="text-xs">Auteur principal : <strong>{interactionsOpen.author}</strong></p>
                    <p className="text-xs">Plateforme : <strong>{interactionsOpen.source}</strong></p>
                    <p className="text-xs">Total engagement : <strong>{interactionsOpen.engagement ?? 0}</strong></p>
                    <p className="text-xs text-muted-foreground italic mt-2">Le détail granulaire des interactions sera disponible avec l'intégration des APIs officielles payantes.</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
