import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Monitor, CheckCircle } from "lucide-react";
import { AnimatedPage } from "@/components/AnimatedPage";

export default function Install() {
  const handleInstall = () => {
    const event = (window as any).deferredPrompt;
    if (event) {
      event.prompt();
    } else {
      alert("L'installation PWA est disponible via le menu de votre navigateur.");
    }
  };

  return (
    <AnimatedPage>
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Installer @robase</h1>
          <p className="text-muted-foreground">Accédez à l'application directement depuis votre appareil</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
          <Card className="text-center p-6">
            <Smartphone className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Mobile</h3>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4 text-left">
              <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> Accès hors ligne</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> Notifications push</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> Icône sur l'écran d'accueil</li>
            </ul>
            <Button onClick={handleInstall} className="w-full">
              <Download className="h-4 w-4 mr-2" /> Installer
            </Button>
          </Card>

          <Card className="text-center p-6">
            <Monitor className="h-12 w-12 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Desktop</h3>
            <ul className="text-sm text-muted-foreground space-y-1 mb-4 text-left">
              <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> Application native</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> Lancement rapide</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-3 w-3 text-primary" /> Fonctionne hors ligne</li>
            </ul>
            <Button onClick={handleInstall} variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" /> Installer
            </Button>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  );
}
