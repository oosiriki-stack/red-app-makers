// Import des avis Google via Apify (actor: compass~google-maps-reviews-scraper)
// Normalise stars -> sentiment et insère dans public.mentions (source='google').
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const ACTOR = "compass~google-maps-reviews-scraper";
const MAX_REVIEWS = 50;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const APIFY = Deno.env.get("APIFY_TOKEN");
    if (!APIFY) return json({ error: "APIFY_TOKEN manquant" }, 500);

    // Auth utilisateur
    const authHeader = req.headers.get("Authorization") || "";
    const jwt = authHeader.replace("Bearer ", "");
    if (!jwt) return json({ error: "Non authentifié" }, 401);
    const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: userData, error: uErr } = await userClient.auth.getUser(jwt);
    if (uErr || !userData?.user) return json({ error: "Session invalide" }, 401);
    const userId = userData.user.id;

    const admin = createClient(url, svc);
    const { data: monitor } = await admin
      .from("monitoring_settings")
      .select("brand, country")
      .eq("user_id", userId)
      .maybeSingle();

    let brand = monitor?.brand as string | undefined;
    let country = monitor?.country as string | undefined;
    try {
      const body = await req.json();
      if (body?.brand) brand = body.brand;
      if (body?.country) country = body.country;
    } catch {}

    if (!brand) return json({ error: "Aucune marque configurée. Renseignez la surveillance d'abord." }, 400);

    const searchTerm = country ? `${brand} ${country}` : brand;

    // Run Apify actor (synchronously, get dataset items)
    const runUrl = `https://api.apify.com/v2/acts/${ACTOR}/run-sync-get-dataset-items?token=${APIFY}`;
    const runInput = {
      searchStringsArray: [searchTerm],
      maxReviews: MAX_REVIEWS,
      language: "fr",
      reviewsSort: "newest",
      personalData: true,
    };

    const r = await fetch(runUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(runInput),
    });

    if (!r.ok) {
      const txt = await r.text();
      return json({ error: `Apify ${r.status}`, detail: txt.slice(0, 500) }, 502);
    }

    const items: any[] = await r.json();
    if (!Array.isArray(items) || items.length === 0) {
      return json({ ok: true, imported: 0, skipped: 0, message: "Aucun avis trouvé pour cette marque." });
    }

    // Normaliser
    const rows: any[] = [];
    for (const it of items) {
      const text = (it.text || it.reviewText || it.snippet || "").trim();
      if (!text) continue;
      const stars = Number(it.stars ?? it.rating ?? 0);
      const sentiment = stars >= 4 ? "positive" : stars === 3 ? "neutral" : "negative";
      const date = it.publishedAtDate || it.publishAt || it.publishedAt || new Date().toISOString();
      const author = it.name || it.reviewerName || "Anonyme";
      const link = it.reviewUrl || it.url || it.placeUrl || null;
      rows.push({
        user_id: userId,
        source: "google",
        author,
        content: text.slice(0, 1500),
        sentiment,
        mention_date: date,
        source_url: link,
        engagement: Number(it.likesCount || 0),
        query: brand,
        entities: {
          stars,
          place_name: it.title || it.placeName || null,
          place_id: it.placeId || null,
        },
      });
    }

    // Dédoublonnage par (user_id, source_url) — insérer par lot avec ignorance des erreurs de duplication
    let imported = 0;
    let skipped = 0;
    for (const row of rows) {
      // Vérif rapide dupl par source_url si présent
      if (row.source_url) {
        const { data: exist } = await admin
          .from("mentions")
          .select("id")
          .eq("user_id", userId)
          .eq("source_url", row.source_url)
          .maybeSingle();
        if (exist) { skipped++; continue; }
      }
      const { error: insErr } = await admin.from("mentions").insert(row);
      if (insErr) { skipped++; continue; }
      imported++;
    }

    // Alerte info
    if (imported > 0) {
      await admin.from("alerts").insert({
        user_id: userId,
        type: "info",
        title: "⭐ Avis Google importés",
        description: `${imported} nouvel(s) avis Google ajouté(s) pour « ${brand} ».`,
        query: brand,
      });
    }

    return json({ ok: true, imported, skipped, total: rows.length });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

function json(b: any, s = 200) {
  return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
