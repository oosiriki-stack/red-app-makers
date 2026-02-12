import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AnimatedPage } from "@/components/AnimatedPage";

export default function Settings() {
  return (
    <AnimatedPage>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Paramètres</h1>
          <p className="text-muted-foreground">Gérez votre profil et vos préférences</p>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Profil</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary text-primary-foreground text-xl">AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Admin Demo</p>
                <p className="text-sm text-muted-foreground">admin@arobase.ai</p>
              </div>
            </div>
            <Separator />
            <div className="grid gap-3">
              <div>
                <Label>Nom</Label>
                <Input defaultValue="Admin Demo" />
              </div>
              <div>
                <Label>Email</Label>
                <Input defaultValue="admin@arobase.ai" type="email" />
              </div>
              <div>
                <Label>Entreprise</Label>
                <Input defaultValue="Ma Marque" />
              </div>
            </div>
            <Button>Sauvegarder</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notifications</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Alertes critiques</p>
                <p className="text-xs text-muted-foreground">Notifications push pour les crises</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Rapport quotidien</p>
                <p className="text-xs text-muted-foreground">Résumé par email chaque matin</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Mentions influenceurs</p>
                <p className="text-xs text-muted-foreground">Alerte quand un influenceur vous mentionne</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </div>
    </AnimatedPage>
  );
}
