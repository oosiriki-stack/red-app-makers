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
  AtSign,
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
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Mentions", url: "/mentions", icon: MessageSquare },
  { title: "Alertes", url: "/alerts", icon: Bell },
  { title: "Concurrence", url: "/competitors", icon: BarChart3 },
  { title: "Assistant IA", url: "/ai-assistant", icon: Bot },
  { title: "Rapports", url: "/reports", icon: FileText },
];

const secondaryNav = [
  { title: "Paramètres", url: "/settings", icon: Settings },
  { title: "Tarification", url: "/pricing", icon: CreditCard },
  { title: "Installer", url: "/install", icon: Download },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="glass-sidebar border-r border-white/10">
      <SidebarHeader className="p-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center glow-gold-subtle">
            <AtSign className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              <span className="text-gradient-red">@robase</span>
            </span>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/60 px-5">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/"} activeClassName="bg-primary/10 text-primary font-medium border-l-[3px] border-primary">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-muted-foreground/60 px-5">Autres</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} activeClassName="bg-primary/10 text-primary font-medium border-l-[3px] border-primary">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-5">
        {!collapsed && (
          <div className="text-center space-y-1">
            {(() => {
              try {
                const raw = localStorage.getItem("arobase_tracking");
                if (raw) {
                  const t = JSON.parse(raw);
                  const count = Object.values(t.platforms || {}).filter(Boolean).length;
                  if (t.brand && count > 0) {
                    return (
                      <p className="text-xs text-green-500 flex items-center justify-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        Tracking actif · {count} source{count > 1 ? "s" : ""}
                      </p>
                    );
                  }
                }
              } catch {}
              return null;
            })()}
            <p className="text-xs text-muted-foreground/50">
              @robase v1.0 — Veille IA
            </p>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
