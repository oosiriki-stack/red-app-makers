import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Plus, Mail, Copy, Trash2, Check, Shield, Crown, UserMinus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Workspace = { id: string; owner_id: string; name: string; description: string | null; created_at: string };
type Member = { id: string; workspace_id: string; user_id: string; role: string };
type Invitation = { id: string; workspace_id: string; email: string; role: string; token: string; status: string; expires_at: string; created_at: string };

export default function Workspaces() {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [active, setActive] = useState<Workspace | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");

  const loadWorkspaces = async () => {
    setLoading(true);
    const { data } = await supabase.from("workspaces").select("*").order("created_at", { ascending: false });
    setWorkspaces((data || []) as Workspace[]);
    if ((data || []).length > 0 && !active) setActive(data![0] as Workspace);
    setLoading(false);
  };

  const loadDetails = async (ws: Workspace) => {
    const [{ data: m }, { data: i }] = await Promise.all([
      supabase.from("workspace_members").select("*").eq("workspace_id", ws.id),
      supabase.from("workspace_invitations").select("*").eq("workspace_id", ws.id).order("created_at", { ascending: false }),
    ]);
    setMembers((m || []) as Member[]);
    setInvitations((i || []) as Invitation[]);
  };

  useEffect(() => { loadWorkspaces(); }, []);
  useEffect(() => { if (active) loadDetails(active); }, [active]);

  const createWorkspace = async () => {
    if (!newName.trim() || !user) return;
    const { data, error } = await supabase.from("workspaces").insert({ owner_id: user.id, name: newName.trim(), description: newDesc.trim() || null }).select().single();
    if (error) return toast.error(error.message);
    toast.success("Espace de travail créé");
    setCreateOpen(false); setNewName(""); setNewDesc("");
    await loadWorkspaces();
    setActive(data as Workspace);
  };

  const sendInvitation = async () => {
    if (!active || !user || !inviteEmail.trim()) return;
    const { data, error } = await supabase.from("workspace_invitations").insert({
      workspace_id: active.id, email: inviteEmail.trim().toLowerCase(), role: inviteRole as any, invited_by: user.id,
    }).select().single();
    if (error) return toast.error(error.message);
    const link = `${window.location.origin}/invite/${(data as Invitation).token}`;
    await navigator.clipboard.writeText(link).catch(() => {});
    const subject = encodeURIComponent(`Invitation à rejoindre ${active.name} sur @focus`);
    const body = encodeURIComponent(`Bonjour,\n\nVous êtes invité(e) à rejoindre l'espace de travail "${active.name}" sur @focus.\n\nAcceptez l'invitation : ${link}\n\nCe lien expire dans 7 jours.`);
    window.open(`mailto:${inviteEmail.trim()}?subject=${subject}&body=${body}`, "_blank");
    toast.success("Lien d'invitation copié et email pré-rempli");
    setInviteOpen(false); setInviteEmail(""); setInviteRole("member");
    loadDetails(active);
  };

  const copyInviteLink = async (token: string) => {
    await navigator.clipboard.writeText(`${window.location.origin}/invite/${token}`);
    toast.success("Lien copié");
  };

  const revokeInvitation = async (id: string) => {
    await supabase.from("workspace_invitations").update({ status: "revoked" } as any).eq("id", id);
    toast.success("Invitation révoquée");
    if (active) loadDetails(active);
  };

  const removeMember = async (memberId: string, memberUserId: string) => {
    if (!active) return;
    if (memberUserId === active.owner_id) return toast.error("Impossible de retirer le propriétaire");
    await supabase.from("workspace_members").delete().eq("id", memberId);
    toast.success("Membre retiré");
    loadDetails(active);
  };

  const updateMemberRole = async (memberId: string, role: string) => {
    await supabase.from("workspace_members").update({ role: role as any }).eq("id", memberId);
    if (active) loadDetails(active);
  };

  const roleBadge = (role: string) => {
    if (role === "owner") return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 gap-1"><Crown className="w-3 h-3" /> Propriétaire</Badge>;
    if (role === "admin") return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30 gap-1"><Shield className="w-3 h-3" /> Admin</Badge>;
    if (role === "viewer") return <Badge variant="outline">Lecteur</Badge>;
    return <Badge variant="secondary">Membre</Badge>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-4 sm:p-6 max-w-6xl mx-auto pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Espaces de travail</h1>
          <p className="text-sm text-muted-foreground mt-1">Collaborez en équipe : invitez admins et membres pour partager la veille.</p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Nouvel espace</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Créer un espace de travail</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Nom *</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Ma marque, Mon agence..." /></div>
              <div><Label>Description</Label><Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="À quoi sert cet espace ?" /></div>
            </div>
            <DialogFooter><Button onClick={createWorkspace}>Créer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
        {/* Sidebar — workspaces list */}
        <Card className="glass-card p-3 h-fit">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground/70 px-2 mb-2">Mes espaces</div>
          {loading && <div className="text-sm text-muted-foreground p-3">Chargement...</div>}
          {!loading && workspaces.length === 0 && <div className="text-sm text-muted-foreground p-3">Aucun espace. Créez-en un.</div>}
          <div className="space-y-1">
            {workspaces.map((w) => (
              <button key={w.id} onClick={() => setActive(w)} className={`w-full text-left p-3 rounded-xl transition-all ${active?.id === w.id ? "bg-primary/10 border border-primary/30" : "hover:bg-muted/50"}`}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center text-white text-sm font-bold">{w.name.charAt(0).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm truncate">{w.name}</div>
                    <div className="text-[10px] text-muted-foreground">{w.owner_id === user?.id ? "Propriétaire" : "Membre"}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* Active workspace details */}
        {active ? (
          <div className="space-y-5">
            <Card className="glass-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold">{active.name}</h2>
                  {active.description && <p className="text-sm text-muted-foreground mt-1">{active.description}</p>}
                </div>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild><Button className="gap-2"><Mail className="w-4 h-4" /> Inviter</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Inviter un collaborateur</DialogTitle></DialogHeader>
                    <div className="space-y-3">
                      <div><Label>Email *</Label><Input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="ami@entreprise.com" /></div>
                      <div><Label>Rôle</Label>
                        <Select value={inviteRole} onValueChange={setInviteRole}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin — peut inviter et gérer</SelectItem>
                            <SelectItem value="member">Membre — peut consulter et créer</SelectItem>
                            <SelectItem value="viewer">Lecteur — consultation seule</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground">Un lien d'invitation valable 7 jours sera copié et un email sera pré-rempli dans votre messagerie.</p>
                    </div>
                    <DialogFooter><Button onClick={sendInvitation}>Envoyer l'invitation</Button></DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            <Card className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3"><Users className="w-4 h-4 text-primary" /><h3 className="font-bold">Membres ({members.length})</h3></div>
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold">{m.user_id.slice(0, 2).toUpperCase()}</div>
                      <div className="text-sm font-mono truncate">{m.user_id === user?.id ? "Moi" : m.user_id.slice(0, 8) + "…"}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {roleBadge(m.role)}
                      {active.owner_id === user?.id && m.user_id !== active.owner_id && (
                        <>
                          <Select value={m.role} onValueChange={(v) => updateMemberRole(m.id, v)}>
                            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Membre</SelectItem>
                              <SelectItem value="viewer">Lecteur</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="icon" variant="ghost" aria-label="Retirer ce membre" onClick={() => removeMember(m.id, m.user_id)}><UserMinus className="w-4 h-4 text-destructive" /></Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3"><Mail className="w-4 h-4 text-primary" /><h3 className="font-bold">Invitations en attente</h3></div>
              {invitations.filter((i) => i.status === "pending").length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune invitation en attente.</p>
              ) : (
                <div className="space-y-2">
                  {invitations.filter((i) => i.status === "pending").map((inv) => (
                    <div key={inv.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium truncate">{inv.email}</div>
                        <div className="text-[11px] text-muted-foreground">Expire {new Date(inv.expires_at).toLocaleDateString("fr-FR")}</div>
                      </div>
                      {roleBadge(inv.role)}
                      <Button size="icon" variant="ghost" aria-label="Copier le lien d’invitation" onClick={() => copyInviteLink(inv.token)} title="Copier le lien"><Copy className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label="Révoquer l’invitation" onClick={() => revokeInvitation(inv.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card className="glass-card p-10 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
            <p className="text-muted-foreground">Créez votre premier espace de travail pour collaborer.</p>
          </Card>
        )}
      </div>
    </motion.div>
  );
}
