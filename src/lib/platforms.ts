// Liste harmonisée des plateformes surveillées par Focus.
// Une seule source de vérité pour l'UI (Settings, Mentions, Filtres, etc.).
export type PlatformKey =
  | "x"
  | "facebook"
  | "instagram"
  | "linkedin"
  | "tiktok"
  | "blog"
  | "google";

export interface PlatformDef {
  key: PlatformKey;
  label: string;
  color: string;         // classe Tailwind pour le point de couleur
  icon: string;          // emoji fallback
  domainHint?: string;
}

export const PLATFORMS: readonly PlatformDef[] = [
  { key: "x",         label: "X (Twitter)",   color: "bg-foreground",  icon: "𝕏", domainHint: "x.com" },
  { key: "facebook",  label: "Facebook",      color: "bg-blue-600",    icon: "📘", domainHint: "facebook.com" },
  { key: "instagram", label: "Instagram",     color: "bg-pink-500",    icon: "📸", domainHint: "instagram.com" },
  { key: "linkedin",  label: "LinkedIn",      color: "bg-blue-700",    icon: "💼", domainHint: "linkedin.com" },
  { key: "tiktok",    label: "TikTok",        color: "bg-foreground",  icon: "🎵", domainHint: "tiktok.com" },
  { key: "blog",      label: "Blogs / Presse",color: "bg-emerald-600", icon: "📰" },
  { key: "google",    label: "Google (Avis)", color: "bg-yellow-500",  icon: "⭐", domainHint: "google.com" },
] as const;

export const PLATFORM_LABEL: Record<PlatformKey, string> =
  Object.fromEntries(PLATFORMS.map(p => [p.key, p.label])) as Record<PlatformKey, string>;

export const defaultPlatformStates = (): Record<PlatformKey, boolean> =>
  Object.fromEntries(PLATFORMS.map(p => [p.key, true])) as Record<PlatformKey, boolean>;
