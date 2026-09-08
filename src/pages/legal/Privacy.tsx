import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 glass-header sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon" aria-label="Retour à l’accueil" className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h1 className="font-semibold">Politique de confidentialité</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 prose prose-sm dark:prose-invert">
        <p className="text-xs text-muted-foreground">Dernière mise à jour : 5 juillet 2026</p>
        <h2>1. Responsable de traitement</h2>
        <p>Focus (Groupe CERCO), Abidjan, Côte d'Ivoire — contact : s.ouattara@groupecerco.com.</p>
        <h2>2. Données collectées</h2>
        <ul>
          <li>Identifiants de compte (email, nom, téléphone).</li>
          <li>Paramètres de surveillance (marque, mots-clés, plateformes).</li>
          <li>Journaux techniques (adresse IP, user-agent) à des fins de sécurité.</li>
        </ul>
        <h2>3. Bases légales</h2>
        <p>Exécution du contrat, obligation légale, intérêt légitime (sécurité), consentement (cookies analytiques).</p>
        <h2>4. Durée de conservation</h2>
        <p>Données de compte : durée de la relation contractuelle + 3 ans. Journaux techniques : 12 mois maximum.</p>
        <h2>5. Vos droits</h2>
        <p>Conformément au RGPD, à la CCPA et à la loi ivoirienne n° 2013-450, vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition, de limitation et de portabilité. Contact : privacy@focus.app.</p>
        <h2>6. Sous-traitants</h2>
        <p>Supabase (hébergement UE), Wave (paiements Afrique de l'Ouest), Lovable AI Gateway (analyse IA). Tous soumis à des clauses contractuelles conformes.</p>
        <h2>7. Sécurité</h2>
        <p>Chiffrement TLS 1.3 en transit, chiffrement AES-256 au repos, Row Level Security côté base, authentification multi-facteurs disponible, rotation régulière des clés.</p>
        <h2>8. Transferts internationaux</h2>
        <p>Les données peuvent transiter par l'UE et les États-Unis via des clauses contractuelles types de la Commission européenne.</p>
        <h2>9. Autorité de contrôle</h2>
        <p>ARTCI (Côte d'Ivoire), CNIL (France), EDPB (UE).</p>
      </main>
    </div>
  );
}
