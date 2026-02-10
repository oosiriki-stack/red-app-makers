import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { aiResponses } from "@/data/mockData";
import { Bot, Send, Check, Clock, FileEdit, Copy } from "lucide-react";

const statusConfig = {
  approved: { label: "Approuvé", icon: Check, className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" },
  pending: { label: "En attente", icon: Clock, className: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400" },
  draft: { label: "Brouillon", icon: FileEdit, className: "bg-muted text-muted-foreground" },
};

export default function AIAssistant() {
  const [tone, setTone] = useState("empathique");
  const [input, setInput] = useState("");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assistant IA</h1>
        <p className="text-muted-foreground">Générez des réponses contextualisées aux mentions</p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" /> Générer une réponse
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Collez une mention ou décrivez le contexte pour générer une réponse..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
          />
          <div className="flex gap-3 flex-wrap">
            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="institutionnel">🏛️ Institutionnel</SelectItem>
                <SelectItem value="commercial">💼 Commercial</SelectItem>
                <SelectItem value="empathique">💛 Empathique</SelectItem>
                <SelectItem value="juridique">⚖️ Juridique</SelectItem>
              </SelectContent>
            </Select>
            <Button>
              <Send className="h-4 w-4 mr-2" /> Générer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-lg font-semibold mb-3">Historique des réponses</h2>
        <div className="space-y-3">
          {aiResponses.map((r) => {
            const st = statusConfig[r.status];
            return (
              <Card key={r.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">Ton : {r.tone}</Badge>
                    <Badge className={`text-xs border-0 ${st.className}`}>
                      <st.icon className="h-3 w-3 mr-1" /> {st.label}
                    </Badge>
                    <span className="text-xs text-muted-foreground ml-auto">{r.date}</span>
                  </div>
                  <div className="bg-muted/50 rounded-md p-3">
                    <p className="text-xs text-muted-foreground mb-1">Mention originale :</p>
                    <p className="text-sm italic">"{r.mention}"</p>
                  </div>
                  <p className="text-sm">{r.response}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm"><Copy className="h-3 w-3 mr-1" /> Copier</Button>
                    <Button size="sm"><Check className="h-3 w-3 mr-1" /> Approuver</Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
