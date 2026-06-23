import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PLATFORMS = ["x", "facebook", "instagram", "linkedin", "tiktok", "blog", "google", "reddit", "youtube"];

const FIRST_NAMES = ["Awa", "Kofi", "Marie", "Jean", "Fatou", "Ibrahim", "Linda", "David", "Sophie", "Marc", "Aïcha", "Yann", "Chloé", "Moussa", "Élodie", "Karim", "Sarah", "Paul", "Nadia", "Olivier"];
const LAST_NAMES = ["Diallo", "Koné", "Martin", "Bernard", "Traoré", "Dubois", "N'Guessan", "Ouattara", "Petit", "Lefèvre", "Sow", "Sangaré"];

const POS_TEMPLATES = [
  "J'utilise {brand} depuis un mois, l'expérience est juste excellente 🔥",
  "Bravo à {brand} pour la qualité de leur service client, vraiment au top !",
  "Énorme coup de cœur pour {brand}, je recommande sans hésiter 👏",
  "{brand} a totalement changé ma façon de travailler, merci à toute l'équipe",
  "Service rapide, équipe à l'écoute, {brand} mérite le détour",
  "Franchement, {brand} c'est du sérieux. Aucun regret.",
];
const NEU_TEMPLATES = [
  "Quelqu'un a déjà testé {brand} ? Curieux d'avoir votre retour",
  "{brand} vient d'annoncer une nouvelle offre, à voir ce que ça donne",
  "Article intéressant sur {brand} à propos du marché local",
  "Nouvelle vidéo qui présente les fonctionnalités de {brand}",
  "Comparatif entre {brand} et ses concurrents - lequel choisir ?",
];
const NEG_TEMPLATES = [
  "Déçu par {brand}, le support met trop de temps à répondre 😒",
  "Problème de connexion avec {brand} depuis ce matin, c'est pénible",
  "{brand} doit revoir sa politique de prix, ça devient excessif",
  "Bug récurrent sur l'app de {brand}, vraiment frustrant",
];

const EMOTIONS = ["joy", "trust", "surprise", "anticipation", "anger", "sadness", "fear", "disgust"];
const THEMES = ["produit", "service-client", "prix", "qualité", "innovation", "communication", "logistique"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { user_id } = await req.json();
    if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: settings } = await sb.from("monitoring_settings").select("*").eq("user_id", user_id).single();
    if (!settings?.brand) return new Response(JSON.stringify({ error: "no brand configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const brand = settings.brand as string;
    const activePlatforms = settings.platforms && typeof settings.platforms === "object"
      ? Object.entries(settings.platforms as Record<string, boolean>).filter(([_, v]) => v).map(([k]) => k)
      : PLATFORMS;
    const platforms = activePlatforms.length ? activePlatforms : PLATFORMS;

    const now = Date.now();
    const monthMs = 30 * 24 * 60 * 60 * 1000;
    const count = 120; // ~4/day over 30 days

    const rows: any[] = [];
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      const sentiment = r < 0.55 ? "positive" : r < 0.85 ? "neutral" : "negative";
      const tpl = sentiment === "positive" ? pick(POS_TEMPLATES) : sentiment === "neutral" ? pick(NEU_TEMPLATES) : pick(NEG_TEMPLATES);
      const content = tpl.replace(/\{brand\}/g, brand);
      const author = `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`;
      const source = pick(platforms);
      // Spread over past 30 days (slightly weighted to recent)
      const offset = Math.pow(Math.random(), 1.5) * monthMs;
      const mention_date = new Date(now - offset).toISOString();
      rows.push({
        user_id,
        source,
        author,
        avatar: "",
        content,
        sentiment,
        engagement: randInt(0, 850),
        mention_date,
        source_url: `https://example.com/${source}/${Math.random().toString(36).slice(2, 10)}`,
        query: brand,
        requester: "seed",
        emotion: pick(EMOTIONS),
        is_sarcastic: Math.random() < 0.05,
        theme: pick(THEMES),
        impact_score: randInt(10, 95),
        enriched_at: new Date().toISOString(),
      });
    }

    // Insert in chunks
    const chunkSize = 40;
    for (let i = 0; i < rows.length; i += chunkSize) {
      await sb.from("mentions").insert(rows.slice(i, i + chunkSize));
    }

    // Generate a few alerts based on negative mentions
    const negCount = rows.filter(r => r.sentiment === "negative").length;
    const alerts = [
      { user_id, type: "info", title: `📡 Surveillance « ${brand} » active`, description: `${count} mentions détectées sur ${platforms.length} plateforme(s) au cours des 30 derniers jours.`, query: brand },
      { user_id, type: "warning", title: `⚠️ ${negCount} mentions négatives détectées`, description: `Pic d'avis négatifs sur ${brand}. Consultez le fil pour répondre rapidement.`, query: brand },
      { user_id, type: "success", title: `✨ Tendance positive sur ${brand}`, description: `La majorité des mentions sont positives. Excellent travail de votre équipe !`, query: brand },
    ];
    await sb.from("alerts").insert(alerts);

    return new Response(JSON.stringify({ ok: true, inserted: rows.length, platforms }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
