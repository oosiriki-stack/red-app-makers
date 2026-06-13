import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AtSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";

export default function Register() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground" />
              <p className="text-xs text-muted-foreground mt-1">Minimum 6 caractères</p>
            </div>
            <Button type="submit" className="w-full font-semibold text-base h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Créer mon compte
            </Button>
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
              <div className="relative flex justify-center text-xs"><span className="bg-background/60 px-2 text-muted-foreground">ou s'inscrire avec</span></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" className="rounded-xl" onClick={async () => {
                const r = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
                if (r.error) toast.error("Google: " + (r.error as any).message);
              }}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </Button>
              <Button type="button" variant="outline" className="rounded-xl" onClick={async () => {
                const r = await lovable.auth.signInWithOAuth("apple", { redirect_uri: window.location.origin + "/dashboard" });
                if (r.error) toast.error("Apple: " + (r.error as any).message);
              }}>
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
                Apple
              </Button>
            </div>
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
