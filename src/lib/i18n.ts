// Système d'internationalisation minimaliste pour l'UI de Focus.
// Langues supportées côté interface : Français, Anglais, Wolof, Bambara, Lingala.
import { useEffect, useState } from "react";

export const UI_LOCALES = [
  { code: "fr", flag: "🇫🇷", label: "Français" },
  { code: "en", flag: "🇬🇧", label: "English" },
  { code: "wo", flag: "🇸🇳", label: "Wolof" },
  { code: "bm", flag: "🇲🇱", label: "Bambara" },
  { code: "ln", flag: "🇨🇩", label: "Lingala" },
] as const;

export type UILocaleCode = typeof UI_LOCALES[number]["code"];

const KEY = "focus_ui_locale";
const EVENT = "focus:ui-locale";

type Dict = Record<string, string>;

// Dictionnaires : couvrent le chrome global (navigation, bandeaux, entêtes).
const DICTS: Record<UILocaleCode, Dict> = {
  fr: {
    "nav.home": "Accueil",
    "nav.mentions": "Mentions",
    "nav.gpt": "GPT",
    "nav.watch": "Veille",
    "nav.charts": "Graphes",
    "nav.more": "Plus",
    "nav.menu": "Menu Focus",
    "nav.profile": "Profil",
    "nav.alerts": "Alertes",
    "nav.crisis": "Gérer crise",
    "nav.workspaces": "Espaces",
    "nav.influencers": "Influenceurs",
    "nav.social": "Réseaux",
    "nav.competitors": "Concurrence",
    "nav.reports": "Rapports",
    "nav.support": "Support",
    "nav.settings": "Paramètres",
    "nav.pricing": "Tarification",
    "nav.install": "Installer",
    "nav.superadmin": "Super Admin",
    "header.back": "Retour",
    "header.search": "Recherche",
    "header.profile": "Profil",
    "header.myProfile": "Mon profil",
    "header.support": "Support",
    "header.logout": "Se déconnecter",
    "trial.promoTitle": "Accès complet pendant {days} jour{plural} !",
    "trial.promoDesc": "— tous les modules sont déverrouillés (offert par l'équipe Focus).",
    "trial.viewPlans": "Voir les plans",
    "trial.locked": "Période d'accès terminée.",
    "trial.lockedCta": "Activez un plan pour débloquer l'application.",
    "trial.activate": "Activer maintenant",
    "settings.uiLanguage": "Langue de l'interface",
    "settings.uiLanguageDesc": "Change instantanément la langue du menu, des boutons et des messages.",
  },
  en: {
    "nav.home": "Home",
    "nav.mentions": "Mentions",
    "nav.gpt": "GPT",
    "nav.watch": "Watch",
    "nav.charts": "Charts",
    "nav.more": "More",
    "nav.menu": "Focus menu",
    "nav.profile": "Profile",
    "nav.alerts": "Alerts",
    "nav.crisis": "Handle crisis",
    "nav.workspaces": "Workspaces",
    "nav.influencers": "Influencers",
    "nav.social": "Networks",
    "nav.competitors": "Competitors",
    "nav.reports": "Reports",
    "nav.support": "Support",
    "nav.settings": "Settings",
    "nav.pricing": "Pricing",
    "nav.install": "Install",
    "nav.superadmin": "Super Admin",
    "header.back": "Back",
    "header.search": "Search",
    "header.profile": "Profile",
    "header.myProfile": "My profile",
    "header.support": "Support",
    "header.logout": "Sign out",
    "trial.promoTitle": "Full access for {days} day{plural}!",
    "trial.promoDesc": "— every module is unlocked (a gift from the Focus team).",
    "trial.viewPlans": "See plans",
    "trial.locked": "Access period ended.",
    "trial.lockedCta": "Activate a plan to unlock the app.",
    "trial.activate": "Activate now",
    "settings.uiLanguage": "Interface language",
    "settings.uiLanguageDesc": "Instantly switches menus, buttons and messages.",
  },
  wo: {
    "nav.home": "Kër",
    "nav.mentions": "Wax yi",
    "nav.gpt": "GPT",
    "nav.watch": "Sax",
    "nav.charts": "Xayma yi",
    "nav.more": "Yeneen",
    "nav.menu": "Menu Focus",
    "nav.profile": "Sama tur",
    "nav.alerts": "Yëgle yi",
    "nav.crisis": "Saytu jafe-jafe",
    "nav.workspaces": "Barab yi",
    "nav.influencers": "Ñi gën",
    "nav.social": "Réseaux",
    "nav.competitors": "Ñi ñu bokk",
    "nav.reports": "Rapport",
    "nav.support": "Ndimbal",
    "nav.settings": "Tëraliin",
    "nav.pricing": "Njëg",
    "nav.install": "Sampal",
    "nav.superadmin": "Super Admin",
    "header.back": "Delloo",
    "header.search": "Seet",
    "header.profile": "Sama tur",
    "header.myProfile": "Sama profil",
    "header.support": "Ndimbal",
    "header.logout": "Génn",
    "trial.promoTitle": "Ubbi lu mat sëkk {days} fan{plural} !",
    "trial.promoDesc": "— module yépp ubbeeku nañu (mayu equipe Focus).",
    "trial.viewPlans": "Xool plan yi",
    "trial.locked": "Waxtu bi jeex na.",
    "trial.lockedCta": "Tabb benn plan ngir ubbi app bi.",
    "trial.activate": "Ubbeel léegi",
    "settings.uiLanguage": "Làkk bu interface bi",
    "settings.uiLanguageDesc": "Soppi menu, buton ak bataaxal yi ci saa si.",
  },
  bm: {
    "nav.home": "So",
    "nav.mentions": "Kuma",
    "nav.gpt": "GPT",
    "nav.watch": "Kɔlɔsili",
    "nav.charts": "Jaabɔw",
    "nav.more": "Tɔw",
    "nav.menu": "Focus Menu",
    "nav.profile": "N tɔgɔ",
    "nav.alerts": "Kunnafoni",
    "nav.crisis": "Gɛlɛya ladege",
    "nav.workspaces": "Barakɛyɔrɔw",
    "nav.influencers": "Kunkolo mɔgɔw",
    "nav.social": "Rezo",
    "nav.competitors": "Kɛlɛbaɲaw",
    "nav.reports": "Rapɔɔri",
    "nav.support": "Dɛmɛ",
    "nav.settings": "Sigilan",
    "nav.pricing": "Sɔngɔ",
    "nav.install": "Bila",
    "nav.superadmin": "Super Admin",
    "header.back": "Kɔsegin",
    "header.search": "Ɲini",
    "header.profile": "N tɔgɔ",
    "header.myProfile": "N ka profil",
    "header.support": "Dɛmɛ",
    "header.logout": "Bɔ",
    "trial.promoTitle": "Sɔrɔ dafalen tile {days}{plural} kɔnɔ!",
    "trial.promoDesc": "— module bɛɛ bɛ dabɔ (Focus jɛkulu ka nilifɛn).",
    "trial.viewPlans": "Plan lajɛ",
    "trial.locked": "Waati banna.",
    "trial.lockedCta": "Plan dɔ ladege walasa ka app bi da dabɔ.",
    "trial.activate": "Ladege sisan",
    "settings.uiLanguage": "Interface kan",
    "settings.uiLanguageDesc": "A bɛ menu, buton ni cikan yɛlɛma teliya la.",
  },
  ln: {
    "nav.home": "Ndako",
    "nav.mentions": "Maloba",
    "nav.gpt": "GPT",
    "nav.watch": "Kokɛngɛlɛ",
    "nav.charts": "Bilili",
    "nav.more": "Mosusu",
    "nav.menu": "Menu Focus",
    "nav.profile": "Nkómbó na ngai",
    "nav.alerts": "Bilanga",
    "nav.crisis": "Kobongisa mokakatano",
    "nav.workspaces": "Bisika",
    "nav.influencers": "Bato ya nguya",
    "nav.social": "Réseaux",
    "nav.competitors": "Baninga ya momekano",
    "nav.reports": "Ba rapport",
    "nav.support": "Lisungi",
    "nav.settings": "Bosolisi",
    "nav.pricing": "Ntalo",
    "nav.install": "Kotia",
    "nav.superadmin": "Super Admin",
    "header.back": "Kozonga",
    "header.search": "Koluka",
    "header.profile": "Profil",
    "header.myProfile": "Profil na ngai",
    "header.support": "Lisungi",
    "header.logout": "Kobima",
    "trial.promoTitle": "Bopusi ya mobimba mpo na mikolo {days}{plural} !",
    "trial.promoDesc": "— ba module nyonso efungwami (likabo ya équipe Focus).",
    "trial.viewPlans": "Tala ba plan",
    "trial.locked": "Ntango esili.",
    "trial.lockedCta": "Fungola plan mpo na kosalela app.",
    "trial.activate": "Fungola sikoyo",
    "settings.uiLanguage": "Lokota ya interface",
    "settings.uiLanguageDesc": "Ebongoli menu, ba bouton mpe bansango mbala moko.",
  },
};

export function getUILocale(): UILocaleCode {
  try {
    const v = localStorage.getItem(KEY) as UILocaleCode | null;
    if (v && DICTS[v]) return v;
  } catch {}
  return "fr";
}

export function setUILocale(code: UILocaleCode) {
  try { localStorage.setItem(KEY, code); } catch {}
  try { document.documentElement.setAttribute("lang", code); } catch {}
  window.dispatchEvent(new Event(EVENT));
}

function format(str: string, vars?: Record<string, string | number>) {
  if (!vars) return str;
  return str.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? "").toString());
}

export function translate(locale: UILocaleCode, key: string, vars?: Record<string, string | number>) {
  const d = DICTS[locale] || DICTS.fr;
  return format(d[key] ?? DICTS.fr[key] ?? key, vars);
}

export function useT() {
  const [locale, setLocale] = useState<UILocaleCode>(getUILocale());
  useEffect(() => {
    const on = () => setLocale(getUILocale());
    window.addEventListener(EVENT, on);
    try { document.documentElement.setAttribute("lang", getUILocale()); } catch {}
    return () => window.removeEventListener(EVENT, on);
  }, []);
  const t = (key: string, vars?: Record<string, string | number>) => translate(locale, key, vars);
  return { t, locale, setLocale: (c: UILocaleCode) => { setUILocale(c); setLocale(c); } };
}
