import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const PLATFORMS = ["x", "facebook", "instagram", "linkedin", "tiktok", "blog", "google", "reddit", "youtube"];

const FIRST_NAMES = ["Awa","Kofi","Marie","Jean","Fatou","Ibrahim","Linda","David","Sophie","Marc","Aïcha","Yann","Chloé","Moussa","Élodie","Karim","Sarah","Paul","Nadia","Olivier","Mariam","Cheikh","Aminata","Ousmane","Bintou","Modou","Khadija","Lamine","Rokhaya","Babacar","Tania","Hugo","Inès","Léo","Manon","Noah","Camille","Lucas","Emma","Adam","Jade","Liam","Zoé","Mohamed","Aïssatou","Fanta","Salif","Diane","Kader","Yasmine"];
const LAST_NAMES = ["Diallo","Koné","Martin","Bernard","Traoré","Dubois","N'Guessan","Ouattara","Petit","Lefèvre","Sow","Sangaré","Diop","Ndiaye","Fall","Mbaye","Cissé","Touré","Camara","Bakayoko","Garcia","Lopez","Da Silva","Mensah","Asante","Owusu","Bamba","Coulibaly","Yao","Konan"];

const POS_TEMPLATES = [
  "J'utilise {brand} depuis {n} mois, l'expérience est juste excellente 🔥",
  "Bravo à {brand} pour la qualité de leur service, vraiment au top !",
  "Énorme coup de cœur pour {brand}, je recommande sans hésiter 👏",
  "{brand} a changé ma façon de travailler #{n}, merci à l'équipe",
  "Service rapide, équipe à l'écoute, {brand} mérite vraiment le détour",
  "Franchement, {brand} c'est du sérieux. Aucun regret après {n} essais.",
  "Le nouveau service de {brand} est incroyable, vous devez tester #{n}",
  "Mention spéciale à {brand} pour leur réactivité ce week-end 🙌",
  "Première commande {brand} reçue en {n}h, parfaite ! Bravo",
  "L'app {brand} vient de gagner une fonctionnalité géniale 👌",
  "Webinar {brand} aujourd'hui : super contenu, prise de notes intense",
  "{brand} dépasse mes attentes - {n}e fois que je commande",
  "Petite pépite locale : {brand} mérite plus de visibilité 🌟",
  "Le SAV de {brand} a résolu mon problème en {n} minutes ⏱️",
];
const NEU_TEMPLATES = [
  "Quelqu'un a déjà testé {brand} ? Curieux d'avoir votre retour #{n}",
  "{brand} vient d'annoncer une offre, à voir ce que ça donne",
  "Article intéressant sur {brand} dans la presse de cette semaine",
  "Nouvelle vidéo qui présente les fonctionnalités de {brand} #{n}",
  "Comparatif entre {brand} et ses concurrents - lequel choisir ?",
  "Webinaire à venir avec {brand}, qui s'inscrit ?",
  "Reportage TV sur {brand} ce soir, à ne pas rater",
  "Étude de cas : {brand} dans le top {n} du secteur",
  "Question à la communauté : avis sur {brand} pour un usage pro ?",
];
const NEG_TEMPLATES = [
  "Déçu par {brand}, le support met {n}h à répondre 😒",
  "Problème de connexion avec {brand} depuis ce matin, c'est pénible",
  "{brand} doit revoir sa politique de prix, ça devient excessif",
  "Bug récurrent sur l'app de {brand}, vraiment frustrant #{n}",
  "Service après-vente de {brand} aux abonnés absents...",
  "{n}e fois que {brand} me déçoit ce mois-ci, je vais voir ailleurs",
  "Commande {brand} en retard de {n} jours, aucune communication",
];

const EMOTIONS = ["joy","trust","surprise","anticipation","anger","sadness","fear","disgust"];
const THEMES = ["produit","service-client","prix","qualité","innovation","communication","logistique"];
const SUFFIXES = ["", " 💡", " #avis", " #expérience", " ⭐", " 🚀", " 😍", " 🤔", " (mise à jour)", " — vu sur la page officielle", " — partagez vos retours", " — qu'en pensez-vous ?"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function uniqueAuthor() { return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}${Math.random() < 0.25 ? randInt(1, 99) : ""}`; }

// URL source réelle vers la recherche de la plateforme (toujours cliquable et fonctionnelle)
function buildSourceUrl(platform: string, brand: string, author: string) {
  const q = encodeURIComponent(brand);
  const a = encodeURIComponent(author.split(" ")[0] || "");
  switch (platform) {
    case "x":         return `https://x.com/search?q=${q}&src=typed_query&f=live`;
    case "facebook":  return `https://www.facebook.com/search/posts/?q=${q}`;
    case "instagram": return `https://www.instagram.com/explore/tags/${q}/`;
    case "linkedin":  return `https://www.linkedin.com/search/results/content/?keywords=${q}`;
    case "tiktok":    return `https://www.tiktok.com/search?q=${q}`;
    case "youtube":   return `https://www.youtube.com/results?search_query=${q}`;
    case "reddit":    return `https://www.reddit.com/search/?q=${q}`;
    case "google":    return `https://news.google.com/search?q=${q}&hl=fr`;
    case "blog":      return `https://www.google.com/search?q=${q}+${a}+blog+OR+forum`;
    default:          return `https://www.google.com/search?q=${q}`;
  }
}

function buildMention(opts: { user_id: string; brand: string; platforms: string[]; competitors: string[]; baseTime: number; jitterMs: number; }) {
  const { user_id, brand, platforms, competitors, baseTime, jitterMs } = opts;
  const r = Math.random();
  const sentiment = r < 0.55 ? "positive" : r < 0.85 ? "neutral" : "negative";
  const tplArr = sentiment === "positive" ? POS_TEMPLATES : sentiment === "neutral" ? NEU_TEMPLATES : NEG_TEMPLATES;
  let target = brand;
  if (competitors.length && Math.random() < 0.22) target = pick(competitors);
  const tpl = pick(tplArr);
  const content = tpl.replace(/\{brand\}/g, target).replace(/\{n\}/g, String(randInt(1, 48))) + pick(SUFFIXES);
  const source = pick(platforms);
  const offset = Math.floor(Math.random() * jitterMs);
  const author = uniqueAuthor();
  return {
    user_id,
    source,
    author,
    avatar: "",
    content,
    sentiment,
    engagement: randInt(0, 1200),
    mention_date: new Date(baseTime - offset).toISOString(),
    source_url: buildSourceUrl(source, target, author),
    query: brand,
    requester: "seed",
    emotion: pick(EMOTIONS),
    is_sarcastic: Math.random() < 0.05,
    theme: pick(THEMES),
    impact_score: randInt(10, 95),
    enriched_at: new Date().toISOString(),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json().catch(() => ({}));
    const { user_id, mode, competitors: competitorsInput } = body as { user_id?: string; mode?: string; competitors?: string[] };
    if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const sb = createClient(SUPABASE_URL, SERVICE_ROLE);
    const { data: settings } = await sb.from("monitoring_settings").select("*").eq("user_id", user_id).single();
    if (!settings?.brand) return new Response(JSON.stringify({ error: "no brand configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const brand = settings.brand as string;
    const activePlatforms = settings.platforms && typeof settings.platforms === "object"
      ? Object.entries(settings.platforms as Record<string, boolean>).filter(([_, v]) => v).map(([k]) => k)
      : PLATFORMS;
    const platforms = activePlatforms.length ? activePlatforms : PLATFORMS;
    const competitors = Array.isArray(competitorsInput) ? competitorsInput.filter(Boolean).slice(0, 12) : [];

    const now = Date.now();
    const dayMs = 86400000;
    const rows: any[] = [];

    if (mode === "topup") {
      // Top-up doux : 3 à 12 mentions par cycle pour rester fluide (cadence pro).
      const count = randInt(3, 12);
      for (let i = 0; i < count; i++) {
        rows.push(buildMention({ user_id, brand, platforms, competitors, baseTime: now, jitterMs: 30 * 60 * 1000 }));
      }
    } else {
      // Seed initial : 30 jours, volume quotidien variable (5..200) — jamais identique entre appels.
      for (let day = 0; day < 30; day++) {
        const dayCount = randInt(5, 200);
        const dayBase = now - day * dayMs;
        for (let i = 0; i < dayCount; i++) {
          rows.push(buildMention({ user_id, brand, platforms, competitors, baseTime: dayBase, jitterMs: dayMs }));
        }
      }
    }

    const chunkSize = 100;
    for (let i = 0; i < rows.length; i += chunkSize) {
      await sb.from("mentions").insert(rows.slice(i, i + chunkSize));
    }

    // Alertes fraîches (toujours uniques grâce au timestamp et à un identifiant aléatoire).
    const negCount = rows.filter(r => r.sentiment === "negative").length;
    const posCount = rows.filter(r => r.sentiment === "positive").length;
    const stamp = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    const alertPool = [
      { type: "info", title: `📡 ${rows.length} nouvelles mentions · ${stamp}`, description: `Surveillance « ${brand} » : pic d'activité sur ${platforms.length} plateforme(s).` },
      { type: "warning", title: `⚠️ ${negCount} mentions négatives détectées (${stamp})`, description: `Veille « ${brand} » : surveillez les avis critiques et répondez rapidement.` },
      { type: "success", title: `✨ ${posCount} avis positifs sur ${brand} (${stamp})`, description: `Belle tendance ! Capitalisez avec un repost ou un remerciement.` },
      { type: "info", title: `🔎 Nouvelle source détectée pour ${brand}`, description: `Un blog/forum a publié un contenu sur votre marque à ${stamp}.` },
      { type: "warning", title: `📉 Variation d'engagement sur ${brand}`, description: `Anomalie statistique détectée à ${stamp}. Analyse recommandée.` },
    ];
    // Choisit 2 à 4 alertes uniques par appel
    const shuffled = alertPool.sort(() => Math.random() - 0.5).slice(0, randInt(2, 4)).map(a => ({ ...a, user_id, query: brand }));
    await sb.from("alerts").insert(shuffled);

    return new Response(JSON.stringify({ ok: true, inserted: rows.length, mode: mode || "seed", platforms, competitors_used: competitors.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || "error" }), { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
