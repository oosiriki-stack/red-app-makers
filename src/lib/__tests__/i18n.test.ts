import { describe, it, expect, beforeEach } from "vitest";
import { translate, setUILocale, getUILocale } from "@/lib/i18n";

describe("i18n", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns French by default", () => {
    expect(getUILocale()).toBe("fr");
    expect(translate("fr", "nav.home")).toBe("Accueil");
  });

  it("switches to English", () => {
    setUILocale("en");
    expect(getUILocale()).toBe("en");
    expect(translate("en", "nav.home")).toBe("Home");
    expect(translate("en", "channels.title")).toBe("Multi-platform channels");
  });

  it("falls back to French when a key is missing in a locale", () => {
    // wolof dict does not define channels.title -> falls back to FR
    expect(translate("wo", "channels.title")).toBe(translate("fr", "channels.title"));
  });

  it("interpolates variables", () => {
    expect(translate("fr", "trial.promoTitle", { days: 3, plural: "s" }))
      .toContain("3 jours");
  });

  it("all core nav keys defined in EN + FR", () => {
    const keys = ["nav.home", "nav.mentions", "nav.watch", "nav.settings", "nav.superadmin"];
    for (const k of keys) {
      expect(translate("fr", k)).not.toEqual(k);
      expect(translate("en", k)).not.toEqual(k);
    }
  });
});
