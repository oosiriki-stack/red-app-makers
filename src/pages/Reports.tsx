import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { FileText, Download, Calendar, Palette, Plus } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";

const defaultReports = [
  { id: 1, title: "Rapport hebdomadaire — Semaine 6", date: "10 Fév 2026", type: "Hebdomadaire", pages: 12 },
  { id: 2, title: "Rapport mensuel — Janvier 2026", date: "01 Fév 2026", type: "Mensuel", pages: 28 },
  { id: 3, title: "Rapport quotidien — 9 Fév", date: "09 Fév 2026", type: "Quotidien", pages: 5 },
];

const sections = ["Mentions", "Sentiment", "Concurrence", "Alertes", "Tendances"];

export default function Reports() {
  const [reports, setReports] = useState(defaultReports);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [period, setPeriod] = useState("weekly");
  const [format, setFormat] = useState("pdf");
  const [selectedSections, setSelectedSections] = useState<string[]>(["Mentions", "Sentiment"]);

  const toggleSection = (s: string) => {
    setSelectedSections(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);
  };

  const handleGenerate = () => {
    if (!title.trim()) { toast.error("Veuillez saisir un titre"); return; }
    const periodLabel = period === "daily" ? "Quotidien" : period === "weekly" ? "Hebdomadaire" : "Mensuel";
    const newReport = {
      id: Date.now(),
      title: title.trim(),
      date: new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }),
      type: periodLabel,
      pages: Math.floor(Math.random() * 20) + 5,
    };
    setReports(prev => [newReport, ...prev]);
    setDialogOpen(false);
    setTitle("");
    toast.success(`Rapport "${newReport.title}" généré en ${format.toUpperCase()}`);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-light tracking-tight">Rapports</h1>
            <p className="text-muted-foreground">Génération et personnalisation de rapports</p>
          </div>
          <Button className="rounded-xl" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" /> Nouveau rapport
          </Button>
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

      {/* New Report Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card rounded-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau rapport</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Titre du rapport</Label>
              <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex : Rapport mensuel Mars" className="rounded-xl mt-1" />
            </div>
            <div>
              <Label>Périodicité</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Quotidien</SelectItem>
                  <SelectItem value="weekly">Hebdomadaire</SelectItem>
                  <SelectItem value="monthly">Mensuel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Format</Label>
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sections à inclure</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {sections.map(s => (
                  <label key={s} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={selectedSections.includes(s)} onCheckedChange={() => toggleSection(s)} />
                    {s}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button className="rounded-xl" onClick={handleGenerate}>Générer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AnimatedPage>
  );
}
