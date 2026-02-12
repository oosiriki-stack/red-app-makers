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
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
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
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} end={item.url === "/"} activeClassName="bg-accent text-accent-foreground font-medium border-l-[3px] border-primary">
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
          <SidebarGroupLabel>Autres</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink to={item.url} activeClassName="bg-accent text-accent-foreground font-medium border-l-[3px] border-primary">
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

      <SidebarFooter className="p-4">
        {!collapsed && (
          <p className="text-xs text-muted-foreground text-center">
            @robase v1.0 — Veille IA
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
