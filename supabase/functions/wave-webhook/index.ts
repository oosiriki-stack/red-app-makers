// Wave Business webhook: receives payment notifications and auto-activates
// the matching pending subscription by transaction_id.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, wave-signature",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

async function verifySignature(secret: string, rawBody: string, header: string | null): Promise<boolean> {
  if (!header) return false;
  // Wave header format: "t=<ts>,v1=<hex>"
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const ts = parts["t"];
  const sig = parts["v1"];
  if (!ts || !sig) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const buf = await crypto.subtle.sign("HMAC", key, enc.encode(`${ts}.${rawBody}`));
  const hex = Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
  // constant-time compare
  if (hex.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < hex.length; i++) diff |= hex.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const WAVE_SECRET = Deno.env.get("WAVE_WEBHOOK_SECRET") || "";

  const raw = await req.text();
  if (WAVE_SECRET) {
    const ok = await verifySignature(WAVE_SECRET, raw, req.headers.get("wave-signature"));
    if (!ok) return json({ error: "invalid_signature" }, 401);
  }

  let event: any;
  try { event = JSON.parse(raw); } catch { return json({ error: "invalid_json" }, 400); }

  // Accept a few common Wave event shapes
  const type: string = event?.type || event?.event_type || "";
  const data = event?.data || event;
  const tx = data?.transaction_id || data?.id || data?.reference || data?.client_reference;
  const amount = Number(data?.amount || data?.amount_received || 0);
  const success = ["checkout.session.completed", "merchant.payment_received", "payment.success"].includes(type) || data?.status === "succeeded";

  if (!success || !tx) return json({ received: true, skipped: true });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: sub, error } = await admin
    .from("subscriptions")
    .select("*")
    .eq("transaction_id", String(tx))
    .eq("status", "pending")
    .maybeSingle();

  if (error) return json({ error: error.message }, 500);
  if (!sub) return json({ received: true, matched: false });

  const expires = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
  const { error: upErr } = await admin
    .from("subscriptions")
    .update({
      status: "active",
      validated_at: new Date().toISOString(),
      expires_at: expires,
      amount_fcfa: amount || sub.amount_fcfa,
    })
    .eq("id", sub.id);
  if (upErr) return json({ error: upErr.message }, 500);

  await admin.from("alerts").insert({
    user_id: sub.user_id,
    type: "info",
    title: "✅ Paiement Wave reçu",
    description: `Votre licence ${sub.plan} est activée automatiquement (tx ${tx}).`,
  });

  return json({ received: true, activated: true, subscription_id: sub.id });
});
