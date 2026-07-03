import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

function json(b: unknown, status = 200) {
  return new Response(JSON.stringify(b), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth) return json({ error: "Unauthorized" }, 401);
    const client = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: auth } } });
    const { data: u } = await client.auth.getUser();
    if (!u?.user) return json({ error: "Unauthorized" }, 401);

    const body = await req.json().catch(() => ({}));
    const channel = String(body.channel || "");
    const target = String(body.target || "").trim();
    if (!target) return json({ error: "Cible manquante" }, 400);

    const message = `🔔 Focus — test de canal (${channel}) déclenché à ${new Date().toLocaleString()}`;

    if (channel === "slack") {
      if (!/^https:\/\/hooks\.slack\.com\//i.test(target)) return json({ error: "Webhook Slack invalide" }, 400);
      const r = await fetch(target, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message }) });
      if (!r.ok) return json({ error: `Slack ${r.status}` }, 502);
      return json({ ok: true, channel });
    }

    if (channel === "teams") {
      if (!/^https:\/\/[^ ]+\.webhook\.office\.com\//i.test(target) && !/^https:\/\/[^ ]+\.logic\.azure\.com\//i.test(target)) {
        return json({ error: "Webhook Teams invalide" }, 400);
      }
      const r = await fetch(target, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: message }) });
      if (!r.ok) return json({ error: `Teams ${r.status}` }, 502);
      return json({ ok: true, channel });
    }

    if (channel === "sms" || channel === "whatsapp") {
      if (!/^\+?[0-9\s\-()]{6,}$/.test(target)) return json({ error: "Numéro invalide" }, 400);
      // Mode simulation (aucune passerelle configurée) — enregistre une alerte in-app.
      const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await admin.from("alerts").insert({
        user_id: u.user.id,
        type: "info",
        title: `Test ${channel.toUpperCase()}`,
        description: `Simulation ${channel} vers ${target}. Configurez une passerelle pour envoyer réellement.`,
      });
      return json({ ok: true, simulated: true, channel });
    }

    if (channel === "email") {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(target)) return json({ error: "Email invalide" }, 400);
      const admin = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
      await admin.from("alerts").insert({
        user_id: u.user.id,
        type: "info",
        title: `Test email`,
        description: `Simulation email vers ${target}. Configurez un fournisseur (Resend) pour envoyer réellement.`,
      });
      return json({ ok: true, simulated: true, channel });
    }

    return json({ error: "Canal inconnu" }, 400);
  } catch (e: any) {
    return json({ error: e.message ?? String(e) }, 500);
  }
});
