import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AtSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PasswordInput } from "@/components/PasswordInput";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : error.message);
      return;
    }
    toast.success("Connexion réussie !");
    navigate("/dashboard");
  };

  const handleResetPassword = async () => {
    if (!resetEmail) { toast.error("Veuillez entrer votre email"); return; }
    setResetLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResetLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success(`Lien de réinitialisation envoyé à ${resetEmail}`);
    setForgotOpen(false);
    setResetEmail("");
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
              <AtSign className="w-7 h-7 text-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-light text-foreground">Focus</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Connectez-vous à votre espace</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-foreground">Email</Label>
              <Input type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground backdrop-blur-sm" />
            </div>
            <div>
              <Label className="text-foreground">Mot de passe</Label>
              <PasswordInput placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground backdrop-blur-sm" />
            </div>
            <Button type="submit" className="w-full font-semibold text-base h-11" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Se connecter
            </Button>

            <SocialLoginButtons />



            <p className="text-sm text-center text-muted-foreground">
              Pas de compte ?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">S'inscrire</Link>
            </p>
            <div className="flex justify-center text-xs text-muted-foreground">
              <button type="button" onClick={() => setForgotOpen(true)} className="hover:underline hover:text-foreground transition-colors">
                Mot de passe oublié ?
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="glass-card rounded-2xl">
          <DialogHeader><DialogTitle>Réinitialiser le mot de passe</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
            <div>
              <Label>Email</Label>
              <Input type="email" placeholder="votre@email.com" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="rounded-xl mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setForgotOpen(false)}>Annuler</Button>
            <Button className="rounded-xl" onClick={handleResetPassword} disabled={resetLoading}>
              {resetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Envoyer le lien
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
