import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Rss, Plus, Trash2, RefreshCw, Loader2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Feed = { id: string; label: string; url: string; source: string; is_active: boolean; last_fetched_at: string | null };

export default function RssWatchManager() {
  const { user } = useAuth();
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);

  const load = async () => {
    if (!user) return;
    const { data, error } = await supabase.from("rss_feeds").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setFeeds((data || []) as Feed[]);
  };

  useEffect(() => { load(); }, [user]);

  const add = async () => {
    if (!user || !label.trim() || !url.trim()) { toast.error("Libellé et URL requis"); return; }
    try { new URL(url); } catch { toast.error("URL invalide"); return; }
    setLoading(true);
    const { error } = await supabase.from("rss_feeds").insert({ user_id: user.id, label: label.trim(), url: url.trim(), source: "google" });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Flux ajouté");
    setLabel(""); setUrl(""); load();
  };

  const remove = async (id: string) => {
    await supabase.from("rss_feeds").delete().eq("id", id);
    setFeeds((p) => p.filter((f) => f.id !== id));
  };

  const toggle = async (f: Feed) => {
    await supabase.from("rss_feeds").update({ is_active: !f.is_active }).eq("id", f.id);
    setFeeds((p) => p.map((x) => x.id === f.id ? { ...x, is_active: !f.is_active } : x));
  };

  const runNow = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke("rss-watch", { body: {} });
      if (error) throw error;
      toast.success(`Scan terminé — ${data?.processed ?? 0} flux traités`);
      load();
    } catch (e: any) { toast.error(e.message || "Erreur scan"); }
    finally { setScanning(false); }
  };

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Rss className="w-4 h-4 text-primary" /> RSS Watch — Google Alerts & flux
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Créez vos alertes sur <a className="underline" href="https://www.google.com/alerts" target="_blank" rel="noreferrer">google.com/alerts</a>, choisissez « Flux RSS » comme mode de livraison, puis collez l'URL ci-dessous.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-[1fr_2fr_auto] gap-2">
          <div>
            <Label className="text-xs">Libellé</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Ex: Marque sur Google" className="rounded-xl" />
          </div>
          <div>
            <Label className="text-xs">URL RSS</Label>
            <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.google.com/alerts/feeds/..." className="rounded-xl" />
          </div>
          <div className="flex items-end">
            <Button onClick={add} disabled={loading} className="rounded-xl w-full">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" />Ajouter</>}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="outline" className="rounded-full">{feeds.length} flux configuré(s)</Badge>
          <Button size="sm" variant="outline" onClick={runNow} disabled={scanning || !feeds.length} className="rounded-xl">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <RefreshCw className="w-4 h-4 mr-1" />}
            Lancer maintenant
          </Button>
        </div>

        <div className="space-y-2">
          {feeds.length === 0 && <p className="text-xs text-muted-foreground text-center py-6">Aucun flux pour l'instant.</p>}
          {feeds.map((f) => (
            <div key={f.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
              <Switch checked={f.is_active} onCheckedChange={() => toggle(f)} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{f.label}</div>
                <a href={f.url} target="_blank" rel="noreferrer" className="text-[11px] text-muted-foreground truncate flex items-center gap-1 hover:underline">
                  <ExternalLink className="w-3 h-3" /> {f.url}
                </a>
                {f.last_fetched_at && <div className="text-[10px] text-muted-foreground">Dernier scan : {new Date(f.last_fetched_at).toLocaleString("fr-FR")}</div>}
              </div>
              <Button size="icon" variant="ghost" aria-label="Supprimer ce flux" onClick={() => remove(f.id)} className="text-destructive">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
