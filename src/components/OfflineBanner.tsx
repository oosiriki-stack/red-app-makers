import { useEffect, useRef } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useOnline } from "@/hooks/useOnline";

/**
 * Bandeau hors-ligne : informe l'utilisateur que les données affichées
 * proviennent du cache local, et confirme la resynchronisation au retour du réseau.
 */
export function OfflineBanner() {
  const online = useOnline();
  const wasOffline = useRef(false);

  useEffect(() => {
    if (!online) {
      wasOffline.current = true;
      return;
    }
    if (wasOffline.current) {
      wasOffline.current = false;
      toast.success("Connexion rétablie — synchronisation des données en cours", {
        icon: <Wifi className="h-4 w-4" />,
      });
    }
  }, [online]);

  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          role="status"
          aria-live="polite"
          className="overflow-hidden bg-muted border-b border-border"
        >
          <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2 flex items-center gap-2 text-xs sm:text-sm text-foreground">
            <WifiOff className="h-4 w-4 shrink-0" aria-hidden />
            <span>
              Mode hors-ligne — vous consultez les dernières données enregistrées. Tout se remettra à jour dès le
              retour de la connexion.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
