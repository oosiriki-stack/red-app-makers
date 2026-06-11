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
import { AnimatedPage } from "@/components/AnimatedPage";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { ShieldCheck, Users, CreditCard, MessageSquare, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type UserRow = {
  id: string; name: string | null; company: string | null; email?: string;
  plan: string | null; status: string | null; sub_id?: string | null;
};

const PLANS = ["free", "starter", "pro", "enterprise"];

export default function SuperAdmin() {
  const { isSuperAdmin, loading: roleLoading } = useUserRole();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [stats, setStats] = useState({ users: 0, active: 0, mentions: 0, tickets: 0 });
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: subs }, { data: tk }, { count: mc }] = await Promise.all([
      supabase.from("profiles").select("id, name, company"),
      supabase.from("subscriptions").select("id, user_id, plan, status"),
      supabase.from("support_tickets").select("*").order("created_at", { ascending: false }),
      supabase.from("mentions").select("*", { count: "exact", head: true }),
    ]);
    const subMap = new Map((subs ?? []).map((s: any) => [s.user_id, s]));
    const rows: UserRow[] = (profiles ?? []).map((p: any) => {
      const s = subMap.get(p.id);
      return { id: p.id, name: p.name, company: p.company, plan: s?.plan ?? null, status: s?.status ?? null, sub_id: s?.id ?? null };
    });
    setUsers(rows);
    setTickets(tk ?? []);
    setStats({
      users: rows.length,
      active: rows.filter(r => r.status === "active").length,
      mentions: mc ?? 0,
      tickets: (tk ?? []).filter((t: any) => t.status === "open").length,
    });
    setLoading(false);
  };

  useEffect(() => { if (isSuperAdmin) load(); }, [isSuperAdmin]);

  const toggleLicense = async (u: UserRow) => {
    const newStatus = u.status === "active" ? "inactive" : "active";
    if (u.sub_id) {
      const { error } = await supabase.from("subscriptions").update({ status: newStatus }).eq("id", u.sub_id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from("subscriptions").insert({ user_id: u.id, plan: "free", status: newStatus });
      if (error) return toast.error(error.message);
    }
    toast.success(`Licence ${newStatus === "active" ? "activée" : "désactivée"}`);
    load();
  };

  const changePlan = async (u: UserRow, plan: string) => {
    if (u.sub_id) {
      await supabase.from("subscriptions").update({ plan }).eq("id", u.sub_id);
    } else {
      await supabase.from("subscriptions").insert({ user_id: u.id, plan, status: "active" });
    }
    toast.success(`Plan changé en ${plan}`);
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

  if (roleLoading) return <div className="flex justify-center p-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-light tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary" /> Super Administration
          </h1>
          <p className="text-muted-foreground">Accès complet à toutes les licences et utilisateurs</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Utilisateurs", val: stats.users, icon: Users },
            { label: "Licences actives", val: stats.active, icon: CheckCircle2 },
            { label: "Mentions totales", val: stats.mentions, icon: MessageSquare },
            { label: "Tickets ouverts", val: stats.tickets, icon: CreditCard },
          ].map((s) => {
            const I = s.icon;
            return (
              <Card key={s.label} className="glass-card rounded-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-xs"><I className="w-4 h-4" />{s.label}</div>
                  <p className="text-2xl font-bold mt-1">{s.val}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="users">
          <TabsList className="rounded-xl">
            <TabsTrigger value="users" className="rounded-lg">Utilisateurs & Licences</TabsTrigger>
            <TabsTrigger value="tickets" className="rounded-lg">Tickets support ({tickets.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="glass-card rounded-2xl">
              <CardHeader><CardTitle className="text-base">Tous les utilisateurs</CardTitle></CardHeader>
              <CardContent>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Entreprise</TableHead><TableHead>Plan</TableHead><TableHead>Statut</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="font-medium">{u.name || "—"}</TableCell>
                            <TableCell className="text-muted-foreground">{u.company || "—"}</TableCell>
                            <TableCell>
                              <Select value={u.plan ?? "free"} onValueChange={(v) => changePlan(u, v)}>
                                <SelectTrigger className="w-32 rounded-lg h-8"><SelectValue /></SelectTrigger>
                                <SelectContent>{PLANS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Badge variant={u.status === "active" ? "default" : "outline"} className="rounded-lg">
                                {u.status === "active" ? <><CheckCircle2 className="w-3 h-3 mr-1" />Actif</> : <><XCircle className="w-3 h-3 mr-1" />Inactif</>}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant={u.status === "active" ? "outline" : "default"} className="rounded-lg" onClick={() => toggleLicense(u)}>
                                {u.status === "active" ? "Désactiver" : "Activer"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tickets">
            <div className="space-y-3">
              {tickets.length === 0 && <Card className="glass-card rounded-2xl p-6 text-center text-muted-foreground">Aucun ticket</Card>}
              {tickets.map((t) => (
                <Card key={t.id} className="glass-card rounded-2xl">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{t.subject}</p>
                      <Badge variant={t.status === "resolved" ? "default" : "outline"} className="rounded-lg">{t.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{t.message}</p>
                    {t.admin_reply ? (
                      <div className="p-2 rounded-lg bg-primary/5 text-sm"><span className="text-xs text-primary">Réponse: </span>{t.admin_reply}</div>
                    ) : (
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
      </div>
    </AnimatedPage>
  );
}
