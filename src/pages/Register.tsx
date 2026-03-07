import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AtSign } from "lucide-react";
import { toast } from "sonner";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !password) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    localStorage.setItem("arobase_user", JSON.stringify({ email, name: `${firstName} ${lastName}` }));
    localStorage.setItem("arobase_logged_in", "true");
    toast.success("Compte créé avec succès !");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden auth-gradient-bg">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Card className="w-full max-w-md glass-card border-white/30 relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center glow-gold-subtle">
              <AtSign className="w-7 h-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-light text-foreground">
            @robase
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Créez votre compte</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-foreground/80">Prénom</Label>
                <Input placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <div>
                <Label className="text-foreground/80">Nom</Label>
                <Input placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label className="text-foreground/80">Email</Label>
              <Input type="email" placeholder="jean@entreprise.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div>
              <Label className="text-foreground/80">Mot de passe</Label>
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div>
              <Label className="text-foreground/80">Rôle</Label>
              <Select defaultValue="analyst">
                <SelectTrigger className="bg-background/50 border-border text-foreground"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="analyst">Analyste</SelectItem>
                  <SelectItem value="client">Client</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-base h-11">
              Créer mon compte
            </Button>
            <p className="text-sm text-center text-white/70">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-white hover:underline font-medium">Se connecter</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
