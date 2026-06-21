import { useSubscription } from "@/hooks/useSubscription";

export type PlanTier = "trial" | "starter" | "pro" | "enterprise" | "admin";

const RANK: Record<string, number> = {
  trial: 0,
  starter: 1,
  pro: 2,
  enterprise: 3,
  admin: 99,
};

/** Minimum plan required per feature key. */
export const FEATURE_REQUIREMENTS = {
  mentions: "starter",
  alerts: "starter",
  reports: "starter",
  competitors: "starter",
  influencers: "starter",
  social_networks: "starter",
  quick_chart: "starter",
  rss_unlimited: "starter",
  ai_assistant: "pro",
  crisis: "pro",
  realtime_alerts: "pro",
  sms_notifications: "pro",
  whatsapp_notifications: "pro",
  slack_teams: "pro",
  sso: "enterprise",
  api: "enterprise",
  multi_workspace: "enterprise",
} as const;

export type FeatureKey = keyof typeof FEATURE_REQUIREMENTS;

export function usePlanAccess() {
  const sub = useSubscription();
  const currentPlan = (sub.plan ?? "trial") as PlanTier;
  const currentRank = RANK[currentPlan] ?? 0;

  const hasAccess = (feature: FeatureKey): boolean => {
    if (sub.loading) return false;
    if (!sub.isPaid && !sub.isTrial) return false;
    const required = FEATURE_REQUIREMENTS[feature];
    const requiredRank = RANK[required] ?? 0;
    // Trial users only get a taste — block paid-tier features unless admin
    if (sub.isTrial && requiredRank > 0) return false;
    return currentRank >= requiredRank;
  };

  const requiredPlan = (feature: FeatureKey): PlanTier =>
    FEATURE_REQUIREMENTS[feature] as PlanTier;

  return { ...sub, currentPlan, hasAccess, requiredPlan };
}
