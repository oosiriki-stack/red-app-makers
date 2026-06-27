import { LayoutDashboard, MessageSquare, Bell, Bot, BarChart3, MoreHorizontal, FileText, Settings as SettingsIcon, CreditCard, Download, LifeBuoy, ShieldCheck, Target, Radar, AlertTriangle, Users, Share2, TrendingUp, PieChart } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";

const primary = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Accueil" },
  { to: "/mentions", icon: MessageSquare, label: "Mentions" },
  { to: "/ai-assistant", icon: Bot, label: "GPT", center: true },
  { to: "/surveillance", icon: Radar, label: "Veille" },
  { to: "/quick-chart", icon: PieChart, label: "Graphes" },
];

const moreItems = [
  { to: "/alerts", icon: Bell, label: "Alertes" },
  { to: "/crisis", icon: AlertTriangle, label: "Gérer crise" },
  { to: "/workspaces", icon: Users, label: "Espaces" },
  { to: "/influencers", icon: TrendingUp, label: "Influenceurs" },
  { to: "/social-networks", icon: Share2, label: "Réseaux" },
  { to: "/competitors", icon: BarChart3, label: "Concurrence" },
  { to: "/reports", icon: FileText, label: "Rapports" },
  { to: "/support", icon: LifeBuoy, label: "Support" },
  { to: "/settings", icon: SettingsIcon, label: "Paramètres" },
  { to: "/pricing", icon: CreditCard, label: "Tarification" },
  { to: "/install", icon: Download, label: "Installer" },
];

export function BottomNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { isSuperAdmin } = useUserRole();

  const fullMore = isSuperAdmin
    ? [{ to: "/super-admin", icon: ShieldCheck, label: "Super Admin" }, ...moreItems]
    : moreItems;

  const isActive = (to: string) => pathname === to || pathname.startsWith(to + "/");

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-2 pb-2">
        <div className="relative glass-card rounded-2xl border border-border/60 shadow-xl shadow-primary/10 backdrop-blur-2xl">
          <div className="flex items-end justify-around px-1 py-1">
            {primary.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              if (item.center) {
                return (
                  <NavLink key={item.to} to={item.to} className="relative -mt-5 flex flex-col items-center gap-0.5">
                    <div className={cn(
                      "w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/40 ring-2 ring-background transition-transform",
                      active && "scale-110"
                    )}>
                      <Icon className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
                    </div>
                    <span className="text-[9px] font-semibold text-primary leading-tight">{item.label}</span>
                  </NavLink>
                );
              }
              return (
                <NavLink key={item.to} to={item.to} className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg">
                  <Icon className={cn("w-4 h-4", active ? "text-primary" : "text-muted-foreground")} strokeWidth={active ? 2.5 : 2} />
                  <span className={cn("text-[9px] font-medium leading-tight", active ? "text-primary" : "text-muted-foreground")}>{item.label}</span>
                </NavLink>
              );
            })}

            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <button className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg">
                  <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[9px] font-medium text-muted-foreground leading-tight">Plus</span>
                </button>
              </SheetTrigger>
              <SheetContent side="bottom" className="glass-card rounded-t-3xl border-t border-border/60">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" /> Menu Focus
                  </SheetTitle>
                </SheetHeader>
                <div className="grid grid-cols-3 gap-3 py-4">
                  {fullMore.map((m) => {
                    const Icon = m.icon;
                    const active = isActive(m.to);
                    return (
                      <NavLink
                        key={m.to}
                        to={m.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all",
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
