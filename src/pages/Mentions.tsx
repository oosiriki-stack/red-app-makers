import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mentions, getActivePlatforms } from "@/data/mockData";
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, ExternalLink, Download, RefreshCw, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";

const sentimentConfig = {
  positive: { label: "Positif", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: ThumbsUp },
  neutral: { label: "Neutre", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: Minus },
  negative: { label: "Négatif", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: ThumbsDown },
};

function downloadCSV(data: typeof mentions, filename: string) {
  const header = "ID,Source,Auteur,Contenu,Sentiment,Date,Engagement\n";
  const rows = data.map(m => `${m.id},"${m.source}","${m.author}","${m.content.replace(/"/g, '""')}","${m.sentiment}","${m.date}",${m.engagement}`).join("\n");
  const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [selected, setSelected] = useState<typeof mentions[0] | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [extraMentions, setExtraMentions] = useState<typeof mentions>([]);

  useEffect(() => {
    if (queryFromUrl) {
      toast.info(`Recherche : "${queryFromUrl}"`);
    }
  }, [queryFromUrl]);

  const activePlatforms = getActivePlatforms();
  const allMentions = [...extraMentions, ...mentions];
  
  const filtered = allMentions.filter((m) => {
    if (!activePlatforms.includes(m.source)) return false;
    if (sourceFilter !== "all" && m.source !== sourceFilter) return false;
    if (sentimentFilter !== "all" && m.sentiment !== sentimentFilter) return false;
    if (queryFromUrl && !m.content.toLowerCase().includes(queryFromUrl.toLowerCase()) && !m.author.toLowerCase().includes(queryFromUrl.toLowerCase())) return false;
    return true;
  });

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      const sources = activePlatforms.length > 0 ? activePlatforms : ["X"];
      const sentiments = ["positive", "neutral", "negative"] as const;
      const newMention = {
        id: Date.now(),
        source: sources[Math.floor(Math.random() * sources.length)],
        author: "Nouveau Utilisateur",
        avatar: "NU",
        content: "Nouvelle mention détectée en temps réel — simulation d'actualisation.",
        sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
        date: "À l'instant",
        engagement: Math.floor(Math.random() * 500),
      };
      setExtraMentions(prev => [newMention, ...prev]);
      setRefreshing(false);
      toast.success("Flux actualisé — 1 nouvelle mention");
    }, 1000);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Flux de Mentions</h1>
            <p className="text-muted-foreground">
              Suivi en temps réel — <strong>{filtered.length}</strong> résultat{filtered.length > 1 ? "s" : ""}
              {queryFromUrl && (
                <span> pour « {queryFromUrl} » <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setSearchParams({})}>Effacer</Button></span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-xl" onClick={handleRefresh} disabled={refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-1" />}
              Actualiser
            </Button>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => { downloadCSV(filtered, "mentions.csv"); toast.success("Export CSV téléchargé"); }}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-40 rounded-xl"><SelectValue placeholder="Source" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les sources</SelectItem>
              {activePlatforms.map((p) => (
                <SelectItem key={p} value={p}>{p}</SelectItem>
              ))}
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
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucun résultat trouvé.</p>
          )}
          {filtered.map((mention) => {
            const sc = sentimentConfig[mention.sentiment];
            return (
              <Card key={mention.id} className="glass-card rounded-2xl cursor-pointer card-hover" onClick={() => setSelected(mention)}>
                <CardContent className="p-5 flex items-start gap-4">
                  <Avatar>
                    <AvatarFallback className="bg-muted text-xs">{mention.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{mention.author}</span>
                      <Badge variant="outline" className="text-xs rounded-lg">{mention.source}</Badge>
                      <Badge className={`text-xs border-0 ${sc.className}`}>{sc.label}</Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{mention.date}</span>
                    </div>
                    <p className="text-sm mt-1 text-muted-foreground">{mention.content}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <MessageSquare className="h-3 w-3" /> {mention.engagement} interactions
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
          <DialogContent className="glass-card rounded-2xl">
            <DialogHeader>
              <DialogTitle>Détail de la mention</DialogTitle>
            </DialogHeader>
            {selected && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{selected.avatar}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium">{selected.author}</p>
                    <p className="text-xs text-muted-foreground">{selected.source} · {selected.date}</p>
                  </div>
                </div>
                <p className="text-sm">{selected.content}</p>
                <div className="flex gap-2">
                  <Badge className={sentimentConfig[selected.sentiment].className}>
                    {sentimentConfig[selected.sentiment].label}
                  </Badge>
                  <Badge variant="outline">{selected.engagement} interactions</Badge>
                </div>
                <Button className="w-full rounded-xl" variant="outline" onClick={() => toast.info(`Redirection vers ${selected.source}...`)}>
                  <ExternalLink className="h-4 w-4 mr-2" /> Voir sur {selected.source}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
