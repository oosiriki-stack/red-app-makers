import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, Palette } from "lucide-react";

const reports = [
  { id: 1, title: "Rapport hebdomadaire — Semaine 6", date: "10 Fév 2026", type: "Hebdomadaire", pages: 12 },
  { id: 2, title: "Rapport mensuel — Janvier 2026", date: "01 Fév 2026", type: "Mensuel", pages: 28 },
  { id: 3, title: "Rapport quotidien — 9 Fév", date: "09 Fév 2026", type: "Quotidien", pages: 5 },
];

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
          <p className="text-muted-foreground">Génération et personnalisation de rapports</p>
        </div>
        <Button><FileText className="h-4 w-4 mr-2" /> Nouveau rapport</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 flex flex-col items-center gap-2">
          <Calendar className="h-8 w-8 text-primary" />
          <span className="font-medium text-sm">Périodicité</span>
          <Select defaultValue="weekly">
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Quotidien</SelectItem>
              <SelectItem value="weekly">Hebdomadaire</SelectItem>
              <SelectItem value="monthly">Mensuel</SelectItem>
            </SelectContent>
          </Select>
        </Card>
        <Card className="p-4 flex flex-col items-center gap-2">
          <Palette className="h-8 w-8 text-primary" />
          <span className="font-medium text-sm">Personnalisation</span>
          <p className="text-xs text-muted-foreground text-center">Logo, couleurs et mise en page configurables</p>
        </Card>
        <Card className="p-4 flex flex-col items-center gap-2">
          <Download className="h-8 w-8 text-primary" />
          <span className="font-medium text-sm">Export PDF</span>
          <Button variant="outline" size="sm">Télécharger le dernier</Button>
        </Card>
      </div>

      <div className="space-y-3">
        {reports.map((r) => (
          <Card key={r.id}>
            <CardContent className="p-4 flex items-center gap-4">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <div className="flex-1">
                <p className="font-medium text-sm">{r.title}</p>
                <p className="text-xs text-muted-foreground">{r.date} · {r.pages} pages</p>
              </div>
              <Badge variant="outline">{r.type}</Badge>
              <Button variant="outline" size="sm"><Download className="h-4 w-4" /></Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
