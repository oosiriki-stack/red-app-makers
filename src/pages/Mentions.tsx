import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, ExternalLink, Download, RefreshCw, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { playAlertSound, isSoundEnabled } from "@/lib/sound";

const sentimentConfig = {
  positive: { label: "Positif", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: ThumbsUp },
  neutral: { label: "Neutre", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: Minus },
  negative: { label: "Négatif", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: ThumbsDown },
};

type Mention = {
  id: string;
  source: string;
  author: string;
  avatar: string | null;
  content: string;
  sentiment: string;
  engagement: number | null;
  mention_date: string;
};

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [selected, setSelected] = useState<Mention | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const fetchMentions = async () => {
    if (!user) return;
    setLoading(true);
    let query = supabase.from("mentions").select("*").eq("user_id", user.id).order("mention_date", { ascending: false });
    if (sourceFilter !== "all") query = query.eq("source", sourceFilter);
    if (sentimentFilter !== "all") query = query.eq("sentiment", sentimentFilter);
    if (queryFromUrl) query = query.or(`content.ilike.%${queryFromUrl}%,author.ilike.%${queryFromUrl}%`);

    const { data, error } = await query;
    if (error) toast.error(error.message);
    else setMentions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMentions(); }, [user, sourceFilter, sentimentFilter, queryFromUrl]);

  useRealtimeTable("mentions", user?.id, {
    onInsert: (row) => {
      setMentions((prev) => [row as Mention, ...prev]);
      if (isSoundEnabled()) playAlertSound(row.sentiment === "negative" ? "warning" : "info");
      toast.info(`Nouvelle mention de ${row.author}`, { description: (row.content || "").slice(0, 80) });
    },
    onUpdate: (row) => setMentions((prev) => prev.map((m) => (m.id === row.id ? (row as Mention) : m))),
    onDelete: (row) => setMentions((prev) => prev.filter((m) => m.id !== row.id)),
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMentions();
    setRefreshing(false);
    toast.success("Flux actualisé");
  };

  const runTracker = async () => {
    setTracking(true);
    const { data, error } = await supabase.functions.invoke("track-mentions");
    setTracking(false);
    if (error) return toast.error("Tracker indisponible: " + error.message);
    await fetchMentions();
    toast.success(`${data?.count ?? 0} nouvelle(s) mention(s) collectée(s)`, { description: `Sources: ${(data?.sources_used || []).join(", ") || "flux publics"}` });
  };

  const downloadCSV = () => {
    const header = "ID,Source,Auteur,Contenu,Sentiment,Date,Engagement\n";
    const rows = mentions.map(m => `${m.id},"${m.source}","${m.author}","${m.content.replace(/"/g, '""')}","${m.sentiment}","${m.mention_date}",${m.engagement ?? 0}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "mentions.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const sources = [...new Set(mentions.map(m => m.source))];

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Flux de Mentions</h1>
            <p className="text-muted-foreground">
              Suivi en temps réel — <strong>{mentions.length}</strong> résultat{mentions.length > 1 ? "s" : ""}
              {queryFromUrl && (
                <span> pour « {queryFromUrl} » <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setSearchParams({})}>Effacer</Button></span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="default" size="sm" className="rounded-xl" onClick={runTracker} disabled={tracking}>
              {tracking ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Tracker
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Actualiser
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { downloadCSV(); toast.success("Export CSV téléchargé"); }}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40 rounded-xl"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              {sources.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
            <SelectTrigger className="w-40 rounded-xl"><SelectValue placeholder="Sentiment" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous</SelectItem>
              <SelectItem value="positive">Positif</SelectItem>
              <SelectItem value="neutral">Neutre</SelectItem>
              <SelectItem value="negative">Négatif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          {loading && mentions.length > 0 && <p className="text-center text-xs text-muted-foreground py-2">Synchronisation…</p>}
          {!loading && mentions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucune mention trouvée. Les mentions apparaîtront ici une fois la surveillance active.</p>
          )}
          {mentions.map((mention) => {
            const sc = sentimentConfig[mention.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral;
            const avatarText = mention.avatar || mention.author.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
            return (
              <Card key={mention.id} className="glass-card rounded-2xl cursor-pointer card-hover" onClick={() => setSelected(mention)}>
                <CardContent className="p-5 flex items-start gap-4">
                  <Avatar><AvatarFallback className="bg-muted text-xs">{avatarText}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{mention.author}</span>
                      <Badge variant="outline" className="text-xs rounded-lg">{mention.source}</Badge>
                      <Badge className={`text-xs border-0 ${sc.className}`}>{sc.label}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{new Date(mention.mention_date).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground">{mention.content}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> {mention.engagement ?? 0} interactions
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="glass-card rounded-2xl">
            <DialogHeader><DialogTitle>Détail de la mention</DialogTitle></DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{selected.avatar || selected.author.slice(0, 2)}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium">{selected.author}</p>
                    <p className="text-xs text-muted-foreground">{selected.source} · {new Date(selected.mention_date).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
                <p className="text-sm">{selected.content}</p>
                <div className="flex gap-2">
                  <Badge className={(sentimentConfig[selected.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral).className}>
                    {(sentimentConfig[selected.sentiment as keyof typeof sentimentConfig] || sentimentConfig.neutral).label}
                  </Badge>
                  <Badge variant="outline">{selected.engagement ?? 0} interactions</Badge>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
