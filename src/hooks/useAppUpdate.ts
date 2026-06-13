import { useEffect, useRef } from "react";
import { toast } from "sonner";

/**
 * Détecte automatiquement les nouvelles versions de l'application déployée
 * en surveillant l'empreinte des assets dans index.html. Lorsqu'une nouvelle
 * version est détectée, l'utilisateur reçoit une notification et l'app se
 * recharge automatiquement.
 *
 * Fonctionne pour tous les utilisateurs (web + PWA installée).
 */
export function useAppUpdate(intervalMs: number = 60_000) {
  const initialFingerprint = useRef<string | null>(null);
  const notified = useRef(false);

  useEffect(() => {
    let timer: number | undefined;

    const computeFingerprint = (html: string) => {
      // On extrait les chemins des scripts/css buildés (hash Vite)
      const matches = html.match(/\/assets\/[^"'\s>]+/g) || [];
      // On ajoute la balise build-id si présente
      const buildIdMatch = html.match(/name="build-id"\s+content="([^"]+)"/);
      const buildId = buildIdMatch ? buildIdMatch[1] : "";
      return matches.sort().join("|") + "::" + buildId;
    };

    const check = async () => {
      try {
        const res = await fetch(`/index.html?_=${Date.now()}`, {
          cache: "no-store",
          headers: { "cache-control": "no-cache" },
        });
        if (!res.ok) return;
        const html = await res.text();
        const fp = computeFingerprint(html);
        if (!fp) return;

        if (initialFingerprint.current === null) {
          initialFingerprint.current = fp;
          return;
        }
        if (fp !== initialFingerprint.current && !notified.current) {
          notified.current = true;
          toast.success("Nouvelle version disponible", {
            description: "L'application va se mettre à jour automatiquement.",
            duration: 5000,
          });
          // Vide les caches du service worker s'il y en a, puis recharge
          setTimeout(async () => {
            try {
              if ("caches" in window) {
                const keys = await caches.keys();
                await Promise.all(keys.map((k) => caches.delete(k)));
              }
              if ("serviceWorker" in navigator) {
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map((r) => r.update()));
              }
            } catch {
              /* ignore */
            }
            window.location.reload();
          }, 4000);
        }
      } catch {
        /* réseau indisponible, on retentera */
      }
    };

    // Vérifie au démarrage, au retour de focus, et périodiquement
    check();
    const onFocus = () => check();
    window.addEventListener("focus", onFocus);
    window.addEventListener("online", onFocus);
    timer = window.setInterval(check, intervalMs);

    return () => {
      window.removeEventListener("focus", onFocus);
      window.removeEventListener("online", onFocus);
      if (timer) window.clearInterval(timer);
    };
  }, [intervalMs]);
}
