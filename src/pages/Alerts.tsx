import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alerts as alertsData } from "@/data/mockData";
import { AlertTriangle, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";

const severityConfig = {
  critical: { icon: AlertCircle, className: "glass-card border-red-500/20", badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400" },
  warning: { icon: AlertTriangle, className: "glass-card border-orange-500/20", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400" },
  info: { icon: Info, className: "glass-card border-blue-500/20", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400" },
};

export default function Alerts() {
  const [readIds, setReadIds] = useState<Set<number>>(() => {
    const stored = localStorage.getItem("arobase_read_alerts");
    if (stored) {
      try { return new Set(JSON.parse(stored)); } catch {}
    }
    return new Set();
  });

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem("arobase_read_alerts", JSON.stringify([...readIds]));
  }, [readIds]);

  const markAllRead = () => {
    setReadIds(new Set(alertsData.map((a) => a.id)));
    toast.success("Toutes les alertes ont été marquées comme lues");
  };

  const markRead = (id: number) => {
    setReadIds((prev) => new Set(prev).add(id));
    toast.info("Alerte marquée comme lue");
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Centre d'Alertes</h1>
            <p className="text-muted-foreground">Alertes intelligentes et détection de crises</p>
          </div>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={markAllRead}>
            <CheckCircle2 className="h-4 w-4 mr-1" /> Tout marquer comme lu
          </Button>
        </div>

        <div className="space-y-3">
          {alertsData.map((alert) => {
            const config = severityConfig[alert.type];
            const Icon = config.icon;
            const isRead = alert.read || readIds.has(alert.id);
            return (
              <Card key={alert.id} className={`${config.className} rounded-2xl card-hover ${!isRead ? "ring-1 ring-primary/20" : "opacity-75"}`}>
                <CardContent className="p-5 flex items-start gap-4">
                  <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{alert.title}</span>
                      <Badge className={`text-xs border-0 ${config.badge}`}>{alert.type}</Badge>
                      {!isRead && <Badge className="text-xs">Nouveau</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">{alert.time}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="rounded-xl" onClick={() => markRead(alert.id)}>
                    Voir
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AnimatedPage>
  );
}
