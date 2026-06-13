import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { AnimatedPage } from "@/components/AnimatedPage";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LifeBuoy, Loader2, Mail, MessageCircle, Phone } from "lucide-react";
import { toast } from "sonner";

const SUPPORT_EMAIL = "rpepperco@gmail.com";
const SUPPORT_PHONE = "+225 0759690001";
const SUPPORT_WA = "2250759690001";

type Ticket = {
  id: string; subject: string; message: string; status: string;
  admin_reply: string | null; created_at: string;
};

export default function Support() {
  const { user } = useAuth();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("support_tickets").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setTickets((data as Ticket[]) ?? []);
  };
  useEffect(() => { load(); }, [user]);

  const submit = async () => {
    if (!user || !subject.trim() || !message.trim()) { toast.error("Sujet et message requis"); return; }
    setSending(true);
    const { error } = await supabase.from("support_tickets").insert({ user_id: user.id, subject, message });
    setSending(false);
    if (error) toast.error(error.message);
    else { toast.success("Demande envoyée."); setSubject(""); setMessage(""); load(); }
  };

  const openWhatsApp = () => {
    const txt = encodeURIComponent(`Bonjour Focus Support, je suis ${user?.email || "client"}.\n\n`);
    window.open(`https://wa.me/${SUPPORT_WA}?text=${txt}`, "_blank");
  };

  return (
    <AnimatedPage>
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-2"><LifeBuoy className="w-7 h-7 text-primary" /> Support client</h1>
          <p className="text-muted-foreground">Notre équipe vous répond sous 24h ouvrées</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-3">
          <a href={`mailto:${SUPPORT_EMAIL}`} className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform">
            <Mail className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Email</p><p className="text-sm font-medium break-all">{SUPPORT_EMAIL}</p></div>
          </a>
          <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, "")}`} className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform">
            <Phone className="w-5 h-5 text-primary" /><div><p className="text-xs text-muted-foreground">Téléphone</p><p className="text-sm font-medium">{SUPPORT_PHONE}</p></div>
          </a>
          <button onClick={openWhatsApp} className="glass-card rounded-2xl p-4 flex items-center gap-3 hover:scale-[1.02] transition-transform text-left">
            <MessageCircle className="w-5 h-5 text-green-600" /><div><p className="text-xs text-muted-foreground">WhatsApp</p><p className="text-sm font-medium">Discuter maintenant</p></div>
          </button>
        </div>

        <Card className="glass-card rounded-2xl">
          <CardHeader><CardTitle className="text-base">Nouvelle demande</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Sujet</Label><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Ex: Problème de facturation" className="rounded-xl" /></div>
            <div><Label>Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5} placeholder="Décrivez votre besoin..." className="rounded-xl" /></div>
            <Button onClick={submit} disabled={sending} className="rounded-xl">{sending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Envoyer</Button>
          </CardContent>
        </Card>

        {tickets.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold">Mes demandes</h2>
            {tickets.map((t) => (
              <Card key={t.id} className="glass-card rounded-2xl">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{t.subject}</p>
                    <Badge variant={t.status === "resolved" ? "default" : "outline"} className="rounded-lg capitalize">{t.status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t.message}</p>
                  {t.admin_reply && (
                    <div className="mt-2 p-3 rounded-xl bg-primary/5 border border-primary/20">
                      <p className="text-xs text-primary font-medium mb-1">Réponse du support</p>
                      <p className="text-sm">{t.admin_reply}</p>
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString("fr-FR")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  );
}
