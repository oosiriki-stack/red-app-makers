import { Card } from "@/components/ui/card";
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
          <h1 className="text-3xl font-light tracking-tight">Installer @robase</h1>
          <p className="text-muted-foreground">Accédez à l'application directement depuis votre appareil</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
          <Card className="glass-card rounded-2xl text-center p-8 hover-3d">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-3 text-lg">Mobile</h3>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Accès hors ligne</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Notifications push</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Icône sur l'écran d'accueil</li>
            </ul>
            <Button onClick={handleInstall} className="w-full rounded-xl h-11">
              <Download className="h-4 w-4 mr-2" /> Installer
            </Button>
          </Card>

          <Card className="glass-card rounded-2xl text-center p-8 hover-3d">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Monitor className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-3 text-lg">Desktop</h3>
            <ul className="text-sm text-muted-foreground space-y-2 mb-6 text-left">
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Application native</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Lancement rapide</li>
              <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary shrink-0" /> Fonctionne hors ligne</li>
            </ul>
            <Button onClick={handleInstall} variant="outline" className="w-full rounded-xl h-11">
              <Download className="h-4 w-4 mr-2" /> Installer
            </Button>
          </Card>
        </div>
      </div>
    </AnimatedPage>
  );
}
