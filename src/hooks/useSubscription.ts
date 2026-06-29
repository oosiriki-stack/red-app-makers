import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";

export type SubInfo = {
  loading: boolean;
  plan: string | null;
  status: string | null;
  expiresAt: Date | null;
  daysLeft: number;
  isTrial: boolean;
  isPaid: boolean;
  locked: boolean;
  refresh: () => void;
};

// 🎁 Fenêtre promotionnelle "accès complet" — durant cette période tous les modules
// sont déverrouillés pour TOUS les utilisateurs, peu importe leur plan.
// Démarrée le 28/06/2026, dure 21 jours (jusqu'au 19/07/2026 00:00 UTC).
const FULL_ACCESS_UNTIL = new Date("2026-07-19T00:00:00Z").getTime();

export function useSubscription(): SubInfo {
  const { user } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (!cancelled) { setData(data); setLoading(false); } });

    // Realtime refresh : dès qu'un admin active une licence, l'utilisateur la voit immédiatement.
    const channel = supabase.channel(`sub-${user.id}-${Math.random().toString(36).slice(2)}`);
    channel.on(
      "postgres_changes" as any,
      { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
      (payload: any) => { if (!cancelled && payload?.new) setData(payload.new); }
    );
    channel.subscribe();
    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [user, tick]);

  if (isAdmin) {
    return {
      loading: loading || roleLoading,
      plan: "admin", status: "active", expiresAt: null, daysLeft: 9999,
      isTrial: false, isPaid: true, locked: false,
      refresh: () => setTick((t) => t + 1),
    };
  }

  const plan = data?.plan ?? null;
  const status = data?.status ?? null;
  const now = Date.now();

  // Fenêtre promo : pendant 21 jours, tout le monde a accès complet (plan "enterprise" simulé)
  if (now < FULL_ACCESS_UNTIL) {
    const daysLeft = Math.max(0, Math.ceil((FULL_ACCESS_UNTIL - now) / 86400000));
    return {
      loading: loading || roleLoading,
      plan: plan ?? "trial",
      status: "active",
      expiresAt: new Date(FULL_ACCESS_UNTIL),
      daysLeft,
      isTrial: false,
      isPaid: true, // ⬅ déverrouille tous les modules gated par isPaid / PlanGate
      locked: false,
      refresh: () => setTick((t) => t + 1),
    };
  }

  // Comportement normal après la fin de la promo
  const expiresAt = data?.expires_at ? new Date(data.expires_at) : null;
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now) / 86400000)) : 0;
  const notExpired = expiresAt ? expiresAt.getTime() > now : false;
  const isTrial = plan === "trial" && status === "active" && notExpired;
  const isPaid = (plan === "starter" || plan === "pro" || plan === "enterprise") && status === "active" && notExpired;
  const locked = !loading && !roleLoading && !isTrial && !isPaid;

  return {
    loading: loading || roleLoading, plan, status, expiresAt, daysLeft, isTrial, isPaid, locked,
    refresh: () => setTick((t) => t + 1),
  };
}
