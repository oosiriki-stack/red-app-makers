import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, Loader2, Sparkles, User } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Résume les mentions négatives de la semaine",
  "Génère un communiqué de presse de gestion de crise",
  "Propose une réponse empathique pour un avis 1 étoile",
  "Quel concurrent progresse le plus ce mois-ci ?",
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Bonjour 👋 Je suis **FocusGPT**, votre assistant IA pour l'e-réputation. Comment puis-je vous aider aujourd'hui ?" },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setStreaming(true);
    setMessages(m => [...m, { role: "assistant", content: "" }]);

    try {
      let context = "";
      if (user) {
        const { data: m } = await supabase.from("monitoring_settings").select("brand, person").eq("user_id", user.id).maybeSingle();
        if (m) context = `Marque: ${m.brand || "non définie"}${m.person ? `, Personne: ${m.person}` : ""}`;
      }
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/focus-gpt`;
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${session?.access_token ?? import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
        body: JSON.stringify({ messages: next, context }),
      });
      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({ error: "Erreur" }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6).trim();
          if (data === "[DONE]") continue;
          try {
            const json = JSON.parse(data);
            const delta = json.choices?.[0]?.delta?.content;
            if (delta) {
              acc += delta;
              setMessages(m => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c; });
            }
          } catch {}
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur FocusGPT");
      setMessages(m => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-4 max-w-4xl mx-auto flex flex-col h-[calc(100vh-13rem)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <Bot className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-light tracking-tight flex items-center gap-2">FocusGPT <Sparkles className="w-4 h-4 text-primary" /></h1>
            <p className="text-xs text-muted-foreground">Assistant IA e-réputation · Powered by Lovable AI</p>
          </div>
        </div>

        <Card className="glass-card rounded-2xl flex-1 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex-1 flex flex-col">
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : ""}`}>
                  {m.role === "assistant" && <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>}
                  <div className={`rounded-2xl px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
                    {m.content || (streaming && i === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : null)}
                  </div>
                  {m.role === "user" && <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0"><User className="w-4 h-4" /></div>}
                </div>
              ))}
            </div>

            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {SUGGESTIONS.map(s => (
                  <Badge key={s} variant="outline" className="cursor-pointer rounded-lg hover:bg-primary/10" onClick={() => send(s)}>{s}</Badge>
                ))}
              </div>
            )}

            <div className="p-3 border-t border-border/40 flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Posez votre question à FocusGPT..."
                rows={1}
                className="rounded-xl resize-none min-h-[44px]"
                disabled={streaming}
              />
              <Button onClick={() => send()} disabled={streaming || !input.trim()} className="rounded-xl shrink-0 h-11 w-11 p-0">
                {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
