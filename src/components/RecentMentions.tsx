import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, BellPlus, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const sentimentColors = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  neutral: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};
const sentimentLabel = { positive: "Positif", neutral: "Neutre", negative: "Négatif" } as const;

type Mention = {
  id: string;
  source: string;
  author: string;
  avatar: string | null;
  content: string;
  sentiment: string;
  source_url?: string | null;
};

export function RecentMentions() {
  const [recent, setRecent] = useState<Mention[]>([]);
  const [creating, setCreating] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const load = () => {
    if (!user) return;
    supabase
      .from("mentions")
      .select("id, source, author, avatar, content, sentiment, source_url")
      .eq("user_id", user.id)
      .order("mention_date", { ascending: false })
      .limit(5)
      .then(({ data }) => {
        if (data) setRecent(data as Mention[]);
      });
  };

  useEffect(load, [user]);

  const createAlert = async (m: Mention) => {
    if (!user) return;
    setCreating(m.id);
    const severity = m.sentiment === "negative" ? "critical" : m.sentiment === "neutral" ? "warning" : "info";
    const { error } = await supabase.from("alerts").insert({
      user_id: user.id,
      type: severity,
      title: `Alerte sur mention de ${m.author}`,
      description: m.content.slice(0, 240),
      platform: m.source,
      is_read: false,
    });
    setCreating(null);
    if (error) return toast.error(error.message);
    toast.success("Alerte créée", { description: "Retrouvez-la dans le centre d'alertes." });
  };

  if (recent.length === 0) {
    return (
      <Card className="glass-card rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 font-bold">
            <MessageSquare className="h-4 w-4 text-primary" /> Mentions récentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Aucune mention collectée pour le moment.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base flex items-center gap-2 font-bold">
          <MessageSquare className="h-4 w-4 text-primary" /> Mentions récentes
        </CardTitle>
        <Button variant="ghost" size="sm" className="rounded-lg h-7 text-xs font-semibold" onClick={() => navigate("/mentions")}>
          Tout voir
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {recent.map((m) => (
          <div key={m.id} className="group flex items-start gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-colors">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="text-xs bg-muted font-bold">
                {m.avatar || m.author.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold truncate">{m.author}</span>
                <Badge variant="outline" className="text-[10px] shrink-0 font-semibold">{m.source}</Badge>
                <Badge className={`text-[10px] border-0 shrink-0 font-semibold ${sentimentColors[m.sentiment as keyof typeof sentimentColors] || sentimentColors.neutral}`}>
                  {sentimentLabel[m.sentiment as keyof typeof sentimentLabel] ?? m.sentiment}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5 font-medium">{m.content}</p>
              <div className="flex gap-1.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-lg h-6 px-2 text-[11px] gap-1 font-semibold"
                  disabled={creating === m.id}
                  onClick={() => createAlert(m)}
                >
                  <BellPlus className="h-3 w-3" />Créer une alerte
                </Button>
                {m.source_url && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-lg h-6 px-2 text-[11px] gap-1 font-semibold"
                    onClick={() => window.open(m.source_url!, "_blank")}
                  >
                    <ExternalLink className="h-3 w-3" />Voir
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
