import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Crown, ThumbsUp, ThumbsDown, Minus, ExternalLink, Filter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Mention = { id: string; source: string; author: string; content: string; sentiment: string; engagement: number; mention_date: string; source_url: string | null };

export default function Influencers() {
  const { user } = useAuth();
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [period, setPeriod] = useState("30");
  const [platform, setPlatform] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      setLoading(true);
      const since = new Date(); since.setDate(since.getDate() - parseInt(period));
      let q = supabase.from("mentions").select("id,source,author,content,sentiment,engagement,mention_date,source_url").eq("user_id", user.id).gte("mention_date", since.toISOString()).limit(1000);
      if (platform !== "all") q = q.eq("source", platform);
      const { data } = await q;
      setMentions((data || []) as any);
      setLoading(false);
    })();
  }, [user, period, platform]);

  const ranked = useMemo(() => {
    const map = new Map<string, { author: string; source: string; count: number; engagement: number; positive: number; negative: number; neutral: number; lastDate: string; lastUrl: string | null; lastContent: string }>();
    for (const m of mentions) {
      const key = `${m.source}::${m.author}`;
      const cur = map.get(key) || { author: m.author, source: m.source, count: 0, engagement: 0, positive: 0, negative: 0, neutral: 0, lastDate: m.mention_date, lastUrl: m.source_url, lastContent: m.content };
      cur.count += 1;
      cur.engagement += m.engagement || 0;
      cur[m.sentiment as "positive" | "negative" | "neutral"] += 1;
      if (new Date(m.mention_date) > new Date(cur.lastDate)) { cur.lastDate = m.mention_date; cur.lastUrl = m.source_url; cur.lastContent = m.content; }
      map.set(key, cur);
    }
    return Array.from(map.values()).sort((a, b) => (b.engagement + b.count * 10) - (a.engagement + a.count * 10)).slice(0, 50);
  }, [mentions]);

  const dominantSentiment = (r: typeof ranked[number]) => r.positive > r.negative ? "positive" : r.negative > r.positive ? "negative" : "neutral";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto pb-24">
      <header>
        <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Influenceurs</h1>
        <p className="text-sm text-muted-foreground mt-1">Top contributeurs qui parlent de votre marque — par engagement et fréquence.</p>
      </header>

      <Card className="glass-card p-3 flex items-center gap-3 flex-wrap">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 derniers jours</SelectItem>
            <SelectItem value="30">30 derniers jours</SelectItem>
            <SelectItem value="90">90 derniers jours</SelectItem>
          </SelectContent>
        </Select>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes plateformes</SelectItem>
            <SelectItem value="x">X (Twitter)</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
            <SelectItem value="blog">Blogs</SelectItem>
            <SelectItem value="google">Google News</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {loading ? (
        <Card className="glass-card p-10 text-center text-muted-foreground">Calcul du classement...</Card>
      ) : ranked.length === 0 ? (
        <Card className="glass-card p-10 text-center">
          <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucune mention sur cette période. Lancez d'abord une veille.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {ranked.map((r, i) => {
            const dom = dominantSentiment(r);
            const SentIcon = dom === "positive" ? ThumbsUp : dom === "negative" ? ThumbsDown : Minus;
            const sentColor = dom === "positive" ? "text-emerald-500" : dom === "negative" ? "text-red-500" : "text-amber-500";
            return (
              <motion.div key={`${r.source}-${r.author}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }}>
                <Card className="glass-card p-4 flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${i === 0 ? "from-amber-400 to-amber-600" : i < 3 ? "from-primary to-orange-600" : "from-muted to-muted-foreground/30"} flex items-center justify-center text-white font-bold`}>
                      #{i + 1}
                    </div>
                    {i === 0 && <Crown className="w-4 h-4 text-amber-500 absolute -top-1 -right-1" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold truncate">{r.author}</span>
                      <Badge variant="outline" className="text-[10px] uppercase">{r.source}</Badge>
                      <SentIcon className={`w-4 h-4 ${sentColor}`} />
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{r.lastContent}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                      <span>{r.count} mention{r.count > 1 ? "s" : ""}</span>
                      <span>·</span>
                      <span>{r.engagement.toLocaleString("fr-FR")} interactions</span>
                      <span>·</span>
                      <span className="text-emerald-500">+{r.positive}</span>
                      <span className="text-amber-500">{r.neutral}</span>
                      <span className="text-red-500">-{r.negative}</span>
                    </div>
                  </div>
                  {r.lastUrl && (
                    <Button asChild variant="ghost" size="icon"><a href={r.lastUrl} target="_blank" rel="noopener"><ExternalLink className="w-4 h-4" /></a></Button>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
