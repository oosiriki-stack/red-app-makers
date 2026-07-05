import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const KEY = "focus_cookie_consent_v1";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (!stored) setVisible(true);
  }, []);

  const decide = (choice: "all" | "essential") => {
    localStorage.setItem(KEY, JSON.stringify({ choice, date: new Date().toISOString() }));
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-3 left-3 right-3 md:left-auto md:right-4 md:bottom-4 md:max-w-md z-[100]"
          role="dialog"
          aria-label="Consentement cookies"
        >
          <div className="glass-card rounded-2xl p-4 shadow-2xl border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Cookie className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1">Confidentialité & cookies</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Nous utilisons uniquement les cookies nécessaires au bon fonctionnement de Focus.
                  Les cookies d'analyse restent optionnels et respectent le RGPD, la CCPA et la loi
                  ivoirienne 2013-450 sur la protection des données.{" "}
                  <Link to="/cookies" className="underline text-primary">En savoir plus</Link>.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" className="rounded-xl font-semibold" onClick={() => decide("all")}>
                    Tout accepter
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => decide("essential")}>
                    Essentiels uniquement
                  </Button>
                </div>
              </div>
              <button
                onClick={() => decide("essential")}
                className="text-muted-foreground hover:text-foreground shrink-0"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
