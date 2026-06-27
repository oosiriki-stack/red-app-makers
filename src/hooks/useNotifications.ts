import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { playAlertSound, isSoundEnabled } from "@/lib/sound";

// Cadence professionnelle (Slack/Mention/Brand24) : 1 notification visible / 45s max,
// avec agrégation silencieuse derrière. Les mentions critiques restent prioritaires.
const NOTIF_COOLDOWN_MS = 45_000;

/**
 * Active automatiquement les notifications navigateur + toast in-app + son
 * dès qu'une nouvelle mention ou alerte arrive (filtré par user).
 * Demande la permission au premier rendu si elle n'est ni accordée ni refusée.
 */
export function useNotifications() {
  const { user } = useAuth();
  const lastNotifAt = useRef(0);
  const pendingCount = useRef(0);
  const flushTimer = useRef<number | null>(null);

  // Throttle pro : agrège les notifications dans une fenêtre de 45 s.
  const shouldEmit = (severity: "info" | "warning" | "critical") => {
    const now = Date.now();
    // Les alertes critiques passent toujours (sécurité métier)
    if (severity === "critical") { lastNotifAt.current = now; return true; }
    if (now - lastNotifAt.current >= NOTIF_COOLDOWN_MS) {
      lastNotifAt.current = now;
      return true;
    }
    // Sinon on accumule pour un récap discret
    pendingCount.current += 1;
    if (!flushTimer.current) {
      flushTimer.current = window.setTimeout(() => {
        const n = pendingCount.current;
        pendingCount.current = 0;
        flushTimer.current = null;
        if (n > 0) {
          lastNotifAt.current = Date.now();
          toast(`@focus — ${n} nouvelle${n > 1 ? "s" : ""} mention${n > 1 ? "s" : ""}`, {
            description: "Ouvrez le flux pour voir les détails.",
          });
        }
      }, NOTIF_COOLDOWN_MS);
    }
    return false;
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      const t = setTimeout(() => Notification.requestPermission().catch(() => {}), 2500);
      return () => clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notif-mentions-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mentions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const m = payload.new as any;
          const sev = m.sentiment === "negative" ? "critical" : m.sentiment === "neutral" ? "info" : "warning";
          if (!shouldEmit(sev)) return;
          const body = `${m.author || "—"} · ${m.source || ""}: ${(m.content || "").slice(0, 90)}`;
          toast(`@focus — Nouvelle mention`, { description: body });
          if (isSoundEnabled()) playAlertSound(sev as any);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("@focus — Nouvelle mention", { body, icon: "/favicon.svg", tag: `mention-${m.id}` });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notif-alerts-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "alerts", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const a = payload.new as any;
          const sev = a.type === "critical" ? "critical" : a.type === "warning" ? "warning" : "info";
          if (!shouldEmit(sev)) return;
          toast(a.title || "Alerte", { description: a.description });
          if (isSoundEnabled()) playAlertSound(sev as any);
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(a.title || "@focus — Alerte", { body: a.description || "", icon: "/favicon.svg", tag: `alert-${a.id}` });
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);
}
