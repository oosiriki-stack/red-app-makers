import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, Send, Loader2, Sparkles, User, Copy, Printer, Download, Mic, MicOff } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Résume les mentions négatives de la semaine",
  "Rédige un communiqué de gestion de crise",
  "Réponse empathique pour un avis 1 étoile",
  "Quel concurrent progresse le plus ?",
];

export default function AIAssistant() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Bonjour 👋 Je suis **FocusGPT**, votre assistant IA pour l'e-réputation. Comment puis-je vous aider ?" },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }); }, [messages]);

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { toast.error("Reconnaissance vocale non supportée sur ce navigateur"); return; }
    if (listening) { recognitionRef.current?.stop(); return; }
    const rec = new SR();
    rec.lang = "fr-FR"; rec.interimResults = true; rec.continuous = false;
    let finalText = "";
    rec.onresult = (e: any) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t; else interim += t;
      }
      setInput((finalText + interim).trim());
    };
    rec.onerror = (e: any) => { toast.error("Erreur micro: " + (e.error || "")); setListening(false); };
    rec.onend = () => {
      setListening(false);
      const text = finalText.trim();
      if (text) { setInput(""); send(text); }
    };
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
    toast.info("🎙️ Parlez maintenant...");
  };

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput("");
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setStreaming(true);
    setMessages((m) => [...m, { role: "assistant", content: "" }]);
    try {
      let context = "";
      if (user) {
        const { data: m } = await supabase.from("monitoring_settings").select("brand, person").eq("user_id", user.id).maybeSingle();
        if (m) context = `Marque: ${m.brand || "non définie"}${(m as any).person ? `, Personne: ${(m as any).person}` : ""}`;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/focus-gpt`;
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
            if (delta) {
              acc += delta;
              setMessages((m) => { const c = [...m]; c[c.length - 1] = { role: "assistant", content: acc }; return c; });
            }
          } catch {}
        }
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur FocusGPT");
      setMessages((m) => m.slice(0, -1));
    } finally {
      setStreaming(false);
    }
  };

  const copyMsg = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copié"); };

  const downloadMsg = (text: string, idx: number) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `focusgpt-reponse-${idx + 1}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const printMsg = (text: string) => {
    const w = window.open("", "_blank", "width=700,height=900");
    if (!w) return;
    w.document.write(`<html><head><title>FocusGPT</title><style>body{font-family:system-ui;padding:24px;line-height:1.6;color:#222}h1{color:#E5A100}pre{white-space:pre-wrap;font-family:inherit}</style></head><body><h1>FocusGPT</h1><pre>${text.replace(/</g, "&lt;")}</pre><p style="color:#888;font-size:12px;margin-top:24px">Imprimé le ${new Date().toLocaleString("fr-FR")}</p></body></html>`);
    w.document.close(); w.focus(); w.print();
  };

  return (
    <AnimatedPage>
      <div className="space-y-3 max-w-4xl mx-auto flex flex-col h-[calc(100vh-10rem)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <Bot className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-light tracking-tight flex items-center gap-2">FocusGPT <Sparkles className="w-4 h-4 text-primary" /></h1>
            <p className="text-[11px] text-muted-foreground">Assistant IA · Lovable AI</p>
          </div>
        </div>

        <Card className="glass-card rounded-2xl flex-1 flex flex-col overflow-hidden">
          <CardContent className="p-0 flex-1 flex flex-col min-h-0">
            <ScrollArea className="flex-1">
              <div ref={scrollRef as any} className="p-4 space-y-4">
                {messages.map((m, i) => (
                  <div key={i} className={`flex gap-2 ${m.role === "user" ? "justify-end" : ""}`}>
                    {m.role === "assistant" && <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><Bot className="w-4 h-4 text-primary" /></div>}
                    <div className={`rounded-2xl px-3 py-2 max-w-[85%] text-sm whitespace-pre-wrap ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted/50"}`}>
                      {m.content || (streaming && i === messages.length - 1 ? <Loader2 className="w-4 h-4 animate-spin" /> : null)}
                      {m.role === "assistant" && m.content && !streaming && (
                        <div className="flex gap-1 mt-2 pt-2 border-t border-border/30">
                          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => copyMsg(m.content)}><Copy className="w-3 h-3 mr-1" />Copier</Button>
                          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => downloadMsg(m.content, i)}><Download className="w-3 h-3 mr-1" />Télécharger</Button>
                          <Button size="sm" variant="ghost" className="h-6 px-1.5 text-[10px]" onClick={() => printMsg(m.content)}><Printer className="w-3 h-3 mr-1" />Imprimer</Button>
                        </div>
                      )}
                    </div>
                    {m.role === "user" && <div className="w-7 h-7 rounded-xl bg-muted flex items-center justify-center shrink-0"><User className="w-4 h-4" /></div>}
                  </div>
                ))}
              </div>
            </ScrollArea>

            {messages.length <= 1 && (
              <div className="px-3 pb-2 flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <Badge key={s} variant="outline" className="cursor-pointer rounded-lg hover:bg-primary/10 text-[11px]" onClick={() => send(s)}>{s}</Badge>
                ))}
              </div>
            )}

            <div className="p-2 border-t border-border/40 flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Posez votre question..."
                rows={1}
                className="rounded-xl resize-none min-h-[40px]"
                disabled={streaming}
              />
              <Button onClick={() => send()} disabled={streaming || !input.trim()} className="rounded-xl shrink-0 h-10 w-10 p-0">
                {streaming ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
