import { Link } from "react-router-dom";
import { ArrowLeft, Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Cookies() {
  const reset = () => {
    localStorage.removeItem("focus_cookie_consent_v1");
    location.reload();
  };
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 glass-header sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <Cookie className="h-5 w-5 text-primary" />
          <h1 className="font-semibold">Politique cookies</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 prose prose-sm dark:prose-invert">
        <p className="text-xs text-muted-foreground">Dernière mise à jour : 5 juillet 2026</p>
        <h2>1. Qu'est-ce qu'un cookie ?</h2>
        <p>Un cookie est un petit fichier déposé sur votre appareil pour mémoriser vos préférences ou faciliter votre navigation.</p>
        <h2>2. Cookies utilisés par Focus</h2>
        <table>
          <thead><tr><th>Nom</th><th>Finalité</th><th>Durée</th><th>Type</th></tr></thead>
          <tbody>
            <tr><td>sb-*-auth-token</td><td>Session utilisateur (Supabase)</td><td>1 an</td><td>Essentiel</td></tr>
            <tr><td>arobase_dark</td><td>Thème sombre / clair</td><td>1 an</td><td>Essentiel</td></tr>
            <tr><td>focus_ui_locale</td><td>Langue de l'interface</td><td>1 an</td><td>Essentiel</td></tr>
            <tr><td>focus_cookie_consent_v1</td><td>Mémorise votre choix</td><td>1 an</td><td>Essentiel</td></tr>
          </tbody>
        </table>
        <h2>3. Aucun traceur publicitaire</h2>
        <p>Focus n'utilise ni Google Analytics, ni pixels Meta/TikTok, ni traceur tiers marketing.</p>
        <h2>4. Modifier votre choix</h2>
        <p>
          <Button size="sm" className="rounded-xl" onClick={reset}>Réinitialiser mon consentement</Button>
        </p>
      </main>
    </div>
  );
}
