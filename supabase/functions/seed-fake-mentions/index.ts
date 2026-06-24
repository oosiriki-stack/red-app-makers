import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PLATFORMS = ["x", "facebook", "instagram", "linkedin", "tiktok", "blog", "google", "reddit", "youtube"];

const FIRST_NAMES = ["Awa", "Kofi", "Marie", "Jean", "Fatou", "Ibrahim", "Linda", "David", "Sophie", "Marc", "Aïcha", "Yann", "Chloé", "Moussa", "Élodie", "Karim", "Sarah", "Paul", "Nadia", "Olivier", "Mariam", "Cheikh", "Aminata", "Ousmane", "Bintou", "Modou", "Khadija", "Lamine", "Rokhaya", "Babacar"];
const LAST_NAMES = ["Diallo", "Koné", "Martin", "Bernard", "Traoré", "Dubois", "N'Guessan", "Ouattara", "Petit", "Lefèvre", "Sow", "Sangaré", "Diop", "Ndiaye", "Fall", "Mbaye", "Cissé", "Touré", "Camara", "Bakayoko"];

const POS_TEMPLATES = [
  "J'utilise {brand} depuis un mois, l'expérience est juste excellente 🔥",
  "Bravo à {brand} pour la qualité de leur service client, vraiment au top !",
  "Énorme coup de cœur pour {brand}, je recommande sans hésiter 👏",
  "{brand} a totalement changé ma façon de travailler, merci à toute l'équipe",
  "Service rapide, équipe à l'écoute, {brand} mérite le détour",
  "Franchement, {brand} c'est du sérieux. Aucun regret.",
  "Le nouveau service de {brand} est incroyable, vous devez tester",
  "Mention spéciale à {brand} pour leur réactivité ce week-end 🙌",
];
const NEU_TEMPLATES = [
  "Quelqu'un a déjà testé {brand} ? Curieux d'avoir votre retour",
  "{brand} vient d'annoncer une nouvelle offre, à voir ce que ça donne",
  "Article intéressant sur {brand} à propos du marché local",
  "Nouvelle vidéo qui présente les fonctionnalités de {brand}",
  "Comparatif entre {brand} et ses concurrents - lequel choisir ?",
  "Webinaire à venir avec {brand}, qui s'inscrit ?",
];
const NEG_TEMPLATES = [
  "Déçu par {brand}, le support met trop de temps à répondre 😒",
  "Problème de connexion avec {brand} depuis ce matin, c'est pénible",
  "{brand} doit revoir sa politique de prix, ça devient excessif",
  "Bug récurrent sur l'app de {brand}, vraiment frustrant",
  "Service après-vente de {brand} aux abonnés absents...",
];

const EMOTIONS = ["joy", "trust", "surprise", "anticipation", "anger", "sadness", "fear", "disgust"];
const THEMES = ["produit", "service-client", "prix", "qualité", "innovation", "communication", "logistique"];

// User-specific daily baselines — gives different volumes per user.
const DAILY_PROFILES = [5, 20, 35, 50, 75, 100, 120, 200];

function pick<T>(arr: T[], rnd = Math.random): T { return arr[Math.floor(rnd() * arr.length)]; }
function randInt(min: number, max: number, rnd = Math.random) { return Math.floor(rnd() * (max - min + 1)) + min; }

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

    // Deterministic per-user baseline → each user gets a stable daily volume
    const userHash = hashStr(user_id);
    const rnd = mulberry32(userHash);
    const baseline = DAILY_PROFILES[userHash % DAILY_PROFILES.length];

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const rows: any[] = [];

    // 30 days of mentions, daily counts vary around the user baseline
    for (let day = 0; day < 30; day++) {
      const dayRnd = mulberry32(userHash + day * 7919);
      const variance = 0.4 + dayRnd() * 1.2; // 0.4x .. 1.6x
      const dayCount = Math.max(1, Math.round(baseline * variance));

      for (let i = 0; i < dayCount; i++) {
        const r = rnd();
        const sentiment = r < 0.55 ? "positive" : r < 0.85 ? "neutral" : "negative";
        const tpl = sentiment === "positive" ? pick(POS_TEMPLATES, rnd) : sentiment === "neutral" ? pick(NEU_TEMPLATES, rnd) : pick(NEG_TEMPLATES, rnd);
        const content = tpl.replace(/\{brand\}/g, brand);
        const author = `${pick(FIRST_NAMES, rnd)} ${pick(LAST_NAMES, rnd)}`;
        const source = pick(platforms, rnd);
        const offset = day * dayMs + Math.floor(rnd() * dayMs);
        rows.push({
          user_id,
          source,
          author,
          avatar: "",
          content,
          sentiment,
          engagement: randInt(0, 850, rnd),
          mention_date: new Date(now - offset).toISOString(),
          source_url: `https://example.com/${source}/${Math.random().toString(36).slice(2, 10)}`,
          query: brand,
          requester: "seed",
          emotion: pick(EMOTIONS, rnd),
          is_sarcastic: rnd() < 0.05,
          theme: pick(THEMES, rnd),
          impact_score: randInt(10, 95, rnd),
          enriched_at: new Date().toISOString(),
        });
      }
    }

    const chunkSize = 50;
    for (let i = 0; i < rows.length; i += chunkSize) {
      await sb.from("mentions").insert(rows.slice(i, i + chunkSize));
    }

    const negCount = rows.filter(r => r.sentiment === "negative").length;
    const alerts = [
      { user_id, type: "info", title: `📡 Surveillance « ${brand} » active`, description: `${rows.length} mentions détectées sur ${platforms.length} plateforme(s) au cours des 30 derniers jours (≈ ${baseline}/jour).`, query: brand },
      { user_id, type: "warning", title: `⚠️ ${negCount} mentions négatives détectées`, description: `Pic d'avis négatifs sur ${brand}. Consultez le fil pour répondre rapidement.`, query: brand },
      { user_id, type: "success", title: `✨ Tendance positive sur ${brand}`, description: `La majorité des mentions sont positives. Excellent travail de votre équipe !`, query: brand },
    ];
    await sb.from("alerts").insert(alerts);

    return new Response(JSON.stringify({ ok: true, inserted: rows.length, baseline, platforms }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
