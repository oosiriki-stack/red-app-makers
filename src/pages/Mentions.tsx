import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mentions, getActivePlatforms } from "@/data/mockData";
import { MessageSquare, ThumbsUp, ThumbsDown, Minus, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";

const sentimentConfig = {
  positive: { label: "Positif", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: ThumbsUp },
  neutral: { label: "Neutre", className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400", icon: Minus },
  negative: { label: "Négatif", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: ThumbsDown },
};

export default function Mentions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [selected, setSelected] = useState<typeof mentions[0] | null>(null);

  useEffect(() => {
    if (queryFromUrl) {
      toast.info(`Recherche : "${queryFromUrl}"`);
    }
  }, [queryFromUrl]);

  const activePlatforms = getActivePlatforms();
  
  const filtered = mentions.filter((m) => {
    if (!activePlatforms.includes(m.source)) return false;
    if (sourceFilter !== "all" && m.source !== sourceFilter) return false;
    if (sentimentFilter !== "all" && m.sentiment !== sentimentFilter) return false;
    if (queryFromUrl && !m.content.toLowerCase().includes(queryFromUrl.toLowerCase()) && !m.author.toLowerCase().includes(queryFromUrl.toLowerCase())) return false;
    return true;
  });

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Flux de Mentions</h1>
          <p className="text-muted-foreground">
            Suivi en temps réel — <strong>{filtered.length}</strong> résultat{filtered.length > 1 ? "s" : ""}
            {queryFromUrl && (
              <span> pour « {queryFromUrl} » <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => setSearchParams({})}>Effacer</Button></span>
            )}
          </p>
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
