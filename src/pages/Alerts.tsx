import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { alerts } from "@/data/mockData";
import { AlertTriangle, Info, AlertCircle, CheckCircle2 } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";

const severityConfig = {
  critical: { icon: AlertCircle, className: "border-red-500/30 bg-red-50 dark:bg-red-950/20", badge: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-400" },
  warning: { icon: AlertTriangle, className: "border-orange-500/30 bg-orange-50 dark:bg-orange-950/20", badge: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-400" },
  info: { icon: Info, className: "border-blue-500/30 bg-blue-50 dark:bg-blue-950/20", badge: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-400" },
};

export default function Alerts() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Centre d'Alertes</h1>
            <p className="text-muted-foreground">Alertes intelligentes et détection de crises</p>
          </div>
          <Button variant="outline" size="sm">
            <CheckCircle2 className="h-4 w-4 mr-1" /> Tout marquer comme lu
          </Button>
        </div>

        <div className="space-y-3">
          {alerts.map((alert) => {
            const config = severityConfig[alert.type];
            const Icon = config.icon;
            return (
              <Card key={alert.id} className={`${config.className} ${!alert.read ? "ring-1 ring-primary/20" : ""}`}>
                <CardContent className="p-4 flex items-start gap-4">
                  <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{alert.title}</span>
                      <Badge className={`text-xs border-0 ${config.badge}`}>{alert.type}</Badge>
                      {!alert.read && <Badge className="text-xs">Nouveau</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                    <span className="text-xs text-muted-foreground mt-2 block">{alert.time}</span>
                  </div>
                  <Button variant="ghost" size="sm">Voir</Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AnimatedPage>
  );
}
