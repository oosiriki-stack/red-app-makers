import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, AlertCircle, CheckCircle2, ThumbsUp, MessageCircle, Eye, Flag, User, Search, Radio } from "lucide-react";
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

const REACTIONS = [
  { key: "acknowledged", label: "Vu", icon: Eye },
  { key: "handling", label: "Je m'en occupe", icon: ThumbsUp },
  { key: "escalated", label: "Escalader", icon: Flag },
  { key: "respond", label: "Répondre", icon: MessageCircle },
];

type Alert = {
  id: string; type: string; title: string; description: string | null;
  is_read: boolean; created_at: string; reaction?: string | null;
  query?: string | null; requester?: string | null; platform?: string | null;
};

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [severityFilter, setSeverityFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const { user } = useAuth();

  const fetchAlerts = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("alerts").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setAlerts((data || []) as Alert[]);
  };

  useEffect(() => { fetchAlerts(); }, [user]);

  useRealtimeTable("alerts", user?.id, {
    onInsert: (row) => {
      setAlerts((prev) => [row as Alert, ...prev]);
      if (isSoundEnabled()) playAlertSound((row.type === "critical" ? "critical" : row.type === "warning" ? "warning" : "info") as any);
      toast[row.type === "critical" ? "error" : row.type === "warning" ? "warning" : "info"](row.title, { description: row.description ?? "" });
    },
    onUpdate: (row) => setAlerts((prev) => prev.map((a) => (a.id === row.id ? (row as Alert) : a))),
    onDelete: (row) => setAlerts((prev) => prev.filter((a) => a.id !== row.id)),
  });

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("alerts").update({ is_read: true }).eq("user_id", user.id).eq("is_read", false);
    setAlerts((prev) => prev.map((a) => ({ ...a, is_read: true })));
    toast.success("Toutes les alertes marquées comme lues");
  };

  const markRead = async (id: string) => {
    await supabase.from("alerts").update({ is_read: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
  };

  const react = async (id: string, reaction: string) => {
    await supabase.from("alerts").update({ reaction, is_read: true }).eq("id", id);
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, reaction, is_read: true } : a)));
    toast.success(`Réaction : ${REACTIONS.find((r) => r.key === reaction)?.label}`);
  };

  const counts = {
    critical: alerts.filter((a) => a.type === "critical").length,
    warning: alerts.filter((a) => a.type === "warning").length,
    info: alerts.filter((a) => a.type === "info").length,
  };
  const unread = alerts.filter((a) => !a.is_read).length;
  const filtered = severityFilter === "all" ? alerts : alerts.filter((a) => a.type === severityFilter);

  return (
    <AnimatedPage>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight">Centre d'Alertes</h1>
            <p className="text-xs md:text-sm text-muted-foreground">{unread} non lue{unread > 1 ? "s" : ""} · {alerts.length} totales</p>
          </div>
          {unread > 0 && (
            <Button variant="outline" size="sm" className="rounded-xl" onClick={markAllRead}>
              <CheckCircle2 className="h-4 w-4 mr-1" />Tout marquer comme lu
            </Button>
          )}
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {([
            { key: "all", label: "Toutes", count: alerts.length, icon: null },
            { key: "critical", label: "Critiques", count: counts.critical, icon: AlertCircle },
            { key: "warning", label: "Warnings", count: counts.warning, icon: AlertTriangle },
            { key: "info", label: "Infos", count: counts.info, icon: Info },
          ] as const).map((f) => {
            const Icon = f.icon;
            return (
              <Button key={f.key} variant={severityFilter === f.key ? "default" : "outline"} size="sm" className="rounded-xl gap-1" onClick={() => setSeverityFilter(f.key as any)}>
                {Icon && <Icon className="h-3 w-3" />}{f.label} ({f.count})
              </Button>
            );
          })}
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && <p className="text-center text-muted-foreground py-8 text-sm">Aucune alerte. Tout est calme ! 🎉</p>}
          {filtered.map((alert) => {
            const config = severityConfig[alert.type as keyof typeof severityConfig] || severityConfig.info;
            const Icon = config.icon;
            return (
              <Card key={alert.id} className={`${config.className} rounded-2xl ${!alert.is_read ? "ring-1 ring-primary/20" : "opacity-80"}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-medium text-sm">{alert.title}</span>
                        <Badge className={`text-[10px] border-0 ${config.badge}`}>{alert.type}</Badge>
                        {!alert.is_read && <Badge className="text-[10px]">Nouveau</Badge>}
                        {alert.reaction && <Badge variant="outline" className="text-[10px]">{REACTIONS.find((r) => r.key === alert.reaction)?.label}</Badge>}
                      </div>
                      {alert.description && <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>}
                      {(alert.requester || alert.query || alert.platform) && (
                        <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-1.5 text-xs">
                          <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1">
                            <User className="h-3 w-3 text-primary shrink-0" />
                            <span className="text-muted-foreground">Émetteur :</span>
                            <span className="font-medium truncate">{alert.requester || "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1">
                            <Search className="h-3 w-3 text-primary shrink-0" />
                            <span className="text-muted-foreground">Requête :</span>
                            <span className="font-medium truncate">{alert.query ? `« ${alert.query} »` : "—"}</span>
                          </div>
                          <div className="flex items-center gap-1.5 rounded-lg bg-muted/40 px-2 py-1">
                            <Radio className="h-3 w-3 text-primary shrink-0" />
                            <span className="text-muted-foreground">Plateforme :</span>
                            <span className="font-medium truncate">{alert.platform || "—"}</span>
                          </div>
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground mt-1.5 block">{new Date(alert.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                    {!alert.is_read && <Button variant="ghost" size="sm" className="rounded-lg shrink-0" onClick={() => markRead(alert.id)}>Lu</Button>}
                  </div>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {REACTIONS.map((r) => {
                      const RI = r.icon;
                      return (
                        <Button key={r.key} size="sm" variant={alert.reaction === r.key ? "default" : "outline"} className="rounded-lg h-7 text-xs" onClick={() => react(alert.id, r.key)}>
                          <RI className="h-3 w-3 mr-1" />{r.label}
                        </Button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AnimatedPage>
  );
}
