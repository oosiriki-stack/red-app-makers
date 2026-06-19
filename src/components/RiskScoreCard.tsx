import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, AlertTriangle, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function RiskScoreCard() {
  const { user } = useAuth();
  const [risk, setRisk] = useState<number | null>(null);
  const [neg, setNeg] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await (supabase as any)
        .from("anomaly_baselines")
        .select("risk_score, negative_count, total_count")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setRisk(data.risk_score ?? 0);
        setNeg(data.negative_count ?? 0);
        setTotal(data.total_count ?? 0);
      } else {
        setRisk(0);
      }
    })();
  }, [user]);

  const level =
    risk === null ? "—" :
    risk >= 70 ? "Critique" :
    risk >= 40 ? "Élevé" :
    risk >= 20 ? "Modéré" : "Faible";
  const color =
    risk === null ? "text-muted-foreground" :
    risk >= 70 ? "text-red-500" :
    risk >= 40 ? "text-orange-500" :
    risk >= 20 ? "text-yellow-500" : "text-green-500";
  const Icon = risk !== null && risk >= 40 ? AlertTriangle : risk !== null && risk >= 20 ? TrendingUp : Shield;

  return (
    <Card className="glass-card hover-3d h-full rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className={`h-3.5 w-3.5 ${color}`} />
          </div>
          Risque réputationnel
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color}`}>{risk ?? "—"}<span className="text-sm text-muted-foreground">/100</span></div>
        <p className="text-xs text-muted-foreground">{level} · {neg}/{total} négatives (1h)</p>
      </CardContent>
    </Card>
  );
}
