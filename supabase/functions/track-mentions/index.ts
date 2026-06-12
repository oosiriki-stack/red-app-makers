// Tracker de mentions: X (réel via Twitter API v2 si clés disponibles) + sources simulées
// Génère des mentions + alertes pour la marque/personne surveillée de l'utilisateur
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const admin = createClient(supabaseUrl, serviceKey);
    const { data: settings } = await admin.from("monitoring_settings").select("*").eq("user_id", user.id).single();
    if (!settings?.brand) return new Response(JSON.stringify({ error: "Pas de marque configurée" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const query = settings.brand;
    const platforms = (settings.platforms || {}) as Record<string, boolean>;
    const inserted: any[] = [];

    // --- X (Twitter) RÉEL si bearer disponible ---
    const bearer = Deno.env.get("TWITTER_BEARER_TOKEN");
    if (platforms.x && bearer) {
      try {
        const q = encodeURIComponent(`${query} -is:retweet lang:fr`);
        const r = await fetch(
          `https://api.x.com/2/tweets/search/recent?query=${q}&max_results=10&tweet.fields=author_id,created_at,public_metrics&expansions=author_id&user.fields=username,name`,
          { headers: { Authorization: `Bearer ${bearer}` } },
        );
        if (r.ok) {
          const json = await r.json();
          const users = new Map((json.includes?.users || []).map((u: any) => [u.id, u]));
          for (const t of json.data || []) {
            const u: any = users.get(t.author_id) || { name: "Anonyme", username: "anon" };
            inserted.push({
              user_id: user.id, source: "x", author: `@${u.username}`, avatar: null,
              content: t.text, sentiment: detectSentiment(t.text),
              engagement: (t.public_metrics?.like_count || 0) + (t.public_metrics?.retweet_count || 0),
              mention_date: t.created_at,
            });
          }
        }
      } catch (e) { console.error("X API:", e); }
    }

    // --- Sources simulées (autres plateformes activées) ---
    const simSources = ["facebook", "instagram", "linkedin", "tiktok", "blog", "google"].filter((p) => platforms[p]);
    if (!bearer && platforms.x) simSources.push("x");
    for (const src of simSources) {
      const n = 1 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) {
        const sample = sampleContent(query, src);
        inserted.push({
          user_id: user.id, source: src, author: randomAuthor(src), avatar: null,
          content: sample, sentiment: detectSentiment(sample),
          engagement: Math.floor(Math.random() * 500),
          mention_date: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        });
      }
    }

    if (inserted.length) {
      const { error } = await admin.from("mentions").insert(inserted);
      if (error) console.error("Insert mentions:", error);
    }

    // --- Génère alertes selon volume/sentiment ---
    const negatives = inserted.filter((m) => m.sentiment === "negative");
    if (negatives.length >= 3) {
      await admin.from("alerts").insert({
        user_id: user.id, type: "critical",
        title: `🚨 Pic de mentions négatives détecté pour ${query}`,
        description: `${negatives.length} mentions négatives en quelques minutes. Risque de crise.`,
      });
    } else if (negatives.length >= 1) {
      await admin.from("alerts").insert({
        user_id: user.id, type: "warning",
        title: `Mention négative sur ${negatives[0].source}`,
        description: negatives[0].content.slice(0, 140),
      });
    } else if (inserted.length > 0) {
      await admin.from("alerts").insert({
        user_id: user.id, type: "info",
        title: `${inserted.length} nouvelle(s) mention(s) pour ${query}`,
        description: `Sources: ${[...new Set(inserted.map((m) => m.source))].join(", ")}`,
      });
    }

    return new Response(JSON.stringify({ ok: true, count: inserted.length, real_x: !!bearer && platforms.x }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});

function detectSentiment(text: string): string {
  const t = text.toLowerCase();
  const neg = ["nul", "horrible", "déçu", "decu", "arnaque", "scandale", "honte", "mauvais", "pire", "pourri", "boycott", "fraude"];
  const pos = ["bravo", "génial", "genial", "super", "excellent", "merci", "top", "parfait", "incroyable", "j'adore", "jadore"];
  if (neg.some((w) => t.includes(w))) return "negative";
  if (pos.some((w) => t.includes(w))) return "positive";
  return "neutral";
}
function randomAuthor(src: string) {
  const names = ["Mariam K.", "Kofi A.", "Aïcha D.", "Jean-Marc L.", "Fatou S.", "Ousmane B.", "Linda M.", "Cheikh N."];
  return names[Math.floor(Math.random() * names.length)];
}
function sampleContent(brand: string, src: string) {
  const tmpl = [
    `Je viens de tester ${brand}, vraiment excellent service !`,
    `${brand} c'est génial, je recommande à fond 👏`,
    `Déçu de ${brand}, le service client ne répond pas... 😡`,
    `Quelqu'un a déjà essayé ${brand} ? Vos avis ?`,
    `${brand} fait encore parler de lui sur ${src}`,
    `Bravo à l'équipe ${brand} pour cette nouveauté !`,
    `Mauvaise expérience avec ${brand}, à éviter`,
    `${brand} reste un acteur incontournable en Afrique francophone.`,
  ];
  return tmpl[Math.floor(Math.random() * tmpl.length)];
}
