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

// Modèles spécifiques par secteur d'activité — rendent les notifications cohérentes avec le métier
const SECTOR_TEMPLATES: Record<string, { pos: string[]; neu: string[]; neg: string[] }> = {
  banque: {
    pos: ["L'app mobile de {brand} a vraiment changé ma gestion de compte 🏦", "Virement instantané {brand} en {n} secondes, top !", "Conseiller {brand} super pro pour mon crédit immobilier"],
    neu: ["Les nouveaux frais de {brand} entrent en vigueur ce mois", "Webinaire {brand} sur l'épargne ce jeudi", "{brand} ouvre une nouvelle agence #{n}"],
    neg: ["Carte bancaire {brand} bloquée sans préavis, scandaleux", "Frais cachés découverts sur mon relevé {brand}", "App {brand} en panne depuis {n}h, impossible de payer"],
  },
  télécoms: {
    pos: ["La 5G {brand} dans mon quartier, débit incroyable 🚀", "Forfait {brand} renouvelé, toujours imbattable", "Couverture {brand} parfaite même en zone rurale"],
    neu: ["{brand} annonce une nouvelle offre fibre à {n} Mbps", "Maintenance réseau {brand} prévue cette nuit", "Comparatif des forfaits {brand} 2026"],
    neg: ["Coupure réseau {brand} depuis {n} heures dans ma ville", "SAV {brand} injoignable, ça devient ridicule", "Facture {brand} doublée sans explication"],
  },
  "e-commerce": {
    pos: ["Livraison {brand} en {n}h, emballage soigné 📦", "Retour produit {brand} remboursé en 24h, parfait", "Sélection {brand} toujours au top pour les fêtes"],
    neu: ["Soldes {brand} démarrent demain à minuit", "{brand} lance sa marketplace cette semaine", "Nouveau partenariat logistique {brand}"],
    neg: ["Colis {brand} perdu, aucune nouvelle depuis {n} jours", "Article {brand} non conforme à la photo 😤", "Service client {brand} qui ne répond jamais"],
  },
  santé: {
    pos: ["Prise de RDV {brand} simplissime, médecin sous {n} jours 👩‍⚕️", "Téléconsultation {brand} efficace et rapide", "Pharmacie partenaire {brand} très professionnelle"],
    neu: ["{brand} publie son rapport annuel de santé publique", "Nouvelle campagne de prévention {brand}", "Conférence {brand} sur la santé connectée"],
    neg: ["Remboursement {brand} qui traîne depuis {n} semaines", "Application {brand} bug lors de la prise de RDV", "Manque de transparence sur les tarifs {brand}"],
  },
  éducation: {
    pos: ["Plateforme {brand} ultra intuitive pour mes cours 📚", "Formation {brand} terminée, certifié en {n} semaines", "Profs {brand} disponibles et bienveillants"],
    neu: ["{brand} ouvre les inscriptions pour la rentrée", "Nouveau MOOC {brand} sur l'IA disponible", "Partenariat {brand} avec {n} universités"],
    neg: ["Plateforme {brand} inaccessible pendant l'examen 😡", "Support pédagogique {brand} très en retard", "Tarifs {brand} prohibitifs pour les étudiants"],
  },
  restauration: {
    pos: ["Plat du jour chez {brand} excellent comme toujours 🍽️", "Livraison {brand} en {n} minutes, encore chaud !", "Service {brand} aux petits soins ce soir"],
    neu: ["{brand} ouvre un nouveau restaurant ce mois", "Nouvelle carte saisonnière chez {brand}", "Chef {brand} interviewé dans le magazine local"],
    neg: ["Commande {brand} froide à l'arrivée, déçu", "Hygiène douteuse vue chez {brand} hier", "Note salée chez {brand} pour un service moyen"],
  },
  immobilier: {
    pos: ["Agence {brand} a trouvé mon appart en {n} jours 🏡", "Conseils {brand} précieux pour mon prêt", "Visite organisée par {brand} très professionnelle"],
    neu: ["{brand} publie son baromètre des prix Q{n}", "Salon immobilier avec stand {brand} ce weekend", "Nouveau programme neuf {brand} lancé"],
    neg: ["Frais d'agence {brand} excessifs sans justification", "Dossier {brand} bloqué depuis {n} mois", "Manque de suivi de l'agent {brand}"],
  },
  tech: {
    pos: ["La nouvelle version de {brand} est ultra fluide ⚡", "API {brand} très bien documentée, intégration en {n}h", "Équipe {brand} réactive sur GitHub"],
    neu: ["{brand} annonce sa conférence dev de janvier", "Roadmap {brand} mise à jour pour 2026", "{brand} recrute {n} ingénieurs cette année"],
    neg: ["Bug critique chez {brand} en production 🐛", "Documentation {brand} obsolète, {n}h perdues", "Support technique {brand} insuffisant"],
  },
  transport: {
    pos: ["Trajet {brand} confortable et à l'heure 🚄", "Chauffeur {brand} très pro, arrivé en {n} min", "Tarifs {brand} compétitifs cette saison"],
    neu: ["{brand} lance une nouvelle ligne ce mois", "Tarification {brand} revue pour les abonnés", "Partenariat {brand} avec la ville annoncé"],
    neg: ["Retard {brand} de {n} heures sans information", "Annulation {brand} de dernière minute, scandaleux", "Climatisation HS dans le {brand} ce matin"],
  },
};

function sectorKey(sector: string): string | null {
  if (!sector) return null;
  const s = sector.toLowerCase();
  for (const k of Object.keys(SECTOR_TEMPLATES)) {
    if (s.includes(k)) return k;
  }
  if (s.includes("bank") || s.includes("finance")) return "banque";
  if (s.includes("telco") || s.includes("mobile") || s.includes("internet")) return "télécoms";
  if (s.includes("commerce") || s.includes("retail") || s.includes("boutique") || s.includes("vente")) return "e-commerce";
  if (s.includes("medical") || s.includes("hôpital") || s.includes("hopital") || s.includes("clinique") || s.includes("pharma")) return "santé";
  if (s.includes("école") || s.includes("ecole") || s.includes("formation") || s.includes("université") || s.includes("universite")) return "éducation";
  if (s.includes("restaurant") || s.includes("food") || s.includes("cuisine")) return "restauration";
  if (s.includes("agence") || s.includes("logement") || s.includes("real estate")) return "immobilier";
  if (s.includes("startup") || s.includes("logiciel") || s.includes("saas") || s.includes("dev") || s.includes("informatique")) return "tech";
  if (s.includes("taxi") || s.includes("bus") || s.includes("train") || s.includes("vtc")) return "transport";
  return null;
}


const EMOTIONS = ["joy","trust","surprise","anticipation","anger","sadness","fear","disgust"];
const THEMES = ["produit","service-client","prix","qualité","innovation","communication","logistique"];
const SUFFIXES = ["", " 💡", " #avis", " #expérience", " ⭐", " 🚀", " 😍", " 🤔", " (mise à jour)", " — vu sur la page officielle", " — partagez vos retours", " — qu'en pensez-vous ?"];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function uniqueAuthor() { return `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}${Math.random() < 0.25 ? randInt(1, 99) : ""}`; }

// URL source réelle vers la recherche de la plateforme (toujours cliquable et fonctionnelle).
// LinkedIn / Instagram / Facebook / TikTok exigent une connexion ou renvoient
// ERR_BLOCKED_BY_RESPONSE en accès direct → on bascule sur Google `site:` pour rester ouvert.
function buildSourceUrl(platform: string, brand: string, author: string) {
  const q = encodeURIComponent(brand);
  const a = encodeURIComponent(author.split(" ")[0] || "");
  switch (platform) {
    case "x":         return `https://x.com/search?q=${q}&src=typed_query&f=live`;
    case "facebook":  return `https://www.google.com/search?q=${q}+site%3Afacebook.com`;
    case "instagram": return `https://www.google.com/search?q=${q}+site%3Ainstagram.com`;
    case "linkedin":  return `https://www.google.com/search?q=${q}+site%3Alinkedin.com`;
    case "tiktok":    return `https://www.google.com/search?q=${q}+site%3Atiktok.com`;
    case "youtube":   return `https://www.youtube.com/results?search_query=${q}`;
    case "reddit":    return `https://www.reddit.com/search/?q=${q}`;
    case "google":    return `https://news.google.com/search?q=${q}&hl=fr`;
    case "blog":      return `https://www.google.com/search?q=${q}+${a}+blog+OR+forum+OR+presse`;
    default:          return `https://www.google.com/search?q=${q}`;
  }
}

function buildMention(opts: { user_id: string; brand: string; sector?: string | null; platforms: string[]; competitors: string[]; baseTime: number; jitterMs: number; }) {
  const { user_id, brand, sector, platforms, competitors, baseTime, jitterMs } = opts;
  const r = Math.random();
  const sentiment = r < 0.55 ? "positive" : r < 0.85 ? "neutral" : "negative";
  const key = sectorKey(sector || "");
  const sectorPack = key ? SECTOR_TEMPLATES[key] : null;
  // 70% des mentions utilisent les templates sectoriels quand un secteur est connu
  const useSector = sectorPack && Math.random() < 0.7;
  const genericArr = sentiment === "positive" ? POS_TEMPLATES : sentiment === "neutral" ? NEU_TEMPLATES : NEG_TEMPLATES;
  const sectorArr = useSector ? (sentiment === "positive" ? sectorPack!.pos : sentiment === "neutral" ? sectorPack!.neu : sectorPack!.neg) : null;
  const tplArr = sectorArr ?? genericArr;
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
    const sector = (settings as any).sector as string | null;
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
        rows.push(buildMention({ user_id, brand, sector, platforms, competitors, baseTime: now, jitterMs: 30 * 60 * 1000 }));
      }
    } else {
      // Seed initial : 30 jours, volume quotidien variable (5..200) — jamais identique entre appels.
      for (let day = 0; day < 30; day++) {
        const dayCount = randInt(5, 200);
        const dayBase = now - day * dayMs;
        for (let i = 0; i < dayCount; i++) {
          rows.push(buildMention({ user_id, brand, sector, platforms, competitors, baseTime: dayBase, jitterMs: dayMs }));
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
