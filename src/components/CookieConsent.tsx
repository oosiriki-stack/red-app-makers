import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n";
import { toast } from "sonner";

const KEY = "focus_cookie_consent_v1";
const EVENT = "focus:cookie-consent";

export type CookieChoice = "all" | "essential" | "reject";
export interface CookieConsentValue {
  choice: CookieChoice;
  date: string;
  analytics: boolean;
  marketing: boolean;
}

export function getCookieConsent(): CookieConsentValue | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CookieConsentValue) : null;
  } catch {
    return null;
  }
}

export function CookieConsent() {
  const { t } = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) setVisible(true);
    const on = () => setVisible(true);
    window.addEventListener(`${EVENT}:open`, on);
    return () => window.removeEventListener(`${EVENT}:open`, on);
  }, []);

  const decide = (choice: CookieChoice) => {
    // GDPR/CCPA: default-off for non-essential. Only "all" enables analytics/marketing.
    const value: CookieConsentValue = {
      choice,
      date: new Date().toISOString(),
      analytics: choice === "all",
      marketing: choice === "all",
    };
    try { localStorage.setItem(KEY, JSON.stringify(value)); } catch {}
    window.dispatchEvent(new CustomEvent(EVENT, { detail: value }));
    setVisible(false);
    toast.success(t("cookie.saved"));
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
          aria-modal="false"
          aria-live="polite"
          aria-label={t("cookie.title")}
        >
          <div className="glass-card rounded-2xl p-4 shadow-2xl border border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Cookie className="h-4 w-4 text-primary" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold mb-1">{t("cookie.title")}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {t("cookie.body")}{" "}
                  <Link to="/cookies" className="underline text-primary">{t("cookie.learn")}</Link>.
                </p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Button size="sm" className="rounded-xl font-semibold" onClick={() => decide("all")}>
                    {t("cookie.accept")}
                  </Button>
                  <Button size="sm" variant="outline" className="rounded-xl" onClick={() => decide("essential")}>
                    {t("cookie.essential")}
                  </Button>
                  <Button size="sm" variant="ghost" className="rounded-xl" onClick={() => decide("reject")}>
                    {t("cookie.reject")}
                  </Button>
                </div>
              </div>
              <button
                onClick={() => decide("reject")}
                className="text-muted-foreground hover:text-foreground shrink-0"
                aria-label={t("cookie.close")}
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
