import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedPage } from "@/components/AnimatedPage";
import { toast } from "sonner";

export default function Settings() {
  const [name, setName] = useState("Admin Demo");
  const [email, setEmail] = useState("admin@arobase.ai");
  const [company, setCompany] = useState("Ma Marque");
  const [notifCritical, setNotifCritical] = useState(true);
  const [notifDaily, setNotifDaily] = useState(true);
  const [notifInfluencer, setNotifInfluencer] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("arobase_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        if (user.name) setName(user.name);
        if (user.email) setEmail(user.email);
      } catch {}
    }
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

  const handleSave = () => {
    localStorage.setItem("arobase_user", JSON.stringify({ name, email }));
    localStorage.setItem("arobase_notifs", JSON.stringify({ critical: notifCritical, daily: notifDaily, influencer: notifInfluencer }));
    toast.success("Paramètres sauvegardés avec succès");
  };

  const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AnimatedPage>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-light tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre profil et vos préférences</p>
        </div>

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
            <div className="grid gap-3">
              <div>
                <Label>Nom</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="rounded-xl" />
              </div>
              <div>
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="rounded-xl" />
              </div>
              <div>
                <Label>Entreprise</Label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} className="rounded-xl" />
              </div>
            </div>
            <Button onClick={handleSave} className="rounded-xl">Sauvegarder</Button>
          </CardContent>
        </Card>

        <Card className="glass-card rounded-2xl">
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Alertes critiques</p>
                <p className="text-xs text-muted-foreground">Notifications push pour les crises</p>
              </div>
              <Switch checked={notifCritical} onCheckedChange={setNotifCritical} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Rapport quotidien</p>
                <p className="text-xs text-muted-foreground">Résumé par email chaque matin</p>
              </div>
              <Switch checked={notifDaily} onCheckedChange={setNotifDaily} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Mentions influenceurs</p>
                <p className="text-xs text-muted-foreground">Alerte quand un influenceur vous mentionne</p>
              </div>
              <Switch checked={notifInfluencer} onCheckedChange={setNotifInfluencer} />
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
