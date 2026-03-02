import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@/components/ui/input-otp";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function MFA() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleVerify = () => {
    if (code === "123456") {
      localStorage.setItem("arobase_mfa_verified", "true");
      toast.success("Vérification réussie !");
      navigate("/");
    } else {
      toast.error("Code invalide. Essayez 123456.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden auth-gradient-bg">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <Card className="w-full max-w-md glass-card border-white/30 relative z-10">
        <CardHeader className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <CardTitle className="text-xl text-white">Vérification en deux étapes</CardTitle>
          <p className="text-sm text-white/70">Entrez le code envoyé sur votre appareil</p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <InputOTP maxLength={6} value={code} onChange={setCode}>
              <InputOTPGroup>
                <InputOTPSlot index={0} className="bg-white/10 border-white/20 text-white" />
                <InputOTPSlot index={1} className="bg-white/10 border-white/20 text-white" />
                <InputOTPSlot index={2} className="bg-white/10 border-white/20 text-white" />
              </InputOTPGroup>
              <InputOTPSeparator className="text-white/40" />
              <InputOTPGroup>
                <InputOTPSlot index={3} className="bg-white/10 border-white/20 text-white" />
                <InputOTPSlot index={4} className="bg-white/10 border-white/20 text-white" />
                <InputOTPSlot index={5} className="bg-white/10 border-white/20 text-white" />
              </InputOTPGroup>
            </InputOTP>
          </div>
          <Button onClick={handleVerify} className="w-full bg-white text-primary hover:bg-white/90 font-semibold h-11">Vérifier</Button>
          <p className="text-sm text-center text-white/70">
            <Link to="/login" className="text-white hover:underline">Retour à la connexion</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
