// Enrichissement IA des mentions : émotion secondaire, sarcasme, entités (NER), thème
// Appelée manuellement ou par detect-anomalies. Traite les mentions non encore enrichies (batch).
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const MODEL = "google/gemini-3-flash-preview";
const BATCH_SIZE = 20;

const SYSTEM_PROMPT = `Tu es un analyste e-réputation spécialiste de l'Afrique francophone (nouchi, camfranglais, wolof, bambara, dioula).
Pour chaque mention fournie, retourne un JSON strict avec ces champs :
- emotion: une parmi "colere", "satisfaction", "inquietude", "enthousiasme", "tristesse", "neutre"
- is_sarcastic: boolean (true si ironie/sarcasme détecté, en tenant compte des expressions africaines)
- entities: { brands: string[], persons: string[], locations: string[], orgs: string[] } (NER)
- theme: une parmi "prix", "service_client", "qualite_produit", "delais", "experience_utilisateur", "communication", "autre"
Réponds UNIQUEMENT avec un tableau JSON [{ "id": "...", "emotion": "...", ... }, ...] sans markdown ni texte.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!KEY) return json({ error: "LOVABLE_API_KEY manquante" }, 500);

    const admin = createClient(url, svc);
    let userId: string | null = null;
    let limit = BATCH_SIZE;
    try {
      const body = await req.json();
      userId = body?.user_id || null;
      limit = Math.min(Number(body?.limit) || BATCH_SIZE, 50);
    } catch {}

    let q = admin
      .from("mentions")
      .select("id, content")
      .is("enriched_at", null)
      .limit(limit);
    if (userId) q = q.eq("user_id", userId);
    const { data: items, error } = await q;
    if (error) throw error;
    if (!items?.length) return json({ ok: true, enriched: 0 });

    const payload = items.map((m: any) => ({ id: m.id, text: (m.content || "").slice(0, 600) }));

    const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: JSON.stringify(payload) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (r.status === 429) return json({ error: "Limite IA atteinte" }, 429);
    if (r.status === 402) return json({ error: "Crédits IA épuisés" }, 402);
    if (!r.ok) return json({ error: `IA ${r.status}` }, 500);

    const j = await r.json();
    let raw = j?.choices?.[0]?.message?.content || "[]";
    // Le modèle peut renvoyer { "results": [...] } ou directement [...]
    let parsed: any;
    try { parsed = JSON.parse(raw); } catch { parsed = []; }
    const arr: any[] = Array.isArray(parsed) ? parsed : (parsed.results || parsed.items || parsed.data || []);

    const now = new Date().toISOString();
    let updated = 0;
    for (const a of arr) {
      if (!a?.id) continue;
      const { error: upErr } = await admin
        .from("mentions")
        .update({
          emotion: a.emotion || "neutre",
          is_sarcastic: Boolean(a.is_sarcastic),
          entities: a.entities || {},
          theme: a.theme || "autre",
          enriched_at: now,
        })
        .eq("id", a.id);
      if (!upErr) updated++;
    }

    return json({ ok: true, enriched: updated, total: items.length });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: any, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
