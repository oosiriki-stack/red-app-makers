import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { lovable } from "@/integrations/lovable/index";
import { useState } from "react";
import { Loader2 } from "lucide-react";

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.5-11.3-8.3l-6.5 5C9.6 39.6 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C42 35.8 44 30.3 44 24c0-1.3-.1-2.3-.4-3.5z"/>
  </svg>
);

const AppleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.08zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#1877F2" aria-hidden="true">
    <path d="M24 12a12 12 0 1 0-13.88 11.85v-8.38H7.08V12h3.04V9.36c0-3 1.79-4.67 4.53-4.67 1.31 0 2.69.24 2.69.24v2.95h-1.51c-1.49 0-1.96.93-1.96 1.87V12h3.33l-.53 3.47h-2.8v8.38A12 12 0 0 0 24 12z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0A66C2" aria-hidden="true">
    <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
  </svg>
);

export function SocialLoginButtons() {
  const [loading, setLoading] = useState<string | null>(null);

  const signIn = async (provider: "google" | "apple") => {
    setLoading(provider);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast.error(`Connexion ${provider} : ${result.error.message || "échec"}`);
      setLoading(null);
      return;
    }
    if (result.redirected) return; // redirect en cours
    setLoading(null);
    window.location.href = "/dashboard";
  };

  const soon = (label: string) =>
    toast.info(`${label} arrive bientôt`, { description: "Connectez-vous avec Google ou Apple en attendant." });

  return (
    <div className="space-y-3">
      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border/60" /></div>
        <div className="relative flex justify-center text-[11px] uppercase tracking-wider">
          <span className="bg-background/60 backdrop-blur-sm px-2 text-muted-foreground">ou continuer avec</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" className="rounded-xl h-11 gap-2 bg-background/60 backdrop-blur-sm" onClick={() => signIn("google")} disabled={!!loading}>
          {loading === "google" ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
          <span className="text-sm">Google</span>
        </Button>
        <Button type="button" variant="outline" className="rounded-xl h-11 gap-2 bg-background/60 backdrop-blur-sm" onClick={() => signIn("apple")} disabled={!!loading}>
          {loading === "apple" ? <Loader2 className="w-4 h-4 animate-spin" /> : <AppleIcon />}
          <span className="text-sm">Apple</span>
        </Button>
        <Button type="button" variant="outline" className="rounded-xl h-11 gap-2 bg-background/60 backdrop-blur-sm opacity-70" onClick={() => soon("Facebook")}>
          <FacebookIcon />
          <span className="text-sm">Facebook</span>
        </Button>
        <Button type="button" variant="outline" className="rounded-xl h-11 gap-2 bg-background/60 backdrop-blur-sm opacity-70" onClick={() => soon("LinkedIn")}>
          <LinkedInIcon />
          <span className="text-sm">LinkedIn</span>
        </Button>
      </div>
      <p className="text-[10px] text-center text-muted-foreground">Facebook & LinkedIn : bientôt disponibles.</p>
    </div>
  );
}
