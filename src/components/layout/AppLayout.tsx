import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Bell, Moon, Sun, Search, Target, ArrowLeft, User, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { MarketingOnboarding } from "@/components/MarketingOnboarding";
import { useNotifications } from "@/hooks/useNotifications";
import { TrialBanner } from "@/components/TrialBanner";
import { TrialLockGuard } from "@/components/TrialLockGuard";
import { useT } from "@/lib/i18n";
import { OfflineBanner } from "@/components/OfflineBanner";

export function AppLayout() {
  useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t } = useT();
  const [dark, setDark] = useState(() => localStorage.getItem("arobase_dark") === "true");
  const [initials, setInitials] = useState("U");
  const [unread, setUnread] = useState(0);

  const refreshUnread = () => {
    if (!user) return;
    supabase.from("alerts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false).then(({ count }) => setUnread(count ?? 0));
  };

  useEffect(() => { if (dark) document.documentElement.classList.add("dark"); }, []);
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name").eq("id", user.id).single().then(({ data }) => {
      if (data?.name) setInitials(data.name.split(" ").filter(Boolean).map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "U");
    });
    refreshUnread();
  }, [user]);

  // Top-up automatique : flot léger toutes les 10 min pour préserver la fluidité.
  useEffect(() => {
    if (!user) return;
    const tick = async () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") return;
      // Respecter le mode "Pause" de la surveillance
      const { data: ms } = await supabase.from("monitoring_settings").select("paused").eq("user_id", user.id).maybeSingle();
      if ((ms as any)?.paused) return;
      let competitors: string[] = [];
      let languages: string[] = ["fr"];
      let lang_settings: any = undefined;
      try { competitors = JSON.parse(localStorage.getItem("focus_competitors_v1") || "[]") || []; } catch {}
      try { languages = JSON.parse(localStorage.getItem("focus_locale_langs_v1") || "[\"fr\"]") || ["fr"]; } catch {}
      try { lang_settings = JSON.parse(localStorage.getItem("focus_locale_settings_v1") || "null"); } catch {}
      supabase.functions.invoke("seed-fake-mentions", { body: { user_id: user.id, mode: "topup", competitors, languages, lang_settings } }).catch(() => {});

    };
    const id = setInterval(tick, 600_000);
    const first = setTimeout(tick, 60_000);
    return () => { clearInterval(id); clearTimeout(first); };
  }, [user]);

  useRealtimeTable("alerts", user?.id, {
    onInsert: () => refreshUnread(),
    onUpdate: () => refreshUnread(),
    onDelete: () => refreshUnread(),
  });

  const toggleDark = () => {
    const next = !dark; setDark(next);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("arobase_dark", String(next));
  };

  const showBack = !["/", "/dashboard"].includes(location.pathname);

  return (
    <div className="app-surface flex min-h-screen flex-col">
      <header className="glass-header sticky top-0 z-40 min-h-16 border-b px-3 pt-[env(safe-area-inset-top)] sm:px-5">
        <div className="app-shell flex h-16 items-center gap-2 sm:gap-3">
        {showBack && (
          <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0 rounded-xl" onClick={() => navigate(-1)} aria-label={t("header.back")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Button variant="ghost" onClick={() => navigate("/dashboard")} className="h-11 min-w-0 gap-2 rounded-xl px-1.5 sm:px-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary shadow-sm">
            <Target className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="hidden truncate font-bold text-gradient-red sm:inline">Focus</span>
        </Button>
        <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
          <Button variant="outline" size="sm" className="hidden h-10 gap-2 rounded-xl px-3 md:flex" onClick={() => navigate("/")} aria-label="Voir la page d'accueil">
            <Home className="h-4 w-4" />
            <span>Accueil</span>
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl" onClick={() => navigate("/mentions")} aria-label={t("header.search")}><Search className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="hidden h-10 w-10 rounded-xl sm:inline-flex" onClick={() => navigate("/settings?tab=profile")} aria-label={t("header.profile")}><User className="h-5 w-5" /></Button>
          <Button variant="ghost" size="icon" className="hidden h-10 w-10 rounded-xl sm:inline-flex" aria-label={dark ? "Passer en mode clair" : "Passer en mode sombre"} onClick={toggleDark}>{dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}</Button>

          <Button variant="ghost" size="icon" aria-label="Voir les alertes" className="relative h-10 w-10 rounded-xl" onClick={() => navigate("/alerts")}>
            <Bell className="h-5 w-5" />
            {unread > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">{unread}</Badge>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Mon compte" className="h-10 w-10 rounded-xl">
                <Avatar className="h-8 w-8 ring-2 ring-primary/20"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={() => navigate("/settings")}>{t("header.myProfile")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/support")}>{t("header.support")}</DropdownMenuItem>
              <DropdownMenuItem onClick={async () => { await logout(); navigate("/login"); }}>{t("header.logout")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

        </div>
        </div>
      </header>

      <OfflineBanner />
      <TrialBanner />

      <main className="flex-1 overflow-x-hidden px-3 pb-28 pt-4 sm:px-5 md:pb-24 md:pt-6 lg:px-8">
        <div className="app-shell">
          <TrialLockGuard>
            <Outlet />
          </TrialLockGuard>
        </div>
      </main>

      <BottomNav />
      <MarketingOnboarding />
    </div>
  );
}
