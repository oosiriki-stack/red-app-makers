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
import { X, Plus, CreditCard, Type, Loader2, Volume2, Zap, Languages, Sparkles, Clock, Pause, Play, Sparkle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { isSoundEnabled, setSoundEnabled, playAlertSound } from "@/lib/sound";
import { DemoGate } from "@/components/DemoGate";
import { UI_LOCALES, useT } from "@/lib/i18n";
import { ChannelsCard } from "@/components/ChannelsCard";

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
  const { t } = useT();

  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);

  // Monitoring
  const [brand, setBrand] = useState("");
  const [sector, setSector] = useState("");
  const [person, setPerson] = useState("");
  const [country, setCountry] = useState("");
  const [platformStates, setPlatformStates] = useState<Record<string, boolean>>(defaultPlatformStates);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [newKeyword, setNewKeyword] = useState("");
  const [savingMonitoring, setSavingMonitoring] = useState(false);
  const [paused, setPaused] = useState(false);
  const [togglingPause, setTogglingPause] = useState(false);


  // Notifications
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifInfluencer, setNotifInfluencer] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const [tracking, setTracking] = useState(false);
  const [importingGoogle, setImportingGoogle] = useState(false);

  const runTracker = async () => {
    setTracking(true);
    const { data, error } = await supabase.functions.invoke("track-mentions");
    setTracking(false);
    if (error) { toast.error("Erreur tracker: " + error.message); return; }
    toast.success(`Tracker exécuté · ${data?.count ?? 0} mention(s)`, { description: `Sources gratuites: ${(data?.sources_used || []).join(", ") || "flux publics"}` });
  };

  const importGoogleReviews = async () => {
    if (!brand) { toast.error("Renseignez d'abord une marque à surveiller"); return; }
    setImportingGoogle(true);
    const { data, error } = await supabase.functions.invoke("google-reviews-scan");
    setImportingGoogle(false);
    if (error) { toast.error("Erreur avis Google: " + error.message); return; }
    if ((data as any)?.error) { toast.error((data as any).error); return; }
    const { imported = 0, skipped = 0 } = (data as any) || {};
    toast.success(`⭐ ${imported} avis Google importé(s)`, { description: skipped ? `${skipped} déjà présents` : "Consultez l'onglet Mentions" });
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
        setSector((data as any).sector || "");
        setPerson((data as any).person || "");
        setCountry((data as any).country || "");
        const saved = (data.platforms as Record<string, boolean>) || {};
        setPlatformStates(Object.values(saved).some(Boolean) ? { ...defaultPlatformStates, ...saved } : defaultPlatformStates);
        if (Array.isArray((data as any).keywords)) setKeywords((data as any).keywords as string[]);
        setPaused(Boolean((data as any).paused));
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
      sector: sector || null,
      person: person || null,
      country: country || null,
      platforms: platformStates,
      keywords,
      paused,
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

  const togglePause = async () => {
    if (!user) return;
    setTogglingPause(true);
    const newPaused = !paused;
    const { error } = await supabase
      .from("monitoring_settings")
      .upsert({ user_id: user.id, paused: newPaused, brand: brand || "" } as any, { onConflict: "user_id" });
    setTogglingPause(false);
    if (error) { toast.error(error.message); return; }
    setPaused(newPaused);
    toast.success(newPaused ? "⏸️ Surveillance mise en pause" : "▶️ Surveillance relancée", {
      description: newPaused
        ? "Aucune nouvelle mention ne sera collectée tant que vous n'aurez pas repris."
        : "La collecte automatique des mentions reprend.",
    });
  };


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
          <h1 className="text-3xl font-light tracking-tight">{t("settings.title")}</h1>
          <p className="text-muted-foreground">{t("settings.subtitle")}</p>
        </div>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="w-full rounded-xl flex-wrap h-auto">
            <TabsTrigger value="profile" className="flex-1 rounded-lg">{t("settings.tab.profile")}</TabsTrigger>
            <TabsTrigger value="surveillance" className="flex-1 rounded-lg">{t("settings.tab.surveillance")}</TabsTrigger>
            <TabsTrigger value="rss" className="flex-1 rounded-lg">{t("settings.tab.rss")}</TabsTrigger>
            <TabsTrigger value="notifications" className="flex-1 rounded-lg">{t("settings.tab.notifications")}</TabsTrigger>
            <TabsTrigger value="langue" className="flex-1 rounded-lg">{t("settings.tab.langue")}</TabsTrigger>
            <TabsTrigger value="accessibilite" className="flex-1 rounded-lg">{t("settings.tab.accessibilite")}</TabsTrigger>
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
                <PlanActiveCard subscription={subscription} onChange={() => navigate("/pricing")} onReceipt={downloadReceipt} />

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
                <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
                  <span>Marque surveillée</span>
                  <div className="flex items-center gap-2">
                    {brand && <Badge variant="outline" className="text-xs font-normal">{activePlatformCount} plateforme{activePlatformCount > 1 ? "s" : ""}</Badge>}
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-lg text-xs"
                      onClick={() => {
                        if (brand && !window.confirm(t("surveillance.newConfirm"))) return;
                        setBrand("");
                        setSector("");
                        setPerson("");
                        setCountry("");
                        setKeywords([]);
                        setNewKeyword("");
                        setPlatformStates(defaultPlatformStates);
                        toast.success(t("surveillance.newReady"));
                      }}
                    >
                      <Sparkle className="h-3.5 w-3.5 mr-1" />
                      {t("surveillance.new")}
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Nom de la marque / entreprise à surveiller</Label>
                  <Input placeholder="Ex: Nike, Apple, Ma Startup..." value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded-xl mt-1" />
                </div>
                <div>
                  <Label>Secteur d'activité</Label>
                  <Input placeholder="Ex: Banque, Télécoms, E-commerce, Santé..." value={sector} onChange={(e) => setSector(e.target.value)} className="rounded-xl mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Permet d'affiner les mentions et alertes selon votre industrie.</p>
                </div>
                <div>
                  <Label>Personne à surveiller (optionnel)</Label>
                  <Input placeholder="Ex: PDG, ministre, dirigeant..." value={person} onChange={(e) => setPerson(e.target.value)} className="rounded-xl mt-1" />
                  <p className="text-xs text-muted-foreground mt-1">Surveille les mentions d'une personnalité publique (nom complet)</p>
                </div>
                <div>
                  <Label>Pays</Label>
                  <Input placeholder="Ex: Côte d'Ivoire" value={country} onChange={(e) => setCountry(e.target.value)} className="rounded-xl mt-1" />
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
                {brand && (
                  <div className={`rounded-2xl border p-4 flex items-center justify-between gap-3 ${paused ? "bg-amber-500/10 border-amber-500/30" : "bg-emerald-500/10 border-emerald-500/30"}`}>
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${paused ? "bg-amber-500/20 text-amber-600" : "bg-emerald-500/20 text-emerald-600"}`}>
                        {paused ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{paused ? "Surveillance en pause" : "Surveillance active"}</p>
                        <p className="text-xs text-muted-foreground">{paused ? "Aucune nouvelle mention n'est collectée." : "Collecte automatique en cours sur toutes les plateformes activées."}</p>
                      </div>
                    </div>
                    <Button variant={paused ? "default" : "outline"} size="sm" className="rounded-xl shrink-0" onClick={togglePause} disabled={togglingPause}>
                      {togglingPause ? <Loader2 className="h-4 w-4 animate-spin" /> : paused ? <><Play className="h-4 w-4 mr-1" />Reprendre</> : <><Pause className="h-4 w-4 mr-1" />Mettre en pause</>}
                    </Button>
                  </div>
                )}
                {brand && platformStates.google && (
                  <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center shrink-0">⭐</div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">Import avis Google (Apify)</p>
                        <p className="text-xs text-muted-foreground">Récupère jusqu'à 50 avis Google Maps pour « {brand} ».</p>
                      </div>
                    </div>
                    <Button onClick={importGoogleReviews} disabled={importingGoogle} size="sm" variant="outline" className="rounded-xl w-full">
                      {importingGoogle ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                      {importingGoogle ? "Import en cours…" : "Importer les avis Google"}
                    </Button>
                  </div>
                )}
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
                <ChannelsCard />

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

const LANG_STORAGE_KEY = "focus_locale_langs_v1";
const LANG_SETTINGS_KEY = "focus_locale_settings_v1";

const IVORIAN_LANGS = [
  { code: "dyu", flag: "🇨🇮", label: "Dioula" },
  { code: "bci", flag: "🇨🇮", label: "Baoulé" },
  { code: "bet", flag: "🇨🇮", label: "Bété" },
  { code: "ati", flag: "🇨🇮", label: "Attié" },
  { code: "any", flag: "🇨🇮", label: "Agni" },
  { code: "sef", flag: "🇨🇮", label: "Sénoufo" },
  { code: "dnj", flag: "🇨🇮", label: "Yacouba (Dan)" },
  { code: "gxx", flag: "🇨🇮", label: "Guéré" },
  { code: "abo", flag: "🇨🇮", label: "Abbey" },
  { code: "dic", flag: "🇨🇮", label: "Dida" },
];

const AFRICAN_LANGS = [
  { code: "bm", flag: "🇲🇱", label: "Bambara" },
  { code: "wo", flag: "🇸🇳", label: "Wolof" },
  { code: "sus", flag: "🇬🇳", label: "Soussou" },
  { code: "tw", flag: "🇬🇭", label: "Twi" },
  { code: "yo", flag: "🇳🇬", label: "Yoruba" },
  { code: "ig", flag: "🇳🇬", label: "Igbo" },
  { code: "ha", flag: "🇳🇬", label: "Hausa" },
  { code: "ewo", flag: "🇨🇲", label: "Ewondo" },
  { code: "dua", flag: "🇨🇲", label: "Duala" },
  { code: "ee", flag: "🇹🇬", label: "Éwé" },
  { code: "fon", flag: "🇧🇯", label: "Fon" },
  { code: "ln", flag: "🇨🇩", label: "Lingala" },
  { code: "sw", flag: "🇰🇪", label: "Swahili" },
];

const DEFAULT_LANG_SETTINGS = {
  autoDetect: true,
  autoTranslateFr: true,
  keepOriginal: true,
  sentimentInOriginal: true,
};

function UILanguagePicker() {
  const { locale, setLocale, t } = useT();
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{t("settings.uiLanguage")}</p>
      <p className="text-xs text-muted-foreground">{t("settings.uiLanguageDesc")}</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
        {UI_LOCALES.map((l) => {
          const active = locale === l.code;
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => setLocale(l.code)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm text-left transition-all ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border/60 hover:border-primary/40 hover:bg-muted/40"}`}
            >
              <span className="text-lg leading-none">{l.flag}</span>
              <span className="flex-1 truncate">{l.label}</span>
              {active && <Badge variant="secondary" className="h-4 px-1 text-[9px]">ON</Badge>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function LocaleSettingsCard() {
  const [selected, setSelected] = useState<string[]>(() => {
    try { return JSON.parse(localStorage.getItem(LANG_STORAGE_KEY) || "[\"fr\"]"); } catch { return ["fr"]; }
  });
  const [settings, setSettings] = useState(() => {
    try { return { ...DEFAULT_LANG_SETTINGS, ...JSON.parse(localStorage.getItem(LANG_SETTINGS_KEY) || "{}") }; } catch { return DEFAULT_LANG_SETTINGS; }
  });
  const [customLang, setCustomLang] = useState("");

  useEffect(() => { localStorage.setItem(LANG_STORAGE_KEY, JSON.stringify(selected)); }, [selected]);
  useEffect(() => { localStorage.setItem(LANG_SETTINGS_KEY, JSON.stringify(settings)); }, [settings]);

  const toggle = (code: string) => {
    if (code === "fr") return;
    setSelected((s) => s.includes(code) ? s.filter(c => c !== code) : [...s, code]);
  };

  const addCustom = () => {
    const v = customLang.trim();
    if (!v) return;
    const code = "custom-" + v.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12);
    if (!selected.includes(code)) setSelected((s) => [...s, code]);
    setCustomLang("");
    toast.success(`Langue « ${v} » ajoutée (bêta)`);
  };

  const renderGroup = (title: string, langs: typeof AFRICAN_LANGS) => (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {langs.map((l) => {
          const active = selected.includes(l.code);
          return (
            <button
              key={l.code}
              type="button"
              onClick={() => toggle(l.code)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm text-left transition-all ${active ? "border-primary bg-primary/10 shadow-sm" : "border-border/60 hover:border-primary/40 hover:bg-muted/40"}`}
            >
              <span className="text-lg leading-none">{l.flag}</span>
              <span className="flex-1 truncate">{l.label}</span>
              {active && <Badge variant="secondary" className="h-4 px-1 text-[9px]">ON</Badge>}
            </button>
          );
        })}
      </div>
    </div>
  );

  const SettingRow = ({ k, label, desc }: { k: keyof typeof DEFAULT_LANG_SETTINGS; label: string; desc: string }) => (
    <div className="flex items-start justify-between gap-3 py-2">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={settings[k]} onCheckedChange={(v) => setSettings((s: any) => ({ ...s, [k]: v }))} />
    </div>
  );

  return (
    <Card className="glass-card rounded-2xl">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Languages className="h-4 w-4" /> Gestion des langues locales
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <UILanguagePicker />

        <Separator />

        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/30">
          <span className="text-xl">🇫🇷</span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Français</p>
            <p className="text-xs text-muted-foreground">Langue par défaut (toujours active)</p>
          </div>
          <Badge className="rounded-lg">Par défaut</Badge>
        </div>


        {renderGroup("Langues locales de Côte d'Ivoire", IVORIAN_LANGS)}
        {renderGroup("Autres langues africaines", AFRICAN_LANGS)}

        <Separator />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Paramètres</p>
          <SettingRow k="autoDetect" label="Détecter automatiquement la langue" desc="Identifie la langue de chaque mention détectée." />
          <SettingRow k="autoTranslateFr" label="Traduire automatiquement en français" desc="Affiche une traduction FR sous le texte original." />
          <SettingRow k="keepOriginal" label="Conserver le texte original" desc="Le contenu source reste visible en plus de la traduction." />
          <SettingRow k="sentimentInOriginal" label="Analyser le sentiment dans la langue d'origine" desc="Améliore la précision du score de sentiment." />
        </div>

        <Separator />

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ajouter une langue personnalisée (bêta)</p>
          <div className="flex gap-2">
            <Input placeholder="ex. Malinké, Toucouleur…" value={customLang} onChange={(e) => setCustomLang(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} className="rounded-xl" />
            <Button type="button" onClick={addCustom} className="rounded-xl"><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">{selected.length}</span> langue{selected.length > 1 ? "s" : ""} active{selected.length > 1 ? "s" : ""} pour le scraping et l'analyse.
          </p>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast.success("Préférences de langues enregistrées")}>Enregistrer</Button>
        </div>
      </CardContent>
    </Card>
  );
}

function PlanActiveCard({ subscription, onChange, onReceipt }: { subscription: any; onChange: () => void; onReceipt: () => void; }) {
  const plan = subscription?.plan || "Aucun";
  const status = subscription?.status as string | undefined;
  const isTrial = plan === "trial";
  const planLabel = isTrial ? "Essai gratuit" : plan;

  // Calcul jours restants + total pour la jauge
  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const startAt = subscription?.start_date ? new Date(subscription.start_date) : (subscription?.validated_at ? new Date(subscription.validated_at) : null);
  const now = Date.now();
  const totalMs = expiresAt && startAt ? Math.max(1, expiresAt.getTime() - startAt.getTime()) : (isTrial ? 7 * 86400000 : 30 * 86400000);
  const remainMs = expiresAt ? Math.max(0, expiresAt.getTime() - now) : 0;
  const daysLeft = Math.ceil(remainMs / 86400000);
  const pct = Math.max(0, Math.min(100, Math.round((remainMs / totalMs) * 100)));

  const tone = status !== "active" ? "muted" : daysLeft <= 3 ? "danger" : daysLeft <= 7 ? "warn" : "ok";
  const gradient = tone === "danger"
    ? "from-red-500 to-rose-600"
    : tone === "warn"
    ? "from-amber-400 to-orange-500"
    : tone === "ok"
    ? "from-emerald-500 to-teal-600"
    : "from-muted-foreground/40 to-muted-foreground/60";

  return (
    <div className="rounded-2xl border border-border/40 bg-gradient-to-br from-card via-card to-muted/30 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">Plan actif</p>
          </div>
          <p className="text-xl font-bold capitalize leading-tight">{planLabel}</p>
          {status && (
            <Badge
              variant="outline"
              className={`rounded-md text-[10px] ${status === "active" ? "border-emerald-500/40 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5" : status === "pending" ? "border-orange-500/40 text-orange-600 bg-orange-500/5" : "border-muted-foreground/30 text-muted-foreground"}`}
            >
              {status === "active" ? "✓ Validé" : status === "pending" ? "⏳ En attente" : status === "expired" ? "⚠ Expiré" : status}
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" className="rounded-xl shrink-0 gap-1" onClick={onChange}>
          <CreditCard className="h-3.5 w-3.5" />Changer
        </Button>
      </div>

      {expiresAt && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>Temps restant</span>
            </div>
            <span className={`font-bold tabular-nums ${tone === "danger" ? "text-red-600" : tone === "warn" ? "text-orange-600" : "text-foreground"}`}>
              {daysLeft > 0 ? `${daysLeft} jour${daysLeft > 1 ? "s" : ""}` : "Expiré"}
            </span>
          </div>
          <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full bg-gradient-to-r ${gradient} transition-all duration-700 ease-out shadow-sm`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">
            Expire le <span className="font-medium text-foreground">{expiresAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}</span>
          </p>
        </div>
      )}

      {status === "active" && !isTrial && (
        <Button size="sm" variant="ghost" className="rounded-xl w-full mt-3 text-xs hover:bg-primary/5" onClick={onReceipt}>
          <CreditCard className="h-3 w-3 mr-1.5" />Télécharger le reçu PDF
        </Button>
      )}
    </div>
  );
}


