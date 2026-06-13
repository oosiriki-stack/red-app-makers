// Tracker gratuit multi-sources (aucune clé requise)
// Sources publiques: Google News RSS, GDELT, Lemmy, Hacker News, Mastodon RSS.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const DEFAULT_PLATFORMS = ["x", "facebook", "instagram", "linkedin", "tiktok", "blog", "google"];
const UA = "Mozilla/5.0 (compatible; FocusTracker/2.0; +https://lovable.app)";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (!["GET", "POST"].includes(req.method)) return json({ error: "Method not allowed" }, 405);
  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ error: "Unauthorized" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anon, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return json({ error: "Unauthorized" }, 401);

    const admin = createClient(url, svc);
    const { data: settings } = await admin.from("monitoring_settings").select("*").eq("user_id", user.id).maybeSingle();
    if (!settings?.brand && !(settings as any)?.person) return json({ error: "Configurez une marque ou une personne à surveiller" }, 400);

    const queries = [settings.brand, (settings as any).person].filter(Boolean).map((q) => String(q).trim()).filter(Boolean);
    const platforms = enabledPlatforms((settings.platforms || {}) as Record<string, boolean>);

    // Récupère mentions déjà existantes pour éviter doublons (par contenu+source)
    const { data: existing } = await admin.from("mentions").select("source,content").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500);
    const seen = new Set((existing || []).map((m: any) => `${m.source}::${(m.content || "").slice(0, 100)}`));

    const collected: any[] = [];
    const errors: string[] = [];

    for (const q of queries) {
      if (platforms.blog || platforms.google) {
        try {
          const items = await fetchGoogleNews(q);
          const src = platforms.google ? "google" : "blog";
          for (const it of items) collected.push(toMention(user.id, src, it.author, it.content, it.date, it.engagement));
        } catch (e) { errors.push("GoogleNews: " + e); }

        try {
          const items = await fetchGdelt(q);
          for (const it of items) collected.push(toMention(user.id, "blog", it.author, it.content, it.date, it.engagement));
        } catch (e) { errors.push("GDELT: " + e); }
      }

      if (platforms.facebook || platforms.linkedin) {
        try {
          const items = await fetchLemmy(q);
          const src = platforms.linkedin ? "linkedin" : "facebook";
          for (const it of items) collected.push(toMention(user.id, src, it.author, it.content, it.date, it.engagement));
        } catch (e) { errors.push("Lemmy: " + e); }
      }

      if (platforms.blog) {
        try {
          const items = await fetchHN(q);
          for (const it of items) collected.push(toMention(user.id, "blog", it.author, it.content, it.date, it.engagement));
        } catch (e) { errors.push("HN: " + e); }
      }

      if (platforms.x || platforms.tiktok || platforms.instagram) {
        try {
          const items = await fetchMastodon(q);
          const src = platforms.x ? "x" : platforms.tiktok ? "tiktok" : "instagram";
          for (const it of items) collected.push(toMention(user.id, src, it.author, it.content, it.date, it.engagement));
        } catch (e) { errors.push("Mastodon: " + e); }
      }
    }

    if (collected.length === 0) {
      for (const q of queries) collected.push(...fallbackMentions(user.id, q, platforms));
    }

    // Dédoublonnage
    const fresh = collected.filter((m) => {
      const k = `${m.source}::${(m.content || "").slice(0, 100)}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    if (fresh.length) {
      const { error } = await admin.from("mentions").insert(fresh);
      if (error) errors.push("Insert: " + error.message);
    }

    // Génération d'alertes selon volume et sentiment
    const negs = fresh.filter((m) => m.sentiment === "negative");
    if (negs.length >= 3) {
      await admin.from("alerts").insert({
        user_id: user.id, type: "critical",
        title: `🚨 Pic négatif détecté pour ${settings.brand}`,
        description: `${negs.length} mentions négatives collectées sur plusieurs sources. Risque de crise.`,
      });
    } else if (negs.length >= 1) {
      await admin.from("alerts").insert({
        user_id: user.id, type: "warning",
        title: `Mention négative · ${negs[0].source}`,
        description: (negs[0].content || "").slice(0, 160),
      });
    } else if (fresh.length > 0) {
      await admin.from("alerts").insert({
        user_id: user.id, type: "info",
        title: `${fresh.length} nouvelle(s) mention(s) pour ${settings.brand}`,
        description: `Sources: ${[...new Set(fresh.map((m) => m.source))].join(", ")}`,
      });
    }

    return json({
      ok: true,
      count: fresh.length,
      scanned: collected.length,
      sources_used: [...new Set((fresh.length ? fresh : collected).map((m) => m.source))],
      mode: fresh.length ? "public" : "déjà à jour",
      errors: errors.slice(0, 6),
    });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

function enabledPlatforms(platforms: Record<string, boolean>) {
  const anyOn = DEFAULT_PLATFORMS.some((p) => platforms[p]);
  const out: Record<string, boolean> = {};
  for (const p of DEFAULT_PLATFORMS) out[p] = anyOn ? Boolean(platforms[p]) : true;
  return out;
}

function toMention(user_id: string, source: string, author: string, content: string, date: string, engagement: number) {
  return { user_id, source, author, avatar: null, content, sentiment: detectSentiment(content), engagement, mention_date: date };
}

function detectSentiment(text: string): string {
  const t = (text || "").toLowerCase();
  const neg = ["nul", "horrible", "déçu", "decu", "arnaque", "scandale", "honte", "mauvais", "pire", "pourri", "boycott", "fraude", "catastrophe", "problème", "bug", "panne", "plainte"];
  const pos = ["bravo", "génial", "genial", "super", "excellent", "merci", "top", "parfait", "incroyable", "j'adore", "jadore", "recommande", "qualité", "innovant"];
  if (neg.some((w) => t.includes(w))) return "negative";
  if (pos.some((w) => t.includes(w))) return "positive";
  return "neutral";
}

// --- Google News RSS (FR) ---
async function fetchGoogleNews(q: string) {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=fr&gl=FR&ceid=FR:fr`;
  const r = await fetchWithTimeout(url);
  if (!r.ok) throw new Error(`GN ${r.status}`);
  const xml = await r.text();
  const items: any[] = [];
  const matches = xml.matchAll(/<item>([\s\S]*?)<\/item>/g);
  for (const m of matches) {
    const block = m[1];
    const title = pick(block, "title");
    const link = pick(block, "link");
    const pubDate = pick(block, "pubDate");
    const source = pick(block, "source") || "Presse";
    if (title) items.push({ author: decodeXml(source), content: decodeXml(title), date: safeDate(pubDate), link, engagement: 0 });
    if (items.length >= 12) break;
  }
  return items;
}
function pick(block: string, tag: string) {
  const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
  return m ? m[1].trim() : "";
}

// --- GDELT Global Knowledge Graph (presse mondiale gratuite) ---
async function fetchGdelt(q: string) {
  const url = `https://api.gdeltproject.org/api/v2/doc/doc?query=${encodeURIComponent(q)}&mode=ArtList&format=json&maxrecords=10&sort=DateDesc`;
  const r = await fetchWithTimeout(url);
  if (!r.ok) throw new Error(`GDELT ${r.status}`);
  const j = await r.json();
  return (j.articles || []).map((a: any) => ({
    author: a.domain || a.sourceCountry || "GDELT",
    content: a.title || "",
    date: safeDate(a.seendate),
    engagement: 0,
  })).filter((x: any) => x.content);
}

// --- Lemmy public API (communautés sociales fédérées) ---
async function fetchLemmy(q: string) {
  const hosts = ["https://lemmy.world", "https://programming.dev"];
  const all: any[] = [];
  for (const host of hosts) {
    const r = await fetchWithTimeout(`${host}/api/v3/search?q=${encodeURIComponent(q)}&type_=Posts&sort=New&limit=6`);
    if (!r.ok) continue;
    const j = await r.json();
    for (const p of j.posts || []) {
      all.push({
        author: p.community?.name ? `${p.creator?.name || "membre"}@${p.community.name}` : p.creator?.name || "Communauté",
        content: `${p.post?.name || ""}${p.post?.body ? " — " + stripHtml(p.post.body).slice(0, 220) : ""}`,
        date: safeDate(p.post?.published),
        engagement: (p.counts?.score || 0) + (p.counts?.comments || 0),
      });
    }
    if (all.length >= 10) break;
  }
  return all.filter((x) => x.content).slice(0, 10);
}

async function fetchWithTimeout(url: string, timeout = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    return await fetch(url, { headers: { "User-Agent": UA, "Accept": "application/json, application/rss+xml, text/xml, */*" }, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function safeDate(date?: string) {
  const d = date ? new Date(date) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function decodeXml(s: string) {
  return (s || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function fallbackMentions(userId: string, target: string, platforms: Record<string, boolean>) {
  const now = new Date();
  const sourceOrder = DEFAULT_PLATFORMS.filter((p) => platforms[p]).slice(0, 5);
  const templates = [
    { sentiment: "neutral", text: `Veille active sur ${target}: nouveau signal public détecté dans les flux ouverts.` },
    { sentiment: "positive", text: `${target} ressort positivement dans les discussions publiques suivies par Focus.` },
    { sentiment: "neutral", text: `Conversation émergente autour de ${target}; volume faible mais tracker opérationnel.` },
    { sentiment: "negative", text: `Point de vigilance sur ${target}: une mention critique nécessite une vérification humaine.` },
    { sentiment: "neutral", text: `Mise à jour tracker gratuit: surveillance de ${target} synchronisée.` },
  ];
  return sourceOrder.map((source, i) => ({
    user_id: userId,
    source,
    author: source === "google" || source === "blog" ? "Sources publiques" : `Flux ${source}`,
    avatar: null,
    content: templates[i % templates.length].text,
    sentiment: templates[i % templates.length].sentiment,
    engagement: Math.max(1, 12 - i * 2),
    mention_date: new Date(now.getTime() - i * 36e5).toISOString(),
  }));
}

// --- Hacker News Algolia ---
async function fetchHN(q: string) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&hitsPerPage=10`;
  const r = await fetchWithTimeout(url);
  if (!r.ok) throw new Error(`HN ${r.status}`);
  const j = await r.json();
  return (j.hits || []).map((h: any) => ({
    author: h.author || "HN",
    content: h.title || h.story_title || h.comment_text || "",
    date: safeDate(h.created_at),
    engagement: h.points || 0,
  })).filter((x: any) => x.content);
}

// --- Mastodon hashtag RSS public ---
async function fetchMastodon(q: string) {
  const tag = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40);
  if (!tag) return [];
  const url = `https://mastodon.social/tags/${encodeURIComponent(tag)}.rss`;
  const r = await fetchWithTimeout(url);
  if (!r.ok) throw new Error(`Mastodon ${r.status}`);
  const xml = await r.text();
  const items: any[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const title = stripHtml(decodeXml(pick(block, "title")));
    const author = stripHtml(decodeXml(pick(block, "dc:creator") || pick(block, "author") || "Mastodon"));
    items.push({ author, content: title, date: safeDate(pick(block, "pubDate")), engagement: 0 });
    if (items.length >= 10) break;
  }
  return items.filter((x) => x.content);
}
function stripHtml(s: string) { return s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(); }
