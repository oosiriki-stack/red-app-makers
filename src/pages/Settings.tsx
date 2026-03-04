import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";
import { X, Plus, CreditCard } from "lucide-react";

const platforms = [
  { key: "x", label: "X (Twitter)", color: "bg-foreground" },
  { key: "facebook", label: "Facebook", color: "bg-blue-600" },
  { key: "instagram", label: "Instagram", color: "bg-pink-500" },
  { key: "linkedin", label: "LinkedIn", color: "bg-blue-700" },
  { key: "tiktok", label: "TikTok", color: "bg-foreground" },
  { key: "blog", label: "Blogs / Presse", color: "bg-emerald-600" },
  { key: "google", label: "Google (Avis)", color: "bg-yellow-500" },
];

interface TrackingConfig {
  brand: string;
  platforms: Record<string, boolean>;
  keywords: string[];
}

const defaultTracking: TrackingConfig = {
  brand: "",
  platforms: { x: true, facebook: true, instagram: true, linkedin: true, tiktok: false, blog: false, google: false },
  keywords: [],
};

function loadTracking(): TrackingConfig {
  try {
    const raw = localStorage.getItem("arobase_tracking");
    if (raw) return { ...defaultTracking, ...JSON.parse(raw) };
  } catch {}
  return defaultTracking;
}

export default function Settings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("tab") || "profile";

  const [name, setName] = useState("Admin Demo");
  const [email, setEmail] = useState("admin@arobase.ai");
  const [company, setCompany] = useState("Ma Marque");
  const [registeredAt, setRegisteredAt] = useState<string | null>(null);
  const [activePlan, setActivePlan] = useState("Gratuit");
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifInfluencer, setNotifInfluencer] = useState(false);

  const [tracking, setTracking] = useState<TrackingConfig>(loadTracking);
  const [newKeyword, setNewKeyword] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("arobase_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
        if (user.company) setCompany(user.company);
        if (user.registeredAt) setRegisteredAt(user.registeredAt);
      } catch {}
    }
    const plan = localStorage.getItem("arobase_plan");
    if (plan) setActivePlan(plan);
    const notifs = localStorage.getItem("arobase_notifs");
    if (notifs) {
      try {
        const n = JSON.parse(notifs);
        setNotifCritical(n.critical ?? true);
        setNotifDaily(n.daily ?? true);
        setNotifInfluencer(n.influencer ?? false);
      } catch {}
    }
  }, []);

  const handleSaveProfile = () => {
    localStorage.setItem("arobase_user", JSON.stringify({ name, email, company, registeredAt: registeredAt || new Date().toISOString() }));
    localStorage.setItem("arobase_notifs", JSON.stringify({ critical: notifCritical, daily: notifDaily, influencer: notifInfluencer }));
    toast.success("Profil sauvegardé");
  };

  const handleSaveTracking = () => {
    if (!tracking.brand.trim()) { toast.error("Veuillez entrer le nom de la marque à surveiller"); return; }
    localStorage.setItem("arobase_tracking", JSON.stringify(tracking));
    toast.success(`Surveillance activée pour "${tracking.brand}"`);
  };

  const togglePlatform = (key: string) => {
    setTracking(prev => ({ ...prev, platforms: { ...prev.platforms, [key]: !prev.platforms[key] } }));
  };

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (!kw) return;
    if (tracking.keywords.includes(kw)) { toast.error("Mot-clé déjà ajouté"); return; }
    setTracking(prev => ({ ...prev, keywords: [...prev.keywords, kw] }));
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    setTracking(prev => ({ ...prev, keywords: prev.keywords.filter(k => k !== kw) }));
  };

  const activePlatformCount = Object.values(tracking.platforms).filter(Boolean).length;
  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AnimatedPage>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre profil, surveillance et préférences</p>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full rounded-xl">
            <TabsTrigger value="profile" className="flex-1 rounded-lg">Profil</TabsTrigger>
            <TabsTrigger value="surveillance" className="flex-1 rounded-lg">Surveillance</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 rounded-lg">Notifications</TabsTrigger>
          </TabsList>

          {/* ── Profil ── */}
          <TabsContent value="profile">
            <Card className="glass-card rounded-2xl">
              <CardHeader><CardTitle className="text-base">Profil</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{name}</p>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>
                <Separator />

                {/* Registration date & plan */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Inscrit le</span>
                  <span>{registeredAt ? new Date(registeredAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—"}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Plan actif</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="rounded-lg">{activePlan}</Badge>
                    <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigate("/pricing")}>
                      <CreditCard className="h-3 w-3 mr-1" /> Changer de plan
                    </Button>
                  </div>
                </div>
                <Separator />

                <div className="grid gap-3">
                  <div><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" /></div>
                  <div><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="rounded-xl" /></div>
                  <div><Label>Entreprise</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} className="rounded-xl" /></div>
                </div>
                <Button onClick={handleSaveProfile} className="rounded-xl">Sauvegarder</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Surveillance ── */}
          <TabsContent value="surveillance">
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Marque surveillée
                  {tracking.brand && (
                    <Badge variant="outline" className="text-xs font-normal">
                      {activePlatformCount} plateforme{activePlatformCount > 1 ? "s" : ""} active{activePlatformCount > 1 ? "s" : ""}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Nom de la marque / entreprise à surveiller</Label>
                  <Input placeholder="Ex: Nike, Apple, Ma Startup..." value={tracking.brand} onChange={(e) => setTracking(prev => ({ ...prev, brand: e.target.value }))} className="rounded-xl mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Ce nom sera utilisé dans tout le dashboard et les rapports.</p>
                </div>
                <Separator />
                <div>
                  <Label className="mb-3 block">Plateformes à tracker</Label>
                  <div className="space-y-3">
                    {platforms.map((p) => (
                      <div key={p.key} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${p.color}`} />
                          <span className="text-sm">{p.label}</span>
                        </div>
                        <Switch checked={tracking.platforms[p.key] ?? false} onCheckedChange={() => togglePlatform(p.key)} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="mb-2 block">Mots-clés supplémentaires</Label>
                  <p className="text-xs text-muted-foreground mb-3">Ajoutez des termes spécifiques à surveiller en plus du nom de la marque.</p>
                  <div className="flex gap-2">
                    <Input placeholder="Ajouter un mot-clé..." value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())} className="rounded-xl" />
                    <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={addKeyword}><Plus className="h-4 w-4" /></Button>
                  </div>
                  {tracking.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {tracking.keywords.map((kw) => (
                        <Badge key={kw} variant="secondary" className="rounded-lg gap-1 pr-1">
                          {kw}
                          <button onClick={() => removeKeyword(kw)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleSaveTracking} className="w-full rounded-xl">
                  {tracking.brand ? "Mettre à jour la surveillance" : "Activer la surveillance"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Notifications ── */}
          <TabsContent value="notifications">
            <Card className="glass-card rounded-2xl">
              <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Alertes critiques</p><p className="text-xs text-muted-foreground">Notifications push pour les crises</p></div>
                  <Switch checked={notifCritical} onCheckedChange={setNotifCritical} />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Rapport quotidien</p><p className="text-xs text-muted-foreground">Résumé par email chaque matin</p></div>
                  <Switch checked={notifDaily} onCheckedChange={setNotifDaily} />
                </div>
                <div className="flex items-center justify-between">
                  <div><p className="text-sm font-medium">Mentions influenceurs</p><p className="text-xs text-muted-foreground">Alerte quand un influenceur vous mentionne</p></div>
                  <Switch checked={notifInfluencer} onCheckedChange={setNotifInfluencer} />
                </div>
                <Button onClick={handleSaveProfile} className="rounded-xl">Sauvegarder</Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}
