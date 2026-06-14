// Scheduled reports notifier — runs daily, emits weekly/monthly alerts.
// Server-only: requires the service-role key as Bearer (never exposed to the browser).
// This effectively blocks all unauthenticated external invocations.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, SERVICE_KEY);

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // ---- Shared-secret auth (server-only callers; bypasses RLS) ----
  const provided = req.headers.get("Authorization");
  if (provided !== `Bearer ${SERVICE_KEY}`) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const now = new Date();
  const isMonday = now.getUTCDay() === 1;
  const isFirstOfMonth = now.getUTCDate() === 1;

  let url: URL | null = null;
  try { url = new URL(req.url); } catch {}
  const force = url?.searchParams.get("force"); // "weekly" | "monthly"

  const runWeekly = isMonday || force === "weekly";
  const runMonthly = isFirstOfMonth || force === "monthly";

  if (!runWeekly && !runMonthly) {
    return new Response(JSON.stringify({ skipped: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: users } = await supabase.from("profiles").select("id");
  const alerts: any[] = [];
  for (const u of users || []) {
    if (runMonthly) {
      alerts.push({
        user_id: u.id, type: "info",
        title: "📊 Rapport mensuel disponible",
        description: "Votre rapport complet du mois est prêt. Ouvrez la section Rapports pour le télécharger en PDF.",
      });
    } else if (runWeekly) {
      alerts.push({
        user_id: u.id, type: "info",
        title: "📈 Rapport hebdomadaire disponible",
        description: "Votre rapport de la semaine est prêt. Ouvrez la section Rapports pour le télécharger en PDF.",
      });
    }
  }
  if (alerts.length) await supabase.from("alerts").insert(alerts);

  return new Response(JSON.stringify({ inserted: alerts.length, weekly: runWeekly, monthly: runMonthly }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
