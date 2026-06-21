import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Sparkles, Zap, Building2, Loader2, Upload, CreditCard, Smartphone, Copy } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const WAVE_LINK = "https://pay.wave.com/m/M_ci_mZX836uJEiGE/c/ci/";
const CARD_NUMBER = "4312 5900 9402 6114";

const plans = [
  { name: "Starter", icon: Zap, planKey: "starter", price: 25000, features: [
    "500 mentions/mois", "3 sources surveillées", "Tableau de bord temps réel",
    "Alertes email", "Rapports hebdo PDF/Excel", "Veille concurrentielle (3 concurrents)",
    "Module Influenceurs", "Réseaux sociaux & graphiques",
  ] },
  { name: "Pro", icon: Sparkles, planKey: "pro", price: 50000, popular: true, features: [
    "Mentions illimitées", "Toutes sources (RSS, FB, TikTok, WhatsApp)",
    "FOCUS GPT — IA propriétaire", "Rapports J/S/M/A automatiques",
    "Alertes temps réel (SMS, WhatsApp, Slack, Teams)",
    "Gestion de crise & détection précoce", "Support prioritaire",
  ] },
  { name: "Entreprise", icon: Building2, planKey: "enterprise", price: 0, features: [
    "Tout Pro inclus", "API dédiée & webhooks", "SLA 99,9% garanti",
    "Support 24/7 & Account manager", "SSO (SAML/OAuth)",
    "Workspaces multi-équipes", "Audit & journalisation avancée",
  ] },
];

export default function Pricing() {
  const { user } = useAuth();
  const [currentSub, setCurrentSub] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<(typeof plans)[0] | null>(null);
  const [method, setMethod] = useState<"wave" | "card">("wave");
  const [txId, setTxId] = useState("");
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [cardLast4, setCardLast4] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setCurrentSub(data));
  }, [user]);

  const open = (p: (typeof plans)[0]) => {
    if (p.planKey === "enterprise") { toast.info(`Contactez rpepperco@gmail.com`); return; }
    setSelectedPlan(p);
  };

  const copy = (text: string) => { navigator.clipboard.writeText(text); toast.success("Copié"); };

  const submit = async () => {
    if (!user || !selectedPlan) return;
    if (!txId.trim() || !payerName.trim()) { toast.error("Nom et ID de transaction requis"); return; }
    if (method === "card" && cardLast4.replace(/\D/g, "").length < 4) { toast.error("4 derniers chiffres de la carte requis"); return; }
    if (!proofFile) { toast.error("Veuillez uploader la capture de paiement"); return; }

    setSubmitting(true);
    try {
      const ext = proofFile.name.split(".").pop() || "jpg";
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("payment-proofs").upload(path, proofFile);
      if (upErr) throw upErr;

      const payload: any = {
        user_id: user.id,
        plan: selectedPlan.planKey,
        status: "pending",
        payment_method: method,
        transaction_id: txId.trim(),
        payer_name: payerName.trim(),
        payer_phone: payerPhone.trim() || null,
        card_last4: method === "card" ? cardLast4.slice(-4) : null,
        payment_proof_url: path,
        amount_fcfa: selectedPlan.price,
        submitted_at: new Date().toISOString(),
      };

      // Upsert: if subscription exists, update; else insert
      const { data: existing } = await supabase.from("subscriptions").select("id, status").eq("user_id", user.id).maybeSingle();
      if (existing) {
        const { error } = await supabase.from("subscriptions").update({ ...payload }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("subscriptions").insert(payload);
        if (error) throw error;
      }

      toast.success("Paiement soumis ✅", { description: "Validation par notre équipe sous 24h. Vous recevrez une notification." });
      setSelectedPlan(null);
      setTxId(""); setPayerName(""); setPayerPhone(""); setCardLast4(""); setProofFile(null);
      const { data: refreshed } = await supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle();
      setCurrentSub(refreshed);
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-light tracking-tight">Tarification</h1>
          <p className="text-muted-foreground">Paiement par Wave ou Carte bancaire · Validation 24h</p>
        </div>

        {currentSub && currentSub.status === "pending" && (
          <Card className="glass-card rounded-2xl border-orange-500/30 max-w-3xl mx-auto">
            <CardContent className="p-4 flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-orange-500 animate-spin" />
              <div className="flex-1">
                <p className="font-medium text-sm">Paiement en attente de validation</p>
                <p className="text-xs text-muted-foreground">Plan {currentSub.plan} · Transaction {currentSub.transaction_id} · soumis le {new Date(currentSub.submitted_at).toLocaleString("fr-FR")}</p>
              </div>
              <Badge variant="outline" className="rounded-lg">En attente</Badge>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-3 max-w-5xl mx-auto">
          {plans.map((p) => {
            const Icon = p.icon;
            const isCurrent = currentSub?.plan === p.planKey && currentSub?.status === "active";
            return (
              <Card key={p.name} className={`relative card-hover rounded-2xl ${p.popular ? "glass-card border-primary/40 scale-[1.02]" : "glass-card"}`}>
                {p.popular && <Badge className="absolute right-4 top-4">Populaire</Badge>}
                <CardHeader className="text-center pt-7 pb-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-2"><Icon className="w-6 h-6 text-primary" /></div>
                  <CardTitle className="text-xl font-medium">{p.name}</CardTitle>
                  <div className="mt-3">
                    {p.price > 0 ? <><span className="text-3xl font-light">{p.price.toLocaleString("fr-FR")}</span><span className="text-xs text-muted-foreground ml-1">FCFA/mois</span></> : <span className="text-xl text-muted-foreground">Sur devis</span>}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pb-6">
                  <ul className="space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm"><Check className="h-3.5 w-3.5 text-primary shrink-0" />{f}</li>
                    ))}
                  </ul>
                  <Button className="w-full rounded-xl" variant={p.popular ? "default" : "outline"} disabled={isCurrent} onClick={() => open(p)}>
                    {isCurrent ? "Plan actuel" : p.price > 0 ? "Souscrire" : "Nous contacter"}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Dialog open={!!selectedPlan} onOpenChange={() => setSelectedPlan(null)}>
          <DialogContent className="glass-card rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Souscription · {selectedPlan?.name}</DialogTitle>
              <DialogDescription>{selectedPlan?.price.toLocaleString("fr-FR")} FCFA · Validation 24h par notre équipe</DialogDescription>
            </DialogHeader>

            <Tabs value={method} onValueChange={(v) => setMethod(v as any)}>
              <TabsList className="w-full rounded-xl">
                <TabsTrigger value="wave" className="flex-1 rounded-lg gap-1"><Smartphone className="h-4 w-4" />Wave</TabsTrigger>
                <TabsTrigger value="card" className="flex-1 rounded-lg gap-1"><CreditCard className="h-4 w-4" />Carte bancaire</TabsTrigger>
              </TabsList>

              <TabsContent value="wave" className="space-y-3 pt-3">
                <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                  <p className="text-sm font-medium">Effectuez le paiement via Wave</p>
                  <Button size="sm" className="w-full rounded-xl" onClick={() => window.open(WAVE_LINK, "_blank")}>Ouvrir Wave</Button>
                  <p className="text-xs text-muted-foreground">Puis revenez ici remplir le formulaire ci-dessous.</p>
                </div>
              </TabsContent>

              <TabsContent value="card" className="space-y-3 pt-3">
                <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                  <p className="text-sm font-medium">Carte bancaire à utiliser</p>
                  <div className="flex items-center gap-2">
                    <code className="text-base font-mono bg-background px-3 py-2 rounded-lg flex-1">{CARD_NUMBER}</code>
                    <Button size="icon" variant="outline" className="rounded-xl shrink-0" onClick={() => copy(CARD_NUMBER.replace(/\s/g, ""))}><Copy className="h-4 w-4" /></Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Effectuez le paiement sur cette carte, puis renseignez les 4 derniers chiffres de votre carte et l'ID de transaction.</p>
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-3 pt-2">
              <div><Label>Nom du payeur *</Label><Input value={payerName} onChange={(e) => setPayerName(e.target.value)} className="rounded-xl" /></div>
              <div><Label>Numéro de téléphone</Label><Input value={payerPhone} onChange={(e) => setPayerPhone(e.target.value)} placeholder="+225..." className="rounded-xl" /></div>
              <div><Label>ID de transaction *</Label><Input value={txId} onChange={(e) => setTxId(e.target.value)} placeholder={method === "wave" ? "T_XXXXX" : "Référence bancaire"} className="rounded-xl" /></div>
              {method === "card" && (
                <div><Label>4 derniers chiffres de votre carte *</Label><Input value={cardLast4} onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, "").slice(0, 4))} maxLength={4} className="rounded-xl" /></div>
              )}
              <div>
                <Label>Capture de paiement *</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Input type="file" accept="image/*,.pdf" onChange={(e) => setProofFile(e.target.files?.[0] || null)} className="rounded-xl" />
                  {proofFile && <Badge variant="outline" className="shrink-0"><Upload className="h-3 w-3 mr-1" />OK</Badge>}
                </div>
              </div>
              <Button className="w-full rounded-xl" onClick={submit} disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Soumettre le paiement
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <p className="text-center text-xs text-muted-foreground">Validation manuelle par notre équipe sous 24h · Reçu PDF envoyé par email après validation</p>
      </div>
    </AnimatedPage>
  );
}
