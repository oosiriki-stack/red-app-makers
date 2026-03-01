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

export function AppHeader() {
  const [dark, setDark] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userName, setUserName] = useState("AD");
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("arobase_user");
    if (stored) {
      try {
        const user = JSON.parse(stored);
        const initials = user.name
          ? user.name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2)
          : "AD";
        setUserName(initials);
      } catch {}
    }
  }, []);

  const toggleDark = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  const handleLogout = () => {
    localStorage.removeItem("arobase_user");
    localStorage.removeItem("arobase_logged_in");
    navigate("/login");
  };

  return (
    <header className="h-14 border-b border-white/10 flex items-center gap-3 px-4 glass-header">
      <SidebarTrigger />

      {/* Desktop search */}
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher des mentions..." className="pl-9 h-9 bg-muted/50 border-0 rounded-xl" />
        </div>
      </div>

      {/* Mobile search toggle */}
      <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setSearchOpen(!searchOpen)}>
        <Search className="h-4 w-4" />
      </Button>

      <div className="flex items-center gap-2 ml-auto">
        <Button variant="ghost" size="icon" onClick={toggleDark} className="rounded-xl">
          {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="icon" className="relative rounded-xl" onClick={() => navigate("/alerts")}>
          <Bell className="h-4 w-4" />
          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] notification-pulse">
            5
          </Badge>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Avatar className="h-7 w-7 ring-2 ring-primary/20">
                <AvatarFallback className="bg-primary text-primary-foreground text-xs">{userName}</AvatarFallback>
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

      {/* Mobile search bar */}
      {searchOpen && (
        <div className="absolute top-14 left-0 right-0 p-3 glass-header sm:hidden z-50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Rechercher..." className="pl-9 h-9 bg-muted/50 border-0 rounded-xl" autoFocus />
          </div>
        </div>
      )}
    </header>
  );
}
