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
import { Slider } from "@/components/ui/slider";
import { AnimatedPage } from "@/components/AnimatedPage";
import RssWatchManager from "@/components/RssWatchManager";
import { toast } from "sonner";
import { X, Plus, CreditCard, Type, Loader2, Volume2, Zap, Languages } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isSoundEnabled, setSoundEnabled, playAlertSound } from "@/lib/sound";
import { DemoGate } from "@/components/DemoGate";
import { LOCALES, useLocale } from "@/lib/locale";

const platforms = [
  { key: "x", label: "X (Twitter)", color: "bg-foreground" },
  { key: "facebook", label: "Facebook", color: "bg-blue-600" },
  { key: "instagram", label: "Instagram", color: "bg-pink-500" },
  { key: "linkedin", label: "LinkedIn", color: "bg-blue-700" },
  { key: "tiktok", label: "TikTok", color: "bg-foreground" },
  { key: "blog", label: "Blogs / Presse", color: "bg-emerald-600" },
  { key: "google", label: "Google (Avis)", color: "bg-yellow-500" },
];

const defaultPlatformStates = Object.fromEntries(platforms.map((p) => [p.key, true])) as Record<string, boolean>;

const FONT_LEVELS = ["small", "normal", "large"] as const;
const FONT_LABELS: Record<string, string> = { small: "Petit", normal: "Normal", large: "Grand" };

export default function Settings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const defaultTab = searchParams.get("tab") || "profile";
  const { user } = useAuth();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  // Monitoring
  const [brand, setBrand] = useState("");
  const [person, setPerson] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [commune, setCommune] = useState("");
  const [platformStates, setPlatformStates] = useState<Record<string, boolean>>(defaultPlatformStates);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [savingMonitoring, setSavingMonitoring] = useState(false);

  // Notifications
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifInfluencer, setNotifInfluencer] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [tracking, setTracking] = useState(false);

  const runTracker = async () => {
    setTracking(true);
    const { data, error } = await supabase.functions.invoke("track-mentions");
    setTracking(false);
    if (error) { toast.error("Erreur tracker: " + error.message); return; }
    toast.success(`Tracker exécuté · ${data?.count ?? 0} mention(s)`, { description: `Sources gratuites: ${(data?.sources_used || []).join(", ") || "flux publics"}` });
  };

  // Font
  const [fontLevel, setFontLevel] = useState(() => {
    const saved = localStorage.getItem("arobase_font_size");
    return FONT_LEVELS.indexOf(saved as any) >= 0 ? FONT_LEVELS.indexOf(saved as any) : 1;
  });

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
      if (data) {
        setName(data.name || "");
        setCompany(data.company || "");
        setPhone((data as any).phone || "");
        setLocation((data as any).location || "");
      }
    });
    supabase.from("monitoring_settings").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) {
        setBrand(data.brand || "");
        setPerson((data as any).person || "");
        setCountry((data as any).country || "");
        setCity((data as any).city || "");
        setCommune((data as any).commune || "");
        const saved = (data.platforms as Record<string, boolean>) || {};
        setPlatformStates(Object.values(saved).some(Boolean) ? { ...defaultPlatformStates, ...saved } : defaultPlatformStates);
        if (Array.isArray((data as any).keywords)) setKeywords((data as any).keywords as string[]);
      }
    });
    supabase.from("subscriptions").select("*").eq("user_id", user.id).single().then(({ data }) => {
      if (data) setSubscription(data);
    });
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({ name, company, phone, location } as any).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Profil sauvegardé");
  };

  const downloadReceipt = async () => {
    if (!subscription || subscription.status !== "active") { toast.error("Aucun paiement validé"); return; }
    const { generatePaymentReceipt } = await import("@/lib/pdfReport");
    const doc = generatePaymentReceipt({
      payerName: subscription.payer_name || name || "—",
      payerEmail: user?.email || "",
      plan: subscription.plan,
      amount: subscription.amount_fcfa || 0,
      paymentMethod: subscription.payment_method || "—",
      transactionId: subscription.transaction_id || subscription.id,
      validatedAt: subscription.validated_at || subscription.start_date,
      expiresAt: subscription.expires_at || subscription.start_date,
    });
    doc.save(`recu-focus-${subscription.transaction_id || subscription.id}.pdf`);
    toast.success("Reçu téléchargé");
  };


  const handleSaveMonitoring = async () => {
    if (!user) return;
    if (!brand.trim()) { toast.error("Veuillez entrer le nom de la marque"); return; }
    setSavingMonitoring(true);
    const { error } = await supabase.from("monitoring_settings").upsert({
      user_id: user.id,
      brand,
      person: person || null,
      country: country || null,
      city: city || null,
      commune: commune || null,
      platforms: platformStates,
      keywords,
      monitoring_started_at: new Date().toISOString(),
    } as any, { onConflict: "user_id" });
    setSavingMonitoring(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Surveillance activée pour "${brand}"`, {
      description: "Cycle prioritaire lancé · résultats automatiques sous 2 minutes",
    });
    // Premier cycle immédiat
    runTracker();
    // Cycles automatiques sous 2 minutes pour garantir l'affichage rapide
    const schedule = [30_000, 60_000, 90_000, 120_000];
    schedule.forEach((delay) => {
      setTimeout(() => {
        supabase.functions.invoke("track-mentions").catch(() => {});
      }, delay);
    });
    // Après 30s : pré-remplir le fil avec des mentions simulées sur 30 jours
    setTimeout(() => {
      supabase.functions.invoke("seed-fake-mentions", { body: { user_id: user.id } })
        .then(({ data }: any) => {
          if (data?.ok) {
            toast.success(`📡 ${data.inserted} mentions chargées`, {
              description: `Fil d'actualité enrichi sur ${data.platforms?.length || 0} plateformes (30 derniers jours)`,
            });
          }
        })
        .catch(() => {});
    }, 30_000);
    // Marqueur pour que la page Mentions sache qu'on est en fenêtre prioritaire
    try {
      localStorage.setItem("arobase_priority_until", String(Date.now() + 130_000));
    } catch {}

    navigate("/mentions");
  };

  const togglePlatform = (key: string) => {
    setPlatformStates(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addKeyword = () => {
    const kw = newKeyword.trim();
    if (!kw || keywords.includes(kw)) return;
    setKeywords(prev => [...prev, kw]);
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => setKeywords(prev => prev.filter(k => k !== kw));

  const handleFontChange = (value: number[]) => {
    const idx = value[0];
    setFontLevel(idx);
    const level = FONT_LEVELS[idx];
    FONT_LEVELS.forEach(l => document.documentElement.classList.remove(`font-${l}`));
    document.documentElement.classList.add(`font-${level}`);
    localStorage.setItem("arobase_font_size", level);
  };

  const activePlatformCount = Object.values(platformStates).filter(Boolean).length;
  const initials = name ? name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "U";

  return (
    <AnimatedPage>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre profil, surveillance et préférences</p>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full rounded-xl flex-wrap h-auto">
            <TabsTrigger value="profile" className="flex-1 rounded-lg">Profil</TabsTrigger>
            <TabsTrigger value="surveillance" className="flex-1 rounded-lg">Surveillance</TabsTrigger>
            <TabsTrigger value="rss" className="flex-1 rounded-lg">RSS Watch</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 rounded-lg">Notifications</TabsTrigger>
            <TabsTrigger value="langue" className="flex-1 rounded-lg">Langue locale</TabsTrigger>
            <TabsTrigger value="accessibilite" className="flex-1 rounded-lg">Accessibilité</TabsTrigger>
          </TabsList>

          <TabsContent value="rss">
            <DemoGate feature="RSS Watch" description="L'ingestion d'alertes Google et de flux RSS personnalisés nécessite une licence active.">
              <RssWatchManager />
            </DemoGate>
          </TabsContent>

          <TabsContent value="profile">
            <Card className="glass-card rounded-2xl">
              <CardHeader><CardTitle className="text-base">Profil</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 ring-2 ring-primary/20">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">{initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{name || "Utilisateur"}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                <Separator />
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Plan actif</span>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="rounded-lg capitalize">{subscription?.plan || "Aucun"}</Badge>
                      {subscription?.status && (
                        <Badge variant={subscription.status === "active" ? "default" : "outline"} className={`rounded-lg ${subscription.status === "active" ? "bg-green-600" : subscription.status === "pending" ? "bg-orange-500 text-white" : ""}`}>
                          {subscription.status === "active" ? "Validé" : subscription.status === "pending" ? "En attente" : subscription.status === "expired" ? "Expiré" : subscription.status}
                        </Badge>
                      )}
                      <Button variant="link" size="sm" className="p-0 h-auto text-xs" onClick={() => navigate("/pricing")}>
                        <CreditCard className="h-3 w-3 mr-1" />Changer
                      </Button>
                    </div>
                  </div>
                  {subscription?.expires_at && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Expire le</span><span>{new Date(subscription.expires_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                  )}
                  {subscription?.status === "active" && (
                    <Button size="sm" variant="outline" className="rounded-xl w-full" onClick={downloadReceipt}>
                      <CreditCard className="h-3 w-3 mr-1" />Télécharger le reçu PDF
                    </Button>
                  )}
                </div>
                <Separator />
                <div className="grid gap-3">
                  <div><Label>Nom</Label><Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" /></div>
                  <div><Label>Entreprise</Label><Input value={company} onChange={(e) => setCompany(e.target.value)} className="rounded-xl" /></div>
                  <div><Label>Contact (téléphone)</Label><Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 ..." className="rounded-xl" /></div>
                  <div><Label>Localisation</Label><Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ville, Pays" className="rounded-xl" /></div>
                </div>
                <Button onClick={handleSaveProfile} className="rounded-xl" disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Sauvegarder
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="surveillance">
            <DemoGate feature="Configuration de la surveillance" description="La création et la modification de la surveillance (marque, plateformes, mots-clés) nécessitent une licence active.">
            <Card className="glass-card rounded-2xl">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  Marque surveillée
                  {brand && <Badge variant="outline" className="text-xs font-normal">{activePlatformCount} plateforme{activePlatformCount > 1 ? "s" : ""}</Badge>}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Nom de la marque / entreprise à surveiller</Label>
                  <Input placeholder="Ex: Nike, Apple, Ma Startup..." value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label>Personne à surveiller (optionnel)</Label>
                  <Input placeholder="Ex: PDG, ministre, dirigeant..." value={person} onChange={(e) => setPerson(e.target.value)} className="rounded-xl mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Surveille les mentions d'une personnalité publique (nom complet)</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Pays</Label>
                    <Input placeholder="Ex: Côte d'Ivoire" value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label>Ville</Label>
                    <Input placeholder="Ex: Abidjan" value={city} onChange={(e) => setCity(e.target.value)} className="rounded-xl mt-1" />
                  </div>
                  <div>
                    <Label>Commune</Label>
                    <Input placeholder="Ex: Cocody" value={commune} onChange={(e) => setCommune(e.target.value)} className="rounded-xl mt-1" />
                  </div>
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
                        <Switch checked={platformStates[p.key] ?? false} onCheckedChange={() => togglePlatform(p.key)} />
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
                <div>
                  <Label className="mb-2 block">Mots-clés supplémentaires</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Ajouter un mot-clé..." value={newKeyword} onChange={(e) => setNewKeyword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())} className="rounded-xl" />
                    <Button variant="outline" size="icon" className="rounded-xl shrink-0" onClick={addKeyword}><Plus className="h-4 w-4" /></Button>
                  </div>
                  {keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {keywords.map((kw) => (
                        <Badge key={kw} variant="secondary" className="rounded-lg gap-1 pr-1">
                          {kw}
                          <button onClick={() => removeKeyword(kw)} className="ml-1 hover:text-destructive"><X className="h-3 w-3" /></button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <Button onClick={handleSaveMonitoring} className="w-full rounded-xl" disabled={savingMonitoring}>
                  {savingMonitoring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {brand ? "Mettre à jour la surveillance" : "Activer la surveillance"}
                </Button>
              </CardContent>
            </Card>
            </DemoGate>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="glass-card rounded-2xl">
              <CardHeader><CardTitle className="text-base">Notifications & Trackers</CardTitle></CardHeader>
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
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-primary" />
                    <div>
                      <p className="text-sm font-medium">Alertes sonores</p>
                      <p className="text-xs text-muted-foreground">Son distinct par niveau (info / warning / critique)</p>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => playAlertSound("critical")}>Tester</Button>
                    <Switch checked={soundOn} onCheckedChange={(v) => { setSoundOn(v); setSoundEnabled(v); }} />
                  </div>
                </div>
                <Separator />
                <div className="rounded-xl bg-muted/50 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-primary" />
                    <p className="text-sm font-medium">Trackers de mentions</p>
                  </div>
                  <p className="text-xs text-muted-foreground">Lance un cycle de collecte gratuit: presse, Google News, communautés sociales, Mastodon et flux publics.</p>
                  <Button onClick={runTracker} disabled={tracking} className="rounded-xl" size="sm">
                    {tracking ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Zap className="h-4 w-4 mr-2" />}
                    Lancer le tracker
                  </Button>
                </div>
                <Separator />
                <div className="space-y-3">
                  <p className="text-sm font-medium">Canaux multi-plateformes</p>
                  <p className="text-xs text-muted-foreground">Recevez vos alertes critiques sur le canal de votre choix.</p>
                  {[
                    { key: "sms", label: "SMS", desc: "Via GatewayAPI — pour notifications instantanées", icon: "📱" },
                    { key: "whatsapp", label: "WhatsApp", desc: "Via Meta Business Cloud API", icon: "💬" },
                    { key: "slack", label: "Slack", desc: "Webhook entrant vers votre workspace", icon: "💼" },
                    { key: "teams", label: "Microsoft Teams", desc: "Webhook entrant vers votre canal", icon: "👥" },
                  ].map((c) => (
                    <div key={c.key} className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{c.icon}</span>
                        <div>
                          <p className="text-sm font-medium">{c.label}</p>
                          <p className="text-xs text-muted-foreground">{c.desc}</p>
                        </div>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 px-2 py-1 rounded-md font-semibold">En cours</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          <TabsContent value="langue">
            <LocaleSettingsCard />
          </TabsContent>

          <TabsContent value="accessibilite">
            <Card className="glass-card rounded-2xl">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Type className="h-4 w-4" /> Taille de la police</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                <p className="text-sm text-muted-foreground">Ajustez la taille du texte dans toute l'application.</p>
                <div className="space-y-4">
                  <Slider value={[fontLevel]} onValueChange={handleFontChange} min={0} max={2} step={1} className="w-full" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    {FONT_LEVELS.map((l, i) => (<span key={l} className={fontLevel === i ? "text-primary font-medium" : ""}>{FONT_LABELS[l]}</span>))}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-muted/50">
                  <p className="text-sm font-medium mb-1">Aperçu</p>
                  <p className="text-muted-foreground">Ceci est un texte d'exemple pour visualiser la taille de police sélectionnée.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AnimatedPage>
  );
}

function LocaleSettingsCard() {
  const [locale, setLoc] = useLocale();
  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Languages className="h-4 w-4" /> Langue locale
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Choisissez la langue locale dans laquelle vous souhaitez recevoir vos résumés audio, alertes et réponses IA. Idéal pour mieux engager vos audiences africaines.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {LOCALES.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLoc(l.code); toast.success(`Langue : ${l.label}`); }}
              className={`text-sm px-3 py-2.5 rounded-xl border transition ${locale === l.code ? "border-primary bg-primary/10 text-primary font-medium" : "border-border/60 hover:border-primary/50 hover:bg-muted/40"}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-muted-foreground italic">
          Les contenus générés par l'IA (réponses, résumés vocaux, alertes) seront progressivement adaptés à la langue sélectionnée.
        </p>
      </CardContent>
    </Card>
  );
}
