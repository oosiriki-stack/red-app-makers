import { useEffect, useState } from "react";

export const LOCALES = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "wo", label: "Wolof" },
  { code: "bm", label: "Bambara" },
  { code: "dyu", label: "Dioula" },
  { code: "ln", label: "Lingala" },
  { code: "sw", label: "Swahili" },
  { code: "ha", label: "Haoussa" },
  { code: "yo", label: "Yoruba" },
  { code: "ff", label: "Pulaar / Fulfulde" },
  { code: "mos", label: "Mooré" },
  { code: "fon", label: "Fon" },
] as const;

export type LocaleCode = typeof LOCALES[number]["code"];

const KEY = "arobase_locale";

export function getLocale(): LocaleCode {
  try { return (localStorage.getItem(KEY) as LocaleCode) || "fr"; } catch { return "fr"; }
}

export function setLocale(code: LocaleCode) {
  try { localStorage.setItem(KEY, code); } catch {}
  window.dispatchEvent(new Event("arobase:locale"));
}

export function useLocale(): [LocaleCode, (c: LocaleCode) => void] {
  const [locale, setLoc] = useState<LocaleCode>(getLocale());
  useEffect(() => {
    const on = () => setLoc(getLocale());
    window.addEventListener("arobase:locale", on);
    return () => window.removeEventListener("arobase:locale", on);
  }, []);
  return [locale, (c) => { setLocale(c); setLoc(c); }];
}
