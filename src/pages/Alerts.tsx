import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { playAlertSound, isSoundEnabled } from "@/lib/sound";

const severityConfig = {
  critical: { icon: AlertCircle, label: "Critique", className: "glass-card border-red-500/20", badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400" },
  warning: { icon: AlertTriangle, label: "Warning", className: "glass-card border-orange-500/20", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400" },
  info: { icon: Info, label: "Info", className: "glass-card border-blue-500/20", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400" },
};

type Alert = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  is_read: boolean;
  created_at: string;
};

type SeverityType = "all" | "critical" | "warning" | "info";

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<SeverityType>("all");
  const { user } = useAuth();

  const fetchAlerts = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from("alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setAlerts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [user]);

  useRealtimeTable("alerts", user?.id, {
    onInsert: (row) => {
      setAlerts((prev) => [row as Alert, ...prev]);
      if (isSoundEnabled()) {
        const sev = row.type === "critical" ? "critical" : row.type === "warning" ? "warning" : "info";
        playAlertSound(sev);
      }
      toast[row.type === "critical" ? "error" : row.type === "warning" ? "warning" : "info"](row.title, { description: row.description ?? "" });
    },
    onUpdate: (row) => setAlerts((prev) => prev.map((a) => (a.id === row.id ? (row as Alert) : a))),
    onDelete: (row) => setAlerts((prev) => prev.filter((a) => a.id !== row.id)),
  });

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("alerts").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setAlerts(prev => prev.map(a => ({ ...a, is_read: true })));
    toast.success("Toutes les alertes ont été marquées comme lues");
  };

  const markRead = async (id: string) => {
    await supabase.from("alerts").update({ is_read: true }).eq("id", id);
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_read: true } : a));
    toast.info("Alerte marquée comme lue");
  };

  const counts = {
    critical: alerts.filter(a => a.type === "critical").length,
    warning: alerts.filter(a => a.type === "warning").length,
    info: alerts.filter(a => a.type === "info").length,
  };

  const filtered = severityFilter === "all" ? alerts : alerts.filter(a => a.type === severityFilter);

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Centre d'Alertes</h1>
            <p className="text-muted-foreground">Alertes intelligentes et détection de crises</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={markAllRead}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Tout marquer comme lu
          </Button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant={severityFilter === "all" ? "default" : "outline"} size="sm" className="rounded-xl" onClick={() => setSeverityFilter("all")}>
            Toutes ({alerts.length})
          </Button>
          <Button variant={severityFilter === "critical" ? "default" : "outline"} size="sm" className="rounded-xl gap-1" onClick={() => setSeverityFilter("critical")}>
            <AlertCircle className="h-3 w-3" /> Critiques ({counts.critical})
          </Button>
          <Button variant={severityFilter === "warning" ? "default" : "outline"} size="sm" className="rounded-xl gap-1" onClick={() => setSeverityFilter("warning")}>
            <AlertTriangle className="h-3 w-3" /> Warnings ({counts.warning})
          </Button>
          <Button variant={severityFilter === "info" ? "default" : "outline"} size="sm" className="rounded-xl gap-1" onClick={() => setSeverityFilter("info")}>
            <Info className="h-3 w-3" /> Infos ({counts.info})
          </Button>
        </div>

        <div className="space-y-3">
          {loading && alerts.length > 0 && <p className="text-center text-xs text-muted-foreground py-2">Synchronisation…</p>}
          {!loading && filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucune alerte. Tout est calme ! 🎉</p>
          )}
          {filtered.map((alert) => {
            const config = severityConfig[alert.type as keyof typeof severityConfig] || severityConfig.info;
            const Icon = config.icon;
            return (
              <Card key={alert.id} className={`${config.className} rounded-2xl card-hover ${!alert.is_read ? "ring-1 ring-primary/20" : "opacity-75"}`}>
                <CardContent className="p-5 flex items-start gap-4">
                  <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{alert.title}</span>
                      <Badge className={`text-xs border-0 ${config.badge}`}>{alert.type}</Badge>
                      {!alert.is_read && <Badge className="text-xs">Nouveau</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">{new Date(alert.created_at).toLocaleDateString("fr-FR")}</span>
                  </div>
                  {!alert.is_read && (
                    <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => markRead(alert.id)}>
                      Marquer lu
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AnimatedPage>
  );
}
