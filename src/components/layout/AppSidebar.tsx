import {
  LayoutDashboard,
  MessageSquare,
  Bell,
  BarChart3,
  Bot,
  FileText,
  Settings,
  Download,
  CreditCard,
  Target,
  Sparkles,
  Users,
  Share2,
  TrendingUp,
  PieChart,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

const mainNav = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mentions", url: "/mentions", icon: MessageSquare },
  { title: "Alertes", url: "/alerts", icon: Bell },
  { title: "Influenceurs", url: "/influencers", icon: TrendingUp },
  { title: "Concurrence", url: "/competitors", icon: BarChart3 },
  { title: "Graphiques", url: "/quick-chart", icon: PieChart },
  { title: "FOCUS GPT", url: "/ai-assistant", icon: Bot },
  { title: "Rapports", url: "/reports", icon: FileText },
];

const secondaryNav = [
  { title: "Espaces de travail", url: "/workspaces", icon: Users },
  { title: "Réseaux sociaux", url: "/social-networks", icon: Share2 },
  { title: "Paramètres", url: "/settings", icon: Settings },
  { title: "Tarification", url: "/pricing", icon: CreditCard },
  { title: "Installer", url: "/install", icon: Download },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const renderItem = (item: typeof mainNav[number]) => (
    <SidebarMenuItem key={item.title}>
      <SidebarMenuButton asChild tooltip={item.title} className="!p-0 !h-auto hover:!bg-transparent data-[active=true]:!bg-transparent">
        <NavLink
          to={item.url}
          end={item.url === "/dashboard"}
          className="nav-item"
          activeClassName="nav-item-active"
        >
          <span className="nav-icon">
            <item.icon className="h-[18px] w-[18px]" strokeWidth={2} />
          </span>
          {!collapsed && <span className="truncate">{item.title}</span>}
        </NavLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon" className="glass-sidebar border-r border-border/40">
      <SidebarHeader className="p-5">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-primary to-orange-600 flex items-center justify-center shadow-lg shadow-primary/30">
            <Target className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-emerald-500 border-2 border-background animate-pulse" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="text-lg font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                <span className="text-gradient-red">Focus</span>
              </span>
              <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground/70">Social Listening</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1">
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-1">
              Navigation
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{mainNav.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          {!collapsed && (
            <SidebarGroupLabel className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50 px-4 mb-1">
              Espace & Compte
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>{secondaryNav.map(renderItem)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        {!collapsed ? (
          <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-primary/[0.06] to-transparent p-3 space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold leading-tight">Focus v2.0</p>
                <p className="text-[10px] text-muted-foreground leading-tight">IA · Afrique francophone</p>
              </div>
            </div>
            {(() => {
              try {
                const raw = localStorage.getItem("arobase_tracking");
                if (raw) {
                  const t = JSON.parse(raw);
                  const count = Object.values(t.platforms || {}).filter(Boolean).length;
                  if (t.brand && count > 0) {
                    return (
                      <div className="flex items-center gap-1.5 text-[10px] text-emerald-500 pt-1.5 border-t border-border/50">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Tracking actif · {count} source{count > 1 ? "s" : ""}
                      </div>
                    );
                  }
                }
              } catch {}
              return null;
            })()}
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
