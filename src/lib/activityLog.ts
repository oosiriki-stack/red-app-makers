// Helper client pour tracer les événements sensibles dans admin_activity_log.
// Utilisé côté UI pour l'activation/test des canaux, ouvertures d'espaces sensibles, etc.
import { supabase } from "@/integrations/supabase/client";

export type ActivityStatus = "success" | "error" | "info";

export async function logActivity(params: {
  action: string;
  target?: string | null;
  status?: ActivityStatus;
  metadata?: Record<string, unknown>;
}) {
  try {
    const { data: u } = await supabase.auth.getUser();
    if (!u?.user) return;
    // La table est ajoutée par migration; les types peuvent ne pas être régénérés.
    await (supabase as any).from("admin_activity_log").insert({
      user_id: u.user.id,
      actor_email: u.user.email ?? null,
      action: params.action,
      target: params.target ?? null,
      status: params.status ?? "success",
      metadata: params.metadata ?? {},
    });
  } catch {
    // Ne jamais bloquer l'UX si le log échoue.
  }
}
