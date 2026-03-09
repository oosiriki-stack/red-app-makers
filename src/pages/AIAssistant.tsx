import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, Send, Check, Clock, FileEdit, Copy, Loader2 } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";

const statusConfig = {
  approved: { label: "Approuvé", icon: Check, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "En attente", icon: Clock, className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  draft: { label: "Brouillon", icon: FileEdit, className: "bg-muted text-muted-foreground" },
};

type AIResponse = {
  id: number;
  mention: string;
  response: string;
  tone: string;
  status: "approved" | "pending" | "draft";
  date: string;
};

export default function AIAssistant() {
  const [tone, setTone] = useState("empathique");
  const [input, setInput] = useState("");
  const [generating, setGenerating] = useState(false);
  const [history, setHistory] = useState<AIResponse[]>([]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Réponse copiée dans le presse-papiers");
  };

  const handleApprove = (id: number) => {
    setHistory((prev) => prev.map((r) => r.id === id ? { ...r, status: "approved" as const } : r));
    toast.success("Réponse approuvée avec succès");
  };

  const handleGenerate = () => {
    if (!input.trim()) {
      toast.error("Veuillez entrer un contexte ou une mention");
      return;
    }
    setGenerating(true);
    // Simulated AI response - in production this would call an AI API
    setTimeout(() => {
      const responses = [
        "Merci pour votre retour. Nous prenons en compte vos remarques et travaillons activement à améliorer notre service.",
        "Nous comprenons votre frustration et nous en sommes sincèrement désolés. Notre équipe prend les mesures nécessaires.",
        "Bonjour ! Nous apprécions votre commentaire positif. C'est grâce à des retours comme le vôtre que nous continuons à innover.",
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      const newEntry: AIResponse = {
        id: Date.now(),
        mention: input,
        response,
        tone,
        status: "pending",
        date: new Date().toLocaleDateString("fr-FR"),
      };
      setHistory((prev) => [newEntry, ...prev]);
      setInput("");
      setGenerating(false);
      toast.success("Réponse générée avec succès");
    }, 1500);
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Assistant IA</h1>
          <p className="text-muted-foreground">Générez des réponses contextualisées aux mentions</p>
        </div>

        <Card className="glass-card rounded-2xl border-primary/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-primary" />
              </div>
              Générer une réponse
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Collez une mention ou décrivez le contexte..." value={input} onChange={(e) => setInput(e.target.value)} rows={3} className="rounded-xl" />
            <div className="flex gap-3 flex-wrap">
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger className="w-48 rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="institutionnel">🏛️ Institutionnel</SelectItem>
                  <SelectItem value="commercial">💼 Commercial</SelectItem>
                  <SelectItem value="empathique">💛 Empathique</SelectItem>
                  <SelectItem value="juridique">⚖️ Juridique</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleGenerate} disabled={generating} className="rounded-xl">
                {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                {generating ? "Génération..." : "Générer"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {history.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3">Historique des réponses</h2>
            <div className="space-y-3">
              {history.map((r) => {
                const st = statusConfig[r.status];
                return (
                  <Card key={r.id} className="glass-card rounded-2xl card-hover">
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs rounded-lg">Ton : {r.tone}</Badge>
                        <Badge className={`text-xs border-0 ${st.className}`}>
                          <st.icon className="h-3 w-3 mr-1" /> {st.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground ml-auto">{r.date}</span>
                      </div>
                      <div className="bg-muted/30 rounded-xl p-3">
                        <p className="text-xs text-muted-foreground mb-1">Mention originale :</p>
                        <p className="text-sm italic">"{r.mention}"</p>
                      </div>
                      <p className="text-sm">{r.response}</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-xl" onClick={() => handleCopy(r.response)}>
                          <Copy className="h-3 w-3 mr-1" /> Copier
                        </Button>
                        <Button size="sm" className="rounded-xl" onClick={() => handleApprove(r.id)}>
                          <Check className="h-3 w-3 mr-1" /> Approuver
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {history.length === 0 && (
          <Card className="glass-card rounded-2xl p-8 text-center">
            <p className="text-muted-foreground">Aucune réponse générée pour le moment. Utilisez le formulaire ci-dessus.</p>
          </Card>
        )}
      </div>
    </AnimatedPage>
  );
}
