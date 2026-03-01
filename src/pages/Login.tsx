import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    localStorage.setItem("arobase_user", JSON.stringify({ email, name: email.split("@")[0] }));
    localStorage.setItem("arobase_logged_in", "true");
    toast.success("Connexion réussie !");
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden auth-gradient-bg">
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Card className="w-full max-w-md glass-card border-white/30 relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center glow-red-subtle">
              <AtSign className="w-7 h-7 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-light text-white">
            @robase
          </CardTitle>
          <p className="text-sm text-white/70 mt-1">Connectez-vous à votre espace</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-white/80">Email</Label>
              <Input
                type="email"
                placeholder="admin@arobase.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm"
              />
            </div>
            <div>
              <Label className="text-white/80">Mot de passe</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/40 backdrop-blur-sm"
              />
            </div>
            <Button type="submit" className="w-full bg-white text-primary hover:bg-white/90 font-semibold text-base h-11">
              Se connecter
            </Button>
            <p className="text-sm text-center text-white/70">
              Pas de compte ?{" "}
              <Link to="/register" className="text-white hover:underline font-medium">S'inscrire</Link>
            </p>
            <p className="text-xs text-center text-white/50">
              <Link to="/mfa" className="hover:underline">Authentification multifacteur</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
