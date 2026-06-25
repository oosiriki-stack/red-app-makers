import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PasswordInput } from "@/components/PasswordInput";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !password) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }
    setLoading(true);
    const fullName = `${firstName} ${lastName}`.trim();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name: fullName },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Compte créé avec succès !");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden auth-gradient-bg">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Card className="w-full max-w-md glass-card border-border/30 relative z-10">
        <CardHeader className="text-center pb-2">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center glow-gold-subtle">
              <AtSign className="w-7 h-7 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-light text-foreground">Focus</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Créez votre compte</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-foreground/80">Prénom *</Label>
                <Input placeholder="Jean" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <div>
                <Label className="text-foreground/80">Nom</Label>
                <Input placeholder="Dupont" value={lastName} onChange={(e) => setLastName(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label className="text-foreground/80">Email *</Label>
              <Input type="email" placeholder="jean@entreprise.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground" />
            </div>
            <div>
              <Label className="text-foreground/80">Mot de passe *</Label>
              <PasswordInput placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 caractères</p>
            </div>
            <Button type="submit" className="w-full font-semibold text-base h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Créer mon compte
            </Button>

            <SocialLoginButtons />



            <p className="text-sm text-center text-muted-foreground">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-foreground hover:underline font-medium">Se connecter</Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
