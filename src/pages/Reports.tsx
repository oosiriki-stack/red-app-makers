import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, Palette } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";

const reports = [
  { id: 1, title: "Rapport hebdomadaire — Semaine 6", date: "10 Fév 2026", type: "Hebdomadaire", pages: 12 },
  { id: 2, title: "Rapport mensuel — Janvier 2026", date: "01 Fév 2026", type: "Mensuel", pages: 28 },
  { id: 3, title: "Rapport quotidien — 9 Fév", date: "09 Fév 2026", type: "Quotidien", pages: 5 },
];

export default function Reports() {
  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Rapports</h1>
            <p className="text-muted-foreground">Génération et personnalisation de rapports</p>
          </div>
          <Button className="rounded-xl" onClick={() => toast.info("Ouverture du configurateur de rapport...")}><FileText className="h-4 w-4 mr-2" /> Nouveau rapport</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="glass-card rounded-2xl p-5 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <span className="font-medium text-sm">Périodicité</span>
            <Select defaultValue="weekly">
              <SelectTrigger className="w-full rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Quotidien</SelectItem>
                <SelectItem value="weekly">Hebdomadaire</SelectItem>
                <SelectItem value="monthly">Mensuel</SelectItem>
              </SelectContent>
            </Select>
          </Card>
          <Card className="glass-card rounded-2xl p-5 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <span className="font-medium text-sm">Personnalisation</span>
            <p className="text-xs text-muted-foreground text-center">Logo, couleurs et mise en page configurables</p>
          </Card>
          <Card className="glass-card rounded-2xl p-5 flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <span className="font-medium text-sm">Export PDF</span>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast.success("Téléchargement du dernier rapport lancé")}>Télécharger le dernier</Button>
          </Card>
        </div>

        <div className="space-y-3">
          {reports.map((r) => (
            <Card key={r.id} className="glass-card rounded-2xl card-hover">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{r.title}</p>
                  <p className="text-xs text-muted-foreground">{r.date} · {r.pages} pages</p>
                </div>
                <Badge variant="outline" className="rounded-lg">{r.type}</Badge>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast.success(`Téléchargement de "${r.title}" lancé`)}><Download className="h-4 w-4" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AnimatedPage>
  );
}
