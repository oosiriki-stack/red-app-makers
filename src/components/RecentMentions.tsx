import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { mentions } from "@/data/mockData";
import { MessageSquare } from "lucide-react";

const sentimentColors = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  neutral: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
  negative: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
};

export function RecentMentions() {
  const recent = mentions.slice(0, 3);

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
              <AvatarFallback className="text-xs bg-muted">{m.avatar}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{m.author}</span>
                <Badge variant="outline" className="text-[10px] shrink-0">{m.source}</Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">{m.content}</p>
            </div>
            <Badge className={`text-[10px] border-0 shrink-0 ${sentimentColors[m.sentiment]}`}>
              {m.sentiment === "positive" ? "+" : m.sentiment === "negative" ? "−" : "~"}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
