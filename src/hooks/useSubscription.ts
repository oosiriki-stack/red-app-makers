import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export type SubInfo = {
  loading: boolean;
  plan: string | null;
  status: string | null;
  expiresAt: Date | null;
  daysLeft: number;
  isTrial: boolean;
  isPaid: boolean;
  locked: boolean; // trial expired (or sub expired) and no active paid plan
  refresh: () => void;
};

export function useSubscription(): SubInfo {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    let cancelled = false;
    setLoading(true);
    supabase.from("subscriptions").select("*").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => { if (!cancelled) { setData(data); setLoading(false); } });
    return () => { cancelled = true; };
  }, [user, tick]);

  const plan = data?.plan ?? null;
  const status = data?.status ?? null;
  const expiresAt = data?.expires_at ? new Date(data.expires_at) : null;
  const now = Date.now();
  const daysLeft = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now) / 86400000)) : 0;
  const notExpired = expiresAt ? expiresAt.getTime() > now : false;
  const isTrial = plan === "trial" && status === "active" && notExpired;
  const isPaid = (plan === "starter" || plan === "pro" || plan === "enterprise") && status === "active" && notExpired;
  const locked = !loading && !isTrial && !isPaid;

  return {
    loading, plan, status, expiresAt, daysLeft, isTrial, isPaid, locked,
    refresh: () => setTick((t) => t + 1),
  };
}
