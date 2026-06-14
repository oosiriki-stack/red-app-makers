import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, UserPlus, Send } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

export function InviteCollaboratorDialog({ trigger }: { trigger?: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [emails, setEmails] = useState("");
  const [message, setMessage] = useState(
    "Bonjour,\n\nJe t'invite à collaborer sur mon espace e-réputation @robase. Tu pourras consulter les mentions, alertes et rapports.\n\nÀ bientôt."
  );

  const send = () => {
    const list = emails.split(/[,;\s\n]+/).map((e) => e.trim()).filter(Boolean);
    if (list.length === 0) return toast.error("Ajoute au moins un email");
    const invalid = list.filter((e) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
    if (invalid.length) return toast.error(`Email invalide : ${invalid[0]}`);

    const subject = encodeURIComponent("Invitation à collaborer sur @robase");
    const body = encodeURIComponent(
      `${message}\n\n— Connectez-vous : ${window.location.origin}/register\n\nInvitation envoyée par ${user?.email || ""}`
    );
    window.location.href = `mailto:${list.join(",")}?subject=${subject}&body=${body}`;
    toast.success(`Invitation préparée pour ${list.length} personne${list.length > 1 ? "s" : ""}`);
    setOpen(false);
    setEmails("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="rounded-xl gap-1.5 font-semibold">
            <UserPlus className="h-4 w-4" />Inviter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass-card rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <Mail className="h-5 w-5 text-primary" />Inviter des collaborateurs
          </DialogTitle>
          <DialogDescription className="font-medium">
            Envoyez une invitation par email à votre équipe ou à un client.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <Label className="font-semibold">Emails (séparés par virgules)</Label>
            <Input
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="alice@equipe.com, bob@equipe.com"
              className="rounded-xl mt-1"
            />
          </div>
          <div>
            <Label className="font-semibold">Message personnalisé</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="rounded-xl mt-1 resize-none"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={send} className="rounded-xl gap-1.5 font-semibold">
            <Send className="h-4 w-4" />Envoyer l'invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
