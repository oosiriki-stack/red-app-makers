import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useNotifications() {
  const permissionGranted = useRef(false);

  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "granted") {
      permissionGranted.current = true;
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then((perm) => {
        permissionGranted.current = perm === "granted";
      });
    }
  }, []);

  // Listen for new mentions via Supabase realtime
  useEffect(() => {
    const channel = supabase.channel("mentions-notifications")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mentions" }, (payload) => {
        if (Notification.permission === "granted") {
          const mention = payload.new as any;
          new Notification("Focus — Nouvelle mention", {
            body: `${mention.author} sur ${mention.source}: "${(mention.content || "").slice(0, 80)}..."`,
            icon: "/favicon.svg",
            tag: `mention-${mention.id}`,
          });
        }
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);
}
