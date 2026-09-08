/**
 * Cache local léger pour le mode hors-ligne.
 * Stocke les dernières données consultées afin que l'application reste lisible
 * sans connexion, puis se resynchronise dès le retour du réseau.
 */

const PREFIX = "focus_offline_v1:";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

type Entry<T> = { at: number; data: T };

export function saveOffline<T>(key: string, data: T) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ at: Date.now(), data } satisfies Entry<T>));
  } catch {
    /* quota dépassé : on ignore silencieusement */
  }
}

export function loadOffline<T>(key: string): { data: T; at: number } | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Entry<T>;
    if (!parsed || typeof parsed.at !== "number") return null;
    if (Date.now() - parsed.at > MAX_AGE_MS) {
      localStorage.removeItem(PREFIX + key);
      return null;
    }
    return { data: parsed.data, at: parsed.at };
  } catch {
    return null;
  }
}

export function clearOffline() {
  try {
    Object.keys(localStorage)
      .filter((k) => k.startsWith(PREFIX))
      .forEach((k) => localStorage.removeItem(k));
  } catch {
    /* noop */
  }
}
