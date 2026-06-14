// AI-powered sentiment re-scoring via Lovable AI Gateway.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MODEL = "google/gemini-3-flash-preview";

async function scoreBatch(LOVABLE: string, items: { id: string; content: string }[]) {
  const numbered = items.map((it, i) => `[${i}] ${(it.content || "").replace(/\s+/g, " ").slice(0, 400)}`).join("\n");
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: "Tu es un classificateur de sentiment expert en e-réputation francophone. Réponds STRICTEMENT en JSON: {\"scores\":[{\"i\":<index>,\"s\":\"positive|neutral|negative\"}]}. Aucun texte avant ou après." },
      { role: "user", content: `Classe chaque mention par sentiment (positive | neutral | negative). Une mention est négative si elle exprime une plainte, critique, déception, accusation, alerte de bug/scandale.\n\n${numbered}` },
    ],
    response_format: { type: "json_object" },
  };
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { "Authorization": `Bearer ${LOVABLE}`, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (r.status === 429) throw new Error("Trop de requêtes IA, réessayez plus tard.");
  if (r.status === 402) throw new Error("Crédits IA épuisés.");
  if (!r.ok) throw new Error(`AI ${r.status}: ${await r.text()}`);
  const json = await r.json();
  const raw = json.choices?.[0]?.message?.content || "{}";
  let parsed: any = {};
  try { parsed = JSON.parse(raw); } catch { parsed = JSON.parse(raw.replace(/```json|```/g, "").trim()); }
  return parsed.scores || [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE) return new Response(JSON.stringify({ error: "LOVABLE_API_KEY manquante" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supa = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error } = await supa.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (error || !claims?.claims) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userId = claims.claims.sub;
    const admin = createClient(url, svc);

    const body = await req.json().catch(() => ({}));
    let ids: string[] = Array.isArray(body.ids) ? body.ids : [];
    let items: { id: string; content: string }[] = [];

    if (ids.length) {
      const { data } = await admin.from("mentions").select("id,content").in("id", ids).eq("user_id", userId);
      items = (data || []) as any;
    } else {
      // Re-score the most recent 50 mentions
      const { data } = await admin.from("mentions").select("id,content").eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
      items = (data || []) as any;
    }
    if (!items.length) return new Response(JSON.stringify({ ok: true, updated: 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Process in batches of 15
    let updated = 0;
    for (let i = 0; i < items.length; i += 15) {
      const slice = items.slice(i, i + 15);
      try {
        const scores = await scoreBatch(LOVABLE, slice);
        for (const s of scores) {
          const target = slice[s.i];
          if (!target) continue;
          const sentiment = ["positive", "neutral", "negative"].includes(s.s) ? s.s : "neutral";
          await admin.from("mentions").update({ sentiment }).eq("id", target.id).eq("user_id", userId);
          updated++;
        }
      } catch (e) {
        console.error("batch error", e);
      }
    }

    return new Response(JSON.stringify({ ok: true, updated, total: items.length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
