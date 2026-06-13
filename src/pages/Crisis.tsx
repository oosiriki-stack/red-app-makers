import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Loader2, Megaphone, Target, ListChecks, Copy, Download, Printer, Sparkles } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Mode = "message" | "strategy" | "plan";

const PROMPTS: Record<Mode, (ctx: string, sit: string) => string> = {
  message: (ctx, sit) => `Rédige un MESSAGE OFFICIEL de crise pour la marque ci-dessous, prêt à être publié (presse + réseaux sociaux). Ton professionnel, empathique, transparent, en français. Structure: 1) Reconnaissance des faits, 2) Excuses sincères si nécessaire, 3) Actions immédiates prises, 4) Engagement et prochaines étapes, 5) Contact.\n\nContexte marque: ${ctx}\nSituation de crise: ${sit}`,
  strategy: (ctx, sit) => `Élabore une STRATÉGIE DE RÉPONSE complète à cette crise e-réputation. Format markdown avec sections: 1) Analyse de la crise (niveau gravité 1-5, audience touchée, risques), 2) Objectifs de réponse, 3) Messages clés (3-5), 4) Porte-parole recommandés, 5) Canaux prioritaires (par ordre), 6) Do & Don't, 7) KPIs de suivi 48h/7j.\n\nContexte marque: ${ctx}\nSituation: ${sit}`,
  plan: (ctx, sit) => `Construis un PLAN DE COMMUNICATION DE CRISE détaillé sur 72h. Format tableau markdown avec colonnes: Horaire | Action | Canal | Responsable | Livrable. Couvre H+0 à H+72. Inclus aussi: cellule de crise, briefing interne, FAQ presse (5 questions/réponses), modèles de réponses pour commentaires négatifs (3 variantes), et plan de suivi post-crise.\n\nContexte marque: ${ctx}\nSituation: ${sit}`,
};

const TITLES: Record<Mode, string> = {
  message: "Message officiel",
  strategy: "Stratégie de réponse",
  plan: "Plan de communication",
};

export default function Crisis() {
  const [mode, setMode] = useState<Mode>("message");
  const [brand, setBrand] = useState("");
  const [situation, setSituation] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!brand.trim() || !situation.trim()) { toast.error("Marque et situation requises"); return; }
    setLoading(true); setOutput("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/focus-gpt`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: [{ role: "user", content: PROMPTS[mode](brand, situation) }], context: `Module: Gestion de crise — ${TITLES[mode]}` }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "", acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) { acc += delta; setOutput(acc); }
          } catch {}
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur génération");
    } finally {
      setLoading(false);
    }
  };

  const copy = () => { navigator.clipboard.writeText(output); toast.success("Copié"); };
  const download = () => {
    const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `crise-${mode}-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const print = () => {
    const w = window.open("", "_blank", "width=800,height=1000");
    if (!w) return;
    w.document.write(`<html><head><title>Focus — ${TITLES[mode]}</title><style>body{font-family:system-ui;padding:32px;line-height:1.6;color:#222;max-width:780px;margin:auto}h1{color:#E5A100;border-bottom:2px solid #E5A100;padding-bottom:8px}pre{white-space:pre-wrap;font-family:inherit;font-size:14px}.foot{color:#888;font-size:11px;margin-top:32px;border-top:1px solid #eee;padding-top:8px}</style></head><body><h1>Focus — ${TITLES[mode]}</h1><p><strong>Marque:</strong> ${brand}<br/><strong>Situation:</strong> ${situation}</p><pre>${output.replace(/</g, "&lt;")}</pre><div class="foot">Généré par Focus · ${new Date().toLocaleString("fr-FR")}</div></body></html>`);
    w.document.close(); w.focus(); w.print();
  };

  const icons = { message: Megaphone, strategy: Target, plan: ListChecks };
  const Icon = icons[mode];

  return (
    <AnimatedPage>
      <div className="space-y-4 max-w-4xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/30">
            <AlertTriangle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-light tracking-tight flex items-center gap-2">Gérer une crise <Sparkles className="w-4 h-4 text-primary" /></h1>
            <p className="text-[11px] text-muted-foreground">Génération assistée par IA · Message · Stratégie · Plan</p>
          </div>
        </div>

        <Card className="glass-card rounded-2xl">
          <CardContent className="p-4 space-y-3">
            <div>
              <Label>Marque / Organisation *</Label>
              <Input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex: Focus SARL" className="rounded-xl" />
            </div>
            <div>
              <Label>Description détaillée de la crise *</Label>
              <Textarea value={situation} onChange={(e) => setSituation(e.target.value)} rows={3} className="rounded-xl" placeholder="Décrivez les faits, la viralité, les canaux, l'audience touchée..." />
            </div>
          </CardContent>
        </Card>

        <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
          <TabsList className="w-full rounded-xl">
            <TabsTrigger value="message" className="flex-1 rounded-lg gap-1"><Megaphone className="h-4 w-4" />Message officiel</TabsTrigger>
            <TabsTrigger value="strategy" className="flex-1 rounded-lg gap-1"><Target className="h-4 w-4" />Stratégie</TabsTrigger>
            <TabsTrigger value="plan" className="flex-1 rounded-lg gap-1"><ListChecks className="h-4 w-4" />Plan comm.</TabsTrigger>
          </TabsList>

          {(["message", "strategy", "plan"] as Mode[]).map((m) => (
            <TabsContent key={m} value={m}>
              <Card className="glass-card rounded-2xl">
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center gap-2"><Icon className="w-4 h-4 text-primary" />{TITLES[m]}</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={generate} disabled={loading} className="w-full rounded-xl">
                    {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Génération en cours...</> : <><Sparkles className="w-4 h-4 mr-2" />Générer avec FocusGPT</>}
                  </Button>
                  {output && (
                    <>
                      <div className="rounded-xl bg-muted/40 p-4 text-sm whitespace-pre-wrap max-h-[480px] overflow-y-auto">{output}</div>
                      <div className="flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={copy}><Copy className="w-3 h-3 mr-1" />Copier</Button>
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={download}><Download className="w-3 h-3 mr-1" />Télécharger</Button>
                        <Button size="sm" variant="outline" className="rounded-xl" onClick={print}><Printer className="w-3 h-3 mr-1" />Imprimer</Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AnimatedPage>
  );
}
