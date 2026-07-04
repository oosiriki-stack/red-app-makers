import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, ShieldCheck } from "lucide-react";

type Row = {
  id: string;
  actor_email: string | null;
  action: string;
  target: string | null;
  status: string;
  metadata: any;
  created_at: string;
};

const STATUS_COLOR: Record<string, string> = {
  success: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
  error: "bg-red-500/15 text-red-600 border-red-500/30",
  info: "bg-blue-500/15 text-blue-600 border-blue-500/30",
};

export function AdminActivityLog() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any)
      .from("admin_activity_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    setRows((data ?? []) as Row[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = rows.filter((r) => {
    if (!q) return true;
    const s = q.toLowerCase();
    return (
      r.action.toLowerCase().includes(s) ||
      (r.actor_email ?? "").toLowerCase().includes(s) ||
      (r.target ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Journal d'activité
        </CardTitle>
        <div className="flex gap-2">
          <Input
            placeholder="Rechercher (action, email, cible…)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-8 text-xs rounded-lg w-56"
          />
          <Button size="sm" variant="outline" className="rounded-lg" onClick={load} disabled={loading}>
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Aucune activité enregistrée.</p>
        ) : (
          <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
            {filtered.map((r) => (
              <div key={r.id} className="rounded-xl border border-border bg-muted/30 p-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="outline" className={`text-[10px] rounded-md border ${STATUS_COLOR[r.status] ?? ""}`}>
                      {r.status}
                    </Badge>
                    <span className="text-sm font-medium truncate">{r.action}</span>
                    {r.target && <span className="text-xs text-muted-foreground truncate">→ {r.target}</span>}
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(r.created_at).toLocaleString("fr-FR")}
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                  <span>{r.actor_email ?? "—"}</span>
                  {r.metadata && Object.keys(r.metadata).length > 0 && (
                    <span className="font-mono truncate max-w-full">{JSON.stringify(r.metadata)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
