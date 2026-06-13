import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AnimatedPage } from "@/components/AnimatedPage";
import { useUserRole } from "@/hooks/useUserRole";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Users, CreditCard, MessageSquare, Loader2, CheckCircle2, XCircle, Clock, Eye, Download, Mail, KeyRound, Copy } from "lucide-react";
import { toast } from "sonner";
import { generatePaymentReceipt } from "@/lib/pdfReport";
import { UsageMap } from "@/components/UsageMap";

type Row = {
  id: string; name: string | null; company: string | null;
  phone: string | null; location: string | null;
  email?: string | null;
  plan: string | null; status: string | null; sub_id?: string | null;
  payment_method?: string | null; transaction_id?: string | null;
  payer_name?: string | null; payer_phone?: string | null; card_last4?: string | null;
  payment_proof_url?: string | null; submitted_at?: string | null;
  validated_at?: string | null; expires_at?: string | null; amount_fcfa?: number | null;
};

const PLANS = ["starter", "pro", "enterprise"];

function daysRemaining(expires_at?: string | null) {
  if (!expires_at) return null;
  const ms = new Date(expires_at).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (24 * 3600 * 1000)));
}

export default function SuperAdmin() {
  const { isSuperAdmin, isAdmin, loading: roleLoading } = useUserRole();
  const { user: me } = useAuth();
  const [users, setUsers] = useState<Row[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, active: 0, pending: 0, mentions: 0, tickets: 0 });
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState<Record<string, string>>({});
  const [detail, setDetail] = useState<Row | null>(null);
  const [proofUrl, setProofUrl] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: subs }, { data: tk }, { count: mc }, emailsRes] = await Promise.all([
      supabase.from("profiles").select("id, name, company, phone, location"),
      supabase.from("subscriptions").select("*"),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("mentions").select("*", { count: "exact", head: true }),
      supabase.functions.invoke("admin-users", { body: { action: "list_emails" } }),
    ]);
    const emailsMap: Record<string, string> = (emailsRes as any)?.data?.emails ?? {};
    const subMap = new Map((subs ?? []).map((s: any) => [s.user_id, s]));
    const rows: Row[] = (profiles ?? []).map((p: any) => {
      const s = subMap.get(p.id) as any;
      return { ...p, email: emailsMap[p.id] ?? null, plan: s?.plan ?? null, status: s?.status ?? null, sub_id: s?.id ?? null, ...(s || {}) };
    });
    setUsers(rows);
    setTickets(tk ?? []);
    setStats({
      users: rows.length,
      active: rows.filter(r => r.status === "active").length,
      pending: rows.filter(r => r.status === "pending").length,
      mentions: mc ?? 0,
      tickets: (tk ?? []).filter((t: any) => t.status === "open").length,
    });
    setLoading(false);
  };

  useEffect(() => { if (isSuperAdmin || isAdmin) load(); }, [isSuperAdmin, isAdmin]);

  const validatePayment = async (u: Row) => {
    if (!u.sub_id) return;
    const { error } = await supabase.from("subscriptions").update({
      status: "active",
      validated_by: me?.id,
    }).eq("id", u.sub_id);
    if (error) return toast.error(error.message);
    toast.success(`✅ Paiement validé. Licence ${u.plan} activée pour ${u.payer_name || u.name}`);
    load();
  };

  const rejectPayment = async (u: Row) => {
    if (!u.sub_id) return;
    const { error } = await supabase.from("subscriptions").update({ status: "cancelled" }).eq("id", u.sub_id);
    if (error) return toast.error(error.message);
    toast.info("Paiement rejeté");
    load();
  };

  const toggleLicense = async (u: Row) => {
    const newStatus = u.status === "active" ? "inactive" : "active";
    if (u.sub_id) await supabase.from("subscriptions").update({ status: newStatus }).eq("id", u.sub_id);
    else await supabase.from("subscriptions").insert({ user_id: u.id, plan: "starter", status: newStatus });
    toast.success(`Licence ${newStatus}`);
    load();
  };

  const changePlan = async (u: Row, plan: string) => {
    if (u.sub_id) await supabase.from("subscriptions").update({ plan }).eq("id", u.sub_id);
    else await supabase.from("subscriptions").insert({ user_id: u.id, plan, status: "pending" });
    toast.success(`Plan: ${plan}`);
    load();
  };

  const replyTicket = async (id: string) => {
    const txt = reply[id]?.trim();
    if (!txt) return;
    const { error } = await supabase.from("support_tickets").update({ admin_reply: txt, status: "resolved" }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Réponse envoyée");
    setReply({ ...reply, [id]: "" });
    load();
  };

  const resetPassword = async (u: Row) => {
    if (!u.email) return toast.error("Email indisponible");
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "reset_password", user_id: u.id, redirect_to: `${window.location.origin}/reset-password` },
    });
    if (error || (data as any)?.error) return toast.error((data as any)?.error || error?.message || "Échec");
    toast.success(`✉️ Lien de réinitialisation envoyé à ${u.email}`);
  };

  const copyEmail = (email?: string | null) => {
    if (!email) return;
    navigator.clipboard.writeText(email);
    toast.success("Email copié");
  };

  const viewProof = async (u: Row) => {
    setDetail(u);
    setProofUrl(null);
    if (u.payment_proof_url) {
      const { data } = await supabase.storage.from("payment-proofs").createSignedUrl(u.payment_proof_url, 600);
      if (data?.signedUrl) setProofUrl(data.signedUrl);
    }
  };

  const downloadReceipt = (u: Row) => {
    if (!u.validated_at) { toast.error("Paiement non validé"); return; }
    const doc = generatePaymentReceipt({
      payerName: u.payer_name || u.name || "—",
      payerEmail: "",
      plan: u.plan || "",
      amount: u.amount_fcfa || 0,
      paymentMethod: u.payment_method || "—",
      transactionId: u.transaction_id || u.sub_id || "",
      validatedAt: u.validated_at,
      expiresAt: u.expires_at || u.validated_at,
    });
    doc.save(`recu-${u.transaction_id || u.sub_id}.pdf`);
  };

  if (roleLoading) return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!isSuperAdmin && !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-2"><ShieldCheck className="w-7 h-7 text-primary" /> Super Administration</h1>
          <p className="text-muted-foreground">Validation des paiements, gestion des licences et utilisateurs</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { label: "Utilisateurs", val: stats.users, icon: Users, color: "" },
            { label: "Actifs", val: stats.active, icon: CheckCircle2, color: "text-green-600" },
            { label: "En attente", val: stats.pending, icon: Clock, color: "text-orange-500" },
            { label: "Mentions", val: stats.mentions, icon: MessageSquare, color: "" },
            { label: "Tickets", val: stats.tickets, icon: CreditCard, color: "" },
          ].map((s) => {
            const I = s.icon;
            return (
              <Card key={s.label} className="glass-card rounded-2xl">
                <CardContent className="p-3">
                  <div className="flex items-center gap-1.5 text-muted-foreground text-xs"><I className={`w-3.5 h-3.5 ${s.color}`} />{s.label}</div>
                  <p className="text-xl font-bold mt-1">{s.val}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <UsageMap />

        <Tabs defaultValue="pending">
          <TabsList className="rounded-xl flex-wrap h-auto">
            <TabsTrigger value="pending" className="rounded-lg">Paiements en attente ({stats.pending})</TabsTrigger>
            <TabsTrigger value="users" className="rounded-lg">Tous utilisateurs ({stats.users})</TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-lg">Tickets ({tickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <Card className="glass-card rounded-2xl">
              <CardHeader><CardTitle className="text-base">Paiements à valider</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <div className="space-y-3">
                    {users.filter(u => u.status === "pending").length === 0 && <p className="text-sm text-muted-foreground">Aucun paiement en attente.</p>}
                    {users.filter(u => u.status === "pending").map((u) => (
                      <Card key={u.id} className="rounded-xl border-orange-500/30">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <p className="font-medium">{u.payer_name || u.name} <span className="text-xs text-muted-foreground">({u.company || "—"})</span></p>
                              <p className="text-xs text-muted-foreground">Plan {u.plan} · {u.amount_fcfa?.toLocaleString("fr-FR")} FCFA · via {u.payment_method}</p>
                            </div>
                            <Badge variant="outline" className="rounded-lg"><Clock className="w-3 h-3 mr-1" />En attente</Badge>
                          </div>
                          <div className="text-xs grid grid-cols-2 gap-1">
                            <span>Transaction: <strong>{u.transaction_id}</strong></span>
                            <span>Tél: {u.payer_phone || "—"}</span>
                            {u.card_last4 && <span>Carte: ••••{u.card_last4}</span>}
                            <span>Soumis: {u.submitted_at ? new Date(u.submitted_at).toLocaleString("fr-FR") : "—"}</span>
                          </div>
                          <div className="flex gap-2 flex-wrap pt-2">
                            <Button size="sm" variant="outline" className="rounded-lg" onClick={() => viewProof(u)}><Eye className="w-3 h-3 mr-1" />Voir capture</Button>
                            <Button size="sm" className="rounded-lg bg-green-600 hover:bg-green-700" onClick={() => validatePayment(u)}><CheckCircle2 className="w-3 h-3 mr-1" />Valider</Button>
                            <Button size="sm" variant="outline" className="rounded-lg text-red-600" onClick={() => rejectPayment(u)}><XCircle className="w-3 h-3 mr-1" />Rejeter</Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="glass-card rounded-2xl">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader><TableRow>
                      <TableHead>Nom</TableHead><TableHead>Email</TableHead><TableHead>Plan</TableHead>
                      <TableHead>Statut</TableHead><TableHead>Jours restants</TableHead><TableHead>Actions</TableHead>
                    </TableRow></TableHeader>
                    <TableBody>
                      {users.map((u) => {
                        const days = daysRemaining(u.expires_at);
                        const expired = u.status === "active" && days === 0;
                        const status = expired ? "expired" : u.status;
                        return (
                          <TableRow key={u.id} className="cursor-pointer hover:bg-muted/30" onClick={() => viewProof(u)}>
                            <TableCell><div><p className="font-medium text-sm">{u.name || "—"}</p><p className="text-xs text-muted-foreground">{u.company || u.location || "—"}</p></div></TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              {u.email ? (
                                <button onClick={() => copyEmail(u.email)} className="text-xs font-mono inline-flex items-center gap-1 hover:text-primary" title="Copier">
                                  <Mail className="w-3 h-3" />{u.email}
                                </button>
                              ) : <span className="text-xs text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell>
                              <Select value={u.plan ?? "starter"} onValueChange={(v) => changePlan(u, v)}>
                                <SelectTrigger onClick={(e) => e.stopPropagation()} className="w-28 rounded-lg h-8 text-xs"><SelectValue /></SelectTrigger>
                                <SelectContent>{PLANS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              {status === "active" && <Badge className="rounded-lg bg-green-100 text-green-800 dark:bg-green-900/40"><CheckCircle2 className="w-3 h-3 mr-1" />Validé</Badge>}
                              {status === "pending" && <Badge variant="outline" className="rounded-lg text-orange-600 border-orange-500/40"><Clock className="w-3 h-3 mr-1" />Attente</Badge>}
                              {status === "expired" && <Badge className="rounded-lg bg-red-100 text-red-800 dark:bg-red-900/40"><XCircle className="w-3 h-3 mr-1" />Expiré</Badge>}
                              {(!status || ["inactive", "cancelled"].includes(status)) && <Badge variant="outline" className="rounded-lg"><XCircle className="w-3 h-3 mr-1" />Inactif</Badge>}
                            </TableCell>
                            <TableCell className="text-sm">
                              {days !== null ? <span className={days < 7 ? "text-red-600 font-medium" : ""}>{days} j</span> : <span className="text-muted-foreground">—</span>}
                            </TableCell>
                            <TableCell onClick={(e) => e.stopPropagation()}>
                              <div className="flex gap-1">
                                <Button size="sm" variant="outline" className="rounded-lg" onClick={() => toggleLicense(u)}>
                                  {u.status === "active" ? "Désactiver" : "Activer"}
                                </Button>
                                <Button size="sm" variant="outline" className="rounded-lg" title="Réinitialiser le mot de passe" onClick={() => resetPassword(u)} disabled={!u.email}>
                                  <KeyRound className="w-3 h-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="space-y-3">
              {tickets.length === 0 && <Card className="glass-card rounded-2xl p-6 text-center text-muted-foreground">Aucun ticket</Card>}
              {tickets.map((t) => (
                <Card key={t.id} className="glass-card rounded-2xl">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between"><p className="font-medium">{t.subject}</p><Badge variant={t.status === "resolved" ? "default" : "outline"} className="rounded-lg">{t.status}</Badge></div>
                    <p className="text-sm text-muted-foreground">{t.message}</p>
                    {t.admin_reply ? <div className="p-2 rounded-lg bg-primary/5 text-sm"><span className="text-xs text-primary">Réponse: </span>{t.admin_reply}</div> : (
                      <div className="flex gap-2 pt-2">
                        <Textarea placeholder="Répondre..." value={reply[t.id] ?? ""} onChange={(e) => setReply({ ...reply, [t.id]: e.target.value })} rows={2} className="rounded-xl" />
                        <Button onClick={() => replyTicket(t.id)} className="rounded-xl">Envoyer</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Dialog open={!!detail} onOpenChange={() => { setDetail(null); setProofUrl(null); }}>
          <DialogContent className="glass-card rounded-2xl max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Détails utilisateur</DialogTitle></DialogHeader>
            {detail && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><strong>Nom :</strong> {detail.name || "—"}</div>
                  <div><strong>Entreprise :</strong> {detail.company || "—"}</div>
                  <div className="col-span-2 flex items-center gap-2"><strong>Email d'inscription :</strong>
                    {detail.email ? (
                      <button onClick={() => copyEmail(detail.email)} className="font-mono inline-flex items-center gap-1 hover:text-primary"><Mail className="w-3 h-3" />{detail.email}<Copy className="w-3 h-3 opacity-50" /></button>
                    ) : "—"}
                  </div>
                  <div><strong>Téléphone :</strong> {detail.phone || "—"}</div>
                  <div><strong>Localisation :</strong> {detail.location || "—"}</div>
                  <div><strong>Plan :</strong> {detail.plan || "—"}</div>
                  <div><strong>Statut :</strong> {detail.status || "—"}</div>
                  <div><strong>Montant :</strong> {detail.amount_fcfa?.toLocaleString("fr-FR") || 0} FCFA</div>
                  <div><strong>Moyen :</strong> {detail.payment_method || "—"}</div>
                  <div><strong>Transaction ID :</strong> {detail.transaction_id || "—"}</div>
                  <div><strong>Payeur :</strong> {detail.payer_name || "—"}</div>
                  <div><strong>Tél payeur :</strong> {detail.payer_phone || "—"}</div>
                  {detail.card_last4 && <div><strong>Carte :</strong> ••••{detail.card_last4}</div>}
                  <div><strong>Validé le :</strong> {detail.validated_at ? new Date(detail.validated_at).toLocaleString("fr-FR") : "—"}</div>
                  <div><strong>Expire le :</strong> {detail.expires_at ? new Date(detail.expires_at).toLocaleString("fr-FR") : "—"}</div>
                </div>
                {proofUrl && (
                  <div>
                    <p className="font-medium mb-2">Capture de paiement</p>
                    {proofUrl.toLowerCase().includes(".pdf") ? (
                      <a href={proofUrl} target="_blank" rel="noreferrer" className="text-primary underline">Ouvrir le PDF</a>
                    ) : (
                      <img src={proofUrl} alt="preuve" className="max-h-96 rounded-xl border" />
                    )}
                  </div>
                )}
                <div className="flex gap-2 pt-2 flex-wrap">
                  {detail.status === "pending" && (
                    <>
                      <Button size="sm" className="rounded-lg bg-green-600 hover:bg-green-700" onClick={() => { validatePayment(detail); setDetail(null); }}><CheckCircle2 className="w-3 h-3 mr-1" />Valider</Button>
                      <Button size="sm" variant="outline" className="rounded-lg text-red-600" onClick={() => { rejectPayment(detail); setDetail(null); }}>Rejeter</Button>
                    </>
                  )}
                  {detail.status === "active" && (
                    <Button size="sm" variant="outline" className="rounded-lg" onClick={() => downloadReceipt(detail)}><Download className="w-3 h-3 mr-1" />Reçu PDF</Button>
                  )}
                  <Button size="sm" variant="outline" className="rounded-lg" disabled={!detail.email} onClick={() => resetPassword(detail)}>
                    <KeyRound className="w-3 h-3 mr-1" />Réinitialiser mot de passe
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AnimatedPage>
  );
}
