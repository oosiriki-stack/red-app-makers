import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";

const LANG_LABEL: Record<string, { flag: string; label: string }> = {
  fr: { flag: "🇫🇷", label: "Français" },
  en: { flag: "🇬🇧", label: "English" },
  es: { flag: "🇪🇸", label: "Español" },
  pt: { flag: "🇵🇹", label: "Português" },
  ar: { flag: "🇸🇦", label: "العربية" },
  wo: { flag: "🇸🇳", label: "Wolof" },
  bm: { flag: "🇲🇱", label: "Bambara" },
  ln: { flag: "🇨🇩", label: "Lingala" },
  de: { flag: "🇩🇪", label: "Deutsch" },
  it: { flag: "🇮🇹", label: "Italiano" },
  unknown: { flag: "🌐", label: "Autre" },
};

export function MentionsByLanguageCard() {
  const { user } = useAuth();
  const [rows, setRows] = useState<{ code: string; count: number }[]>([]);
  const [total, setTotal] = useState(0);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mentions")
      .select("language")
      .eq("user_id", user.id)
      .limit(5000);
    const counts: Record<string, number> = {};
    let t = 0;
    for (const r of (data ?? []) as any[]) {
      const code = (r.language || "unknown").toString().toLowerCase().slice(0, 2) || "unknown";
      counts[code] = (counts[code] ?? 0) + 1;
      t++;
    }
    const sorted = Object.entries(counts)
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
    setRows(sorted);
    setTotal(t);
  };

  useEffect(() => { load(); }, [user]);
  useRealtimeTable("mentions", user?.id, { onInsert: () => load(), onUpdate: () => load() });

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
            <Languages className="h-3.5 w-3.5 text-primary" />
          </div>
          Mentions par langue
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        {total === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            Aucune mention analysée pour le moment.
          </p>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const info = LANG_LABEL[r.code] ?? LANG_LABEL.unknown;
              const pct = Math.round((r.count / total) * 100);
              return (
                <div key={r.code} className="flex items-center gap-3">
                  <span className="text-lg w-6 text-center">{info.flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium truncate">{info.label}</span>
                      <span className="text-muted-foreground">{r.count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
