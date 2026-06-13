import { Outlet, useNavigate } from "react-router-dom";
import { BottomNav } from "./BottomNav";
import { Bell, Moon, Sun, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeTable } from "@/hooks/useRealtimeTable";
import { MarketingOnboarding } from "@/components/MarketingOnboarding";

export function AppLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="sticky top-0 z-40 h-14 px-4 flex items-center gap-3 border-b border-border/40 glass-header">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center shadow-md shadow-primary/30">
            <Target className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </div>
          <span className="font-bold tracking-tight text-gradient-red hidden sm:inline" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Focus</span>
        </button>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => navigate("/mentions")}><Search className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" className="rounded-xl" onClick={toggleDark}>{dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
          <Button variant="ghost" size="icon" className="relative rounded-xl" onClick={() => navigate("/alerts")}>
            <Bell className="h-4 w-4" />
            {unread > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]">{unread}</Badge>}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Avatar className="h-7 w-7 ring-2 ring-primary/20"><AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card">
              <DropdownMenuItem onClick={() => navigate("/settings")}>Mon profil</DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/support")}>Support</DropdownMenuItem>
              <DropdownMenuItem onClick={async () => { await logout(); navigate("/login"); }}>Se déconnecter</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 p-3 md:p-6 pb-32 overflow-auto">
        <div className="max-w-6xl mx-auto w-full">
          <Outlet />
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
