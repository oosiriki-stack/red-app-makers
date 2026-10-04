import { LayoutDashboard, MessageSquare, Bell, Bot, BarChart3, MoreHorizontal, FileText, Settings as SettingsIcon, CreditCard, Download, LifeBuoy, ShieldCheck, Target, Radar, AlertTriangle, Users, Share2, TrendingUp, PieChart, User } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { Button } from "@/components/ui/button";

const primaryDef = [
  { to: "/dashboard", icon: LayoutDashboard, key: "nav.home" },
  { to: "/mentions", icon: MessageSquare, key: "nav.mentions" },
  { to: "/ai-assistant", icon: Bot, key: "nav.gpt", center: true },
  { to: "/surveillance", icon: Radar, key: "nav.watch" },
  { to: "/quick-chart", icon: PieChart, key: "nav.charts" },
];

const moreDef = [
  { to: "/settings?tab=profile", icon: User, key: "nav.profile" },
  { to: "/alerts", icon: Bell, key: "nav.alerts" },
  { to: "/crisis", icon: AlertTriangle, key: "nav.crisis" },
  { to: "/workspaces", icon: Users, key: "nav.workspaces" },
  { to: "/influencers", icon: TrendingUp, key: "nav.influencers" },
  { to: "/social-networks", icon: Share2, key: "nav.social" },
  { to: "/competitors", icon: BarChart3, key: "nav.competitors" },
  { to: "/reports", icon: FileText, key: "nav.reports" },
  { to: "/support", icon: LifeBuoy, key: "nav.support" },
  { to: "/settings", icon: SettingsIcon, key: "nav.settings" },
  { to: "/pricing", icon: CreditCard, key: "nav.pricing" },
  { to: "/install", icon: Download, key: "nav.install" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { isSuperAdmin } = useUserRole();
  const { t } = useT();

  const primary = primaryDef.map((i) => ({ ...i, label: t(i.key) }));
  const moreItems = moreDef.map((i) => ({ ...i, label: t(i.key) }));
  const fullMore = isSuperAdmin
    ? [{ to: "/super-admin", icon: ShieldCheck, label: t("nav.superadmin") }, ...moreItems]
    : moreItems;

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:left-1/2 md:bottom-4 md:max-w-2xl md:-translate-x-1/2 md:rounded-2xl md:border md:shadow-lg">
      <div className="mx-auto w-full px-1.5">
        <div className="relative">
          <div className="flex min-h-16 items-center justify-around gap-0.5">
            {primary.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              if (item.center) {
                return (
                  <NavLink key={item.to} to={item.to} className="relative flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-1.5">
                    <div className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                      active ? "bg-primary text-primary-foreground shadow-sm" : "bg-primary/10 text-primary"
                    )}>
                      <Icon className="h-5 w-5" strokeWidth={2.5} />
                    </div>
                    <span className="max-w-full truncate text-[10px] font-semibold leading-none text-primary">{item.label}</span>
                  </NavLink>
                );
              }
              return (
                <NavLink key={item.to} to={item.to} className={cn("flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl py-2 transition-colors", active && "bg-accent")}>
                  <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} strokeWidth={active ? 2.5 : 2} />
                  <span className={cn("max-w-full truncate text-[10px] font-medium leading-none", active ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                </NavLink>
              );
            })}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" className="h-auto min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2" aria-label={t("nav.more")}>
                  <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                  <span className="max-w-full truncate text-[10px] font-medium leading-none text-muted-foreground">{t("nav.more")}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[82dvh] overflow-y-auto rounded-t-2xl border-t border-border/70 bg-card">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> {t("nav.menu")}
                  </SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-2 py-4 sm:grid-cols-4">
                  {fullMore.map((m) => {
                    const Icon = m.icon;
                    const active = isActive(m.to);
                    return (
                      <NavLink
                        key={m.to}
                        to={m.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex min-h-24 flex-col items-center justify-center gap-2 rounded-xl border p-3 transition-colors",
                          active ? "bg-primary/10 border-primary/40 text-primary" : "border-border/50 hover:bg-muted/50"
                        )}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium text-center">{m.label}</span>
                      </NavLink>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}

