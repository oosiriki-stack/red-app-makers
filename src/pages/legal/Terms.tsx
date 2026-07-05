import { Link } from "react-router-dom";
import { ArrowLeft, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 glass-header sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link to="/"><Button variant="ghost" size="icon" className="rounded-xl"><ArrowLeft className="h-5 w-5" /></Button></Link>
          <ScrollText className="h-5 w-5 text-primary" />
          <h1 className="font-semibold">Conditions générales d'utilisation</h1>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8 prose prose-sm dark:prose-invert">
        <p className="text-xs text-muted-foreground">Dernière mise à jour : 5 juillet 2026</p>
        <h2>1. Objet</h2>
        <p>Les présentes CGU régissent l'accès et l'utilisation de la plateforme Focus, éditée par le Groupe CERCO.</p>
        <h2>2. Compte utilisateur</h2>
        <p>L'utilisateur est responsable de la confidentialité de ses identifiants et de toute activité liée à son compte. L'authentification à deux facteurs est recommandée.</p>
        <h2>3. Usage acceptable</h2>
        <p>Toute utilisation à des fins de harcèlement, de surveillance illégale, de scraping massif d'API tierces ou contraire à l'ordre public est strictement interdite.</p>
        <h2>4. Propriété intellectuelle</h2>
        <p>La plateforme, ses modèles IA, sa marque et son interface sont la propriété exclusive du Groupe CERCO. Les mentions collectées restent la propriété de leurs auteurs.</p>
        <h2>5. Disponibilité</h2>
        <p>Focus s'engage à un taux de disponibilité de 99,5% hors maintenance planifiée annoncée 48h à l'avance.</p>
        <h2>6. Facturation</h2>
        <p>Les abonnements sont facturés en FCFA via Wave. Les licences activées ne sont pas remboursables au-delà de 14 jours.</p>
        <h2>7. Responsabilité</h2>
        <p>Focus fournit un outil d'aide à la décision. Les analyses IA sont indicatives et n'engagent pas la responsabilité de l'éditeur en cas de décision commerciale ou juridique fondée uniquement sur celles-ci.</p>
        <h2>8. Résiliation</h2>
        <p>L'utilisateur peut résilier à tout moment depuis Paramètres → Compte. Focus se réserve le droit de suspendre un compte en cas de manquement grave aux présentes CGU.</p>
        <h2>9. Droit applicable</h2>
        <p>Droit ivoirien, avec compétence exclusive des tribunaux d'Abidjan. Pour les utilisateurs UE, application complémentaire du RGPD.</p>
      </main>
    </div>
  );
}
