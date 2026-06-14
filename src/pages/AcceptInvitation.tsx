import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, X, Users, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function AcceptInvitation() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [invitation, setInvitation] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>(null);
  const [error, setError] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) return;
      const { data: inv } = await supabase.from("workspace_invitations").select("*").eq("token", token).maybeSingle();
      if (!inv) { setError("Invitation introuvable ou révoquée."); setLoading(false); return; }
      if (inv.status !== "pending") { setError("Invitation déjà " + (inv.status === "accepted" ? "acceptée" : "expirée/révoquée") + "."); setLoading(false); return; }
      if (new Date(inv.expires_at) < new Date()) { setError("Cette invitation a expiré."); setLoading(false); return; }
      setInvitation(inv);
      const { data: ws } = await supabase.from("workspaces").select("id,name,description").eq("id", inv.workspace_id).maybeSingle();
      setWorkspace(ws);
      setLoading(false);
    })();
  }, [token]);

  const accept = async () => {
    if (!user || !invitation) return;
    setProcessing(true);
    const { error: memberError } = await supabase.from("workspace_members").insert({
      workspace_id: invitation.workspace_id, user_id: user.id, role: invitation.role,
    } as any);
    if (memberError && !memberError.message.includes("duplicate")) {
      setProcessing(false);
      return toast.error(memberError.message);
    }
    await supabase.from("workspace_invitations").update({ status: "accepted", accepted_at: new Date().toISOString() } as any).eq("id", invitation.id);
    toast.success(`Vous avez rejoint ${workspace?.name}`);
    navigate("/workspaces");
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="min-h-screen flex items-center justify-center p-4">
      <Card className="glass-card p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <X className="w-12 h-12 text-destructive mx-auto mb-3" />
            <h1 className="text-xl font-bold mb-2">Invitation indisponible</h1>
            <p className="text-sm text-muted-foreground mb-5">{error}</p>
            <Button onClick={() => navigate("/dashboard")} variant="outline">Retour</Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold mb-1">{workspace?.name}</h1>
            <p className="text-sm text-muted-foreground mb-1">vous invite à rejoindre l'espace de travail</p>
            <p className="text-xs text-muted-foreground/70 mb-5">en tant que <span className="font-semibold text-primary">{invitation?.role}</span></p>
            {!user ? (
              <>
                <p className="text-sm mb-4">Connectez-vous pour accepter.</p>
                <Button onClick={() => navigate(`/login?redirect=/invite/${token}`)} className="w-full">Se connecter</Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button onClick={() => navigate("/dashboard")} variant="outline" className="flex-1">Plus tard</Button>
                <Button onClick={accept} disabled={processing} className="flex-1 gap-2"><Check className="w-4 h-4" /> Accepter</Button>
              </div>
            )}
          </>
        )}
      </Card>
    </motion.div>
  );
}
