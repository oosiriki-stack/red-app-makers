import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AtSign } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotOpen, setForgotOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    localStorage.setItem("arobase_user", JSON.stringify({ email, name: email.split("@")[0], registeredAt: localStorage.getItem("arobase_user") ? JSON.parse(localStorage.getItem("arobase_user")!).registeredAt : new Date().toISOString() }));
    localStorage.setItem("arobase_logged_in", "true");
    toast.success("Connexion réussie !");
    navigate("/");
  };

  const handleResetPassword = () => {
    if (!resetEmail) { toast.error("Veuillez entrer votre email"); return; }
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
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center glow-red-subtle">
              <AtSign className="w-7 h-7 text-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-light text-foreground">
            @robase
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Connectez-vous à votre espace</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label className="text-foreground">Email</Label>
              <Input
                type="email"
                placeholder="admin@arobase.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground backdrop-blur-sm"
              />
            </div>
            <div>
              <Label className="text-foreground">Mot de passe</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground backdrop-blur-sm"
              />
            </div>
            <Button type="submit" className="w-full font-semibold text-base h-11">
              Se connecter
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Pas de compte ?{" "}
              <Link to="/register" className="text-primary hover:underline font-medium">S'inscrire</Link>
            </p>
            <div className="flex justify-center gap-3 text-xs text-muted-foreground">
              <button type="button" onClick={() => setForgotOpen(true)} className="hover:underline hover:text-foreground transition-colors">
                Mot de passe oublié ?
              </button>
              <span>·</span>
              <Link to="/mfa" className="hover:underline hover:text-foreground transition-colors">MFA</Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="glass-card rounded-2xl">
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">Entrez votre adresse email pour recevoir un lien de réinitialisation.</p>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="votre@email.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                className="rounded-xl mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" className="rounded-xl" onClick={() => setForgotOpen(false)}>Annuler</Button>
            <Button className="rounded-xl" onClick={handleResetPassword}>Envoyer le lien</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
