import { useEffect, useRef } from "react";
import { mentions } from "@/data/mockData";

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

  useEffect(() => {
    if (!permissionGranted.current && Notification.permission !== "granted") return;

    // Simulate new mention notifications every 30s
    const interval = setInterval(() => {
      const randomMention = mentions[Math.floor(Math.random() * mentions.length)];
      if (Notification.permission === "granted") {
        new Notification("@robase — Nouvelle mention", {
          body: `${randomMention.author} sur ${randomMention.platform}: "${randomMention.content.slice(0, 80)}..."`,
          icon: "/favicon.svg",
          tag: `mention-${randomMention.id}`,
        });
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);
}
