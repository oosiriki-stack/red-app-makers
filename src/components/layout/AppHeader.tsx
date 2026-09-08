import { Bell, Search, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export function AppHeader() {
  const [dark, setDark] = useState(() => localStorage.getItem("arobase_dark") === "true");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [initials, setInitials] = useState("U");
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
  }, []);

  // Load profile initials
  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("name").eq("id", user.id).single().then(({ data }) => {
      if (data?.name) {
        const parts = data.name.split(" ").filter(Boolean);
        setInitials(parts.map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) || "U");
      }
    });
  }, [user]);

  // Load unread alerts count
  useEffect(() => {
    if (!user) return;
    supabase.from("alerts").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false).then(({ count }) => {
      setUnreadCount(count ?? 0);
    });
  }, [user]);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("arobase_dark", String(next));
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/mentions?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
      setSearchOpen(false);
    }
  };

  return (
    <header className="h-16 border-b border-white/10 flex items-center gap-3 px-4 md:px-6 glass-header">
      <SidebarTrigger />

      <form onSubmit={handleSearch} className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher des mentions..." className="pl-9 h-9 bg-muted/50 border-0 rounded-xl" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </form>

      <Button variant="ghost" size="icon" aria-label="Ouvrir la recherche" className="sm:hidden" onClick={() => setSearchOpen(!searchOpen)}>
        <Search className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" aria-label="Changer de thème" onClick={toggleDark} className="rounded-xl">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" aria-label="Voir les alertes" className="relative rounded-xl" onClick={() => navigate("/alerts")}>
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] notification-pulse">
              {unreadCount}
            </Badge>
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Mon compte" className="rounded-xl">
              <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-card">
            <DropdownMenuItem onClick={() => navigate("/settings")}>Mon profil</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings")}>Paramètres</DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>Se déconnecter</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {searchOpen && (
        <form onSubmit={handleSearch} className="absolute top-14 left-0 right-0 p-3 glass-header sm:hidden z-50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-9 h-9 bg-muted/50 border-0 rounded-xl" autoFocus value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
        </form>
      )}
    </header>
  );
}
