import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { playAlertSound, isSoundEnabled } from "@/lib/sound";

/**
 * Active automatiquement les notifications navigateur + toast in-app + son
 * dès qu'une nouvelle mention ou alerte arrive (filtré par user).
 * Demande la permission au premier rendu si elle n'est ni accordée ni refusée.
 */
export function useNotifications() {
  const { user } = useAuth();

  // Demande automatique de permission
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission === "default") {
      // Léger délai pour ne pas spammer au boot
      const t = setTimeout(() => Notification.requestPermission().catch(() => {}), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  // Mentions temps réel
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`notif-mentions-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mentions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const m = payload.new as any;
          const body = `${m.author || "—"} · ${m.source || ""}: ${(m.content || "").slice(0, 90)}`;
          const sev = m.sentiment === "negative" ? "critical" : m.sentiment === "neutral" ? "info" : "warning";

          toast(`@robase — Nouvelle mention`, { description: body });
          if (isSoundEnabled()) playAlertSound(sev as any);

          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification("@robase — Nouvelle mention", {
              body,
              icon: "/favicon.svg",
              tag: `mention-${m.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // Alertes temps réel
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
          toast(a.title || "Alerte", { description: a.description });
          if (isSoundEnabled()) playAlertSound(sev as any);
          if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
            new Notification(a.title || "@robase — Alerte", {
              body: a.description || "",
              icon: "/favicon.svg",
              tag: `alert-${a.id}`,
            });
          }
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);
}
