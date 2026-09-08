import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ExternalLink, Twitter, Facebook, Instagram, Linkedin, Music, Youtube, Globe, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const PLATFORMS = [
  { id: "x", label: "X (Twitter)", icon: Twitter, color: "text-slate-900 dark:text-slate-100", urlPrefix: "https://x.com/" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-600", urlPrefix: "https://facebook.com/" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-600", urlPrefix: "https://instagram.com/" },
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-700", urlPrefix: "https://linkedin.com/in/" },
  { id: "tiktok", label: "TikTok", icon: Music, color: "text-rose-500", urlPrefix: "https://tiktok.com/@" },
  { id: "youtube", label: "YouTube", icon: Youtube, color: "text-red-600", urlPrefix: "https://youtube.com/@" },
  { id: "other", label: "Autre", icon: Globe, color: "text-muted-foreground", urlPrefix: "" },
];

export default function SocialNetworks() {
  const { user } = useAuth();
  const [handles, setHandles] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [platform, setPlatform] = useState("x");
  const [handle, setHandle] = useState("");
  const [url, setUrl] = useState("");

  const load = async () => {
    if (!user) return;
    const { data } = await supabase.from("social_handles").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setHandles(data || []);
  };
  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !handle.trim()) return;
    const def = PLATFORMS.find((p) => p.id === platform);
    const finalUrl = url.trim() || (def?.urlPrefix ? def.urlPrefix + handle.trim().replace(/^@/, "") : "");
    const { error } = await supabase.from("social_handles").insert({
      user_id: user.id, platform, handle: handle.trim().replace(/^@/, ""), url: finalUrl || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Compte ajouté");
    setOpen(false); setHandle(""); setUrl(""); setPlatform("x");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("social_handles").delete().eq("id", id);
    toast.success("Compte supprimé");
    load();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 p-4 sm:p-6 max-w-4xl mx-auto pb-24">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Mes réseaux sociaux</h1>
          <p className="text-sm text-muted-foreground mt-1">Déclarez vos comptes officiels. Visibles uniquement par vous.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button className="gap-2"><Plus className="w-4 h-4" /> Ajouter un compte</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ajouter un réseau social</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Plateforme *</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PLATFORMS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Identifiant / @handle *</Label><Input value={handle} onChange={(e) => setHandle(e.target.value)} placeholder="moncompte" /></div>
              <div><Label>URL personnalisée (optionnel)</Label><Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." /></div>
            </div>
            <DialogFooter><Button onClick={add}>Enregistrer</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="glass-card p-3 border-amber-500/30 bg-amber-500/5">
        <div className="flex items-start gap-3 p-2">
          <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 dark:text-amber-300">Ces informations sont stockées de façon sécurisée et accessibles uniquement par vous. Aucune authentification OAuth n'est requise.</p>
        </div>
      </Card>

      {handles.length === 0 ? (
        <Card className="glass-card p-10 text-center">
          <Globe className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground">Aucun compte enregistré. Ajoutez vos handles pour mieux suivre votre présence.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {handles.map((h) => {
            const meta = PLATFORMS.find((p) => p.id === h.platform) || PLATFORMS[6];
            const Icon = meta.icon;
            return (
              <motion.div key={h.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className="glass-card p-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                    <Icon className={`w-5 h-5 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">@{h.handle}</div>
                    <div className="text-xs text-muted-foreground">{meta.label}</div>
                  </div>
                  {h.url && (
                    <a href={h.url} target="_blank" rel="noopener" className="text-muted-foreground hover:text-primary">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  <Button size="icon" variant="ghost" aria-label="Supprimer ce mot-clé" onClick={() => remove(h.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
