import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const sentimentColors = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  neutral: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

type Mention = {
  id: string;
  source: string;
  author: string;
  avatar: string | null;
  content: string;
  sentiment: string;
};

export function RecentMentions() {
  const [recent, setRecent] = useState<Mention[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    supabase.from("mentions").select("id, source, author, avatar, content, sentiment")
      .eq("user_id", user.id).order("mention_date", { ascending: false }).limit(3)
      .then(({ data }) => { if (data) setRecent(data); });
  }, [user]);

  if (recent.length === 0) return null;

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" /> Dernières mentions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recent.map((m) => (
          <div key={m.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs bg-muted">{m.avatar || m.author.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{m.author}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">{m.source}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{m.content}</p>
            </div>
            <Badge className={`text-[10px] border-0 shrink-0 ${sentimentColors[m.sentiment as keyof typeof sentimentColors] || sentimentColors.neutral}`}>
              {m.sentiment === "positive" ? "+" : m.sentiment === "negative" ? "−" : "~"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
