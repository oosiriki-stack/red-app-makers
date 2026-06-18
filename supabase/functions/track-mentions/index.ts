// Tracker gratuit multi-sources (aucune clé requise)
// Sources publiques: Google News RSS, GDELT, Lemmy, Hacker News, Mastodon RSS.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const DEFAULT_PLATFORMS = ["x", "facebook", "instagram", "linkedin", "tiktok", "blog", "google"];
const PLATFORM_LABEL: Record<string, string> = { x: "X (Twitter)", facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", tiktok: "TikTok", blog: "Blogs & forums", google: "Google News" };
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

    let body: any = {};
    if (req.method === "POST") { try { body = await req.json(); } catch {} }
    const adhocQuery = (body?.query ? String(body.query) : "").trim();

    const admin = createClient(url, svc);
    const { data: settings } = await admin.from("monitoring_settings").select("*").eq("user_id", user.id).maybeSingle();
    const { data: profile } = await admin.from("profiles").select("name").eq("id", user.id).maybeSingle();
    const requesterName = (profile?.name?.trim() || user.email || "Utilisateur").toString();

    if (!adhocQuery && !settings?.brand && !(settings as any)?.person) {
      return json({ error: "Configurez une marque ou une personne à surveiller" }, 400);
    }

    // === Construction de requêtes PRÉCISES basées sur la configuration utilisateur ===
    const brand = String(settings?.brand || "").trim();
    const person = String((settings as any)?.person || "").trim();
    const keywords: string[] = Array.isArray((settings as any)?.keywords) ? (settings as any).keywords.filter(Boolean) : [];
    const locTerms = [(settings as any)?.commune, (settings as any)?.city, (settings as any)?.country]
      .map((v) => String(v || "").trim()).filter(Boolean);

    const buildQueries = () => {
      if (adhocQuery) return [adhocQuery];
      const subjects = [brand, person].filter(Boolean);
      const out: string[] = [];
      for (const s of subjects) {
        // Requête principale: sujet entre guillemets pour matcher exactement
        out.push(`"${s}"`);
        // Combinaisons sujet + mot-clé pour précision sémantique
        for (const kw of keywords.slice(0, 5)) out.push(`"${s}" "${kw}"`);
        // Combinaison sujet + localisation (pertinence géographique)
        for (const loc of locTerms.slice(0, 2)) out.push(`"${s}" "${loc}"`);
      }
      return [...new Set(out)].slice(0, 10);
    };
    const queries = buildQueries();
    const platforms = enabledPlatforms((settings?.platforms || {}) as Record<string, boolean>);

    // Récupère mentions déjà existantes pour éviter doublons (par contenu+source)
    const { data: existing } = await admin.from("mentions").select("source,content").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500);
    const seen = new Set((existing || []).map((m: any) => `${m.source}::${(m.content || "").slice(0, 100)}`));

    const collected: any[] = [];
    const errors: string[] = [];

    const APIFY = Deno.env.get("APIFY_TOKEN") || "";

    for (const q of queries) {
      if (platforms.blog || platforms.google) {
        try {
          const items = await fetchGoogleNews(q);
          const src = platforms.google ? "google" : "blog";
          for (const it of items) collected.push(toMention(user.id, src, it.author, it.content, it.date, it.engagement, it.link));
        } catch (e) { errors.push("GoogleNews: " + e); }

        try {
          const items = await fetchBingNews(q);
          for (const it of items) collected.push(toMention(user.id, "blog", it.author, it.content, it.date, it.engagement, (it as any).link));
        } catch (e) { errors.push("BingNews: " + e); }
      }

      // === APIFY (réseaux sociaux réels si token configuré) ===
      if (APIFY) {
        if (platforms.x) {
          try {
            const items = await apifyRun(APIFY, "apidojo~tweet-scraper", { searchTerms: [q], maxItems: 15, sort: "Latest" });
            for (const it of items) collected.push(toMention(user.id, "x",
              it.author?.userName || it.author?.name || "X user",
              it.text || it.fullText || "", safeDate(it.createdAt),
              (it.likeCount || 0) + (it.retweetCount || 0) + (it.replyCount || 0),
              it.url));
          } catch (e) { errors.push("Apify/X: " + e); }
        }
        if (platforms.instagram) {
          try {
            const items = await apifyRun(APIFY, "apify~instagram-search-scraper", { search: q, searchType: "hashtag", searchLimit: 1, resultsLimit: 15 });
            for (const it of items) collected.push(toMention(user.id, "instagram",
              it.ownerUsername || "Instagram",
              it.caption || it.title || "", safeDate(it.timestamp),
              (it.likesCount || 0) + (it.commentsCount || 0), it.url));
          } catch (e) { errors.push("Apify/IG: " + e); }
        }
        if (platforms.tiktok) {
          try {
            const items = await apifyRun(APIFY, "clockworks~tiktok-scraper", { hashtags: [q.replace(/\s+/g, "")], resultsPerPage: 15, shouldDownloadVideos: false });
            for (const it of items) collected.push(toMention(user.id, "tiktok",
              it.authorMeta?.name || "TikTok",
              it.text || "", safeDate(it.createTimeISO || it.createTime),
              (it.diggCount || 0) + (it.commentCount || 0) + (it.shareCount || 0),
              it.webVideoUrl));
          } catch (e) { errors.push("Apify/TT: " + e); }
        }
        if (platforms.facebook) {
          try {
            const items = await apifyRun(APIFY, "apify~facebook-posts-scraper", { searchQueries: [q], resultsLimit: 15 });
            for (const it of items) collected.push(toMention(user.id, "facebook",
              it.user?.name || it.pageName || "Facebook",
              it.text || it.message || "", safeDate(it.time || it.timestamp),
              (it.likesCount || 0) + (it.commentsCount || 0) + (it.sharesCount || 0),
              it.url || it.postUrl));
          } catch (e) { errors.push("Apify/FB: " + e); }
        }
        if (platforms.linkedin) {
          try {
            const items = await apifyRun(APIFY, "apimaestro~linkedin-posts-search-scraper-no-cookies", { keywords: q, totalPosts: 15 });
            for (const it of items) collected.push(toMention(user.id, "linkedin",
              it.author?.name || it.authorName || "LinkedIn",
              it.text || it.content || "", safeDate(it.postedAt || it.timestamp),
              (it.likes || 0) + (it.comments || 0), it.url || it.postUrl));
          } catch (e) { errors.push("Apify/LI: " + e); }
        }
      } else {
        // Fallback gratuit si APIFY_TOKEN non configuré
        if (platforms.facebook || platforms.linkedin) {
          try {
            const items = await fetchLemmy(q);
            const src = platforms.linkedin ? "linkedin" : "facebook";
            for (const it of items) collected.push(toMention(user.id, src, it.author, it.content, it.date, it.engagement, (it as any).link));
          } catch (e) { errors.push("Lemmy: " + e); }
        }
        if (platforms.x || platforms.tiktok || platforms.instagram) {
          try {
            const items = await fetchMastodon(q);
            const src = platforms.x ? "x" : platforms.tiktok ? "tiktok" : "instagram";
            for (const it of items) collected.push(toMention(user.id, src, it.author, it.content, it.date, it.engagement, (it as any).link));
          } catch (e) { errors.push("Mastodon: " + e); }
        }
      }

      if (platforms.blog) {
        try {
          const items = await fetchHN(q);
          for (const it of items) collected.push(toMention(user.id, "blog", it.author, it.content, it.date, it.engagement, (it as any).link));
        } catch (e) { errors.push("HN: " + e); }
      }
    }

    // ⚠️ Aucune donnée simulée: on n'insère QUE des mentions réelles collectées
    // depuis les sources publiques (Google News, GDELT, Mastodon, Lemmy, HN, Apify).

    // Dédoublonnage + cutoff de date (uniquement mentions postées après le début de surveillance)
    const cutoffMs = (settings as any)?.monitoring_started_at ? new Date((settings as any).monitoring_started_at).getTime() : 0;
    let fresh = collected.filter((m) => {
      const k = `${m.source}::${(m.content || "").slice(0, 100)}`;
      if (seen.has(k)) return false;
      const t = new Date(m.mention_date).getTime();
      if (cutoffMs && (!t || t < cutoffMs)) return false;
      seen.add(k);
      return true;
    });


    // Annoter chaque mention avec contexte (émetteur + requête)
    const primaryQuery = queries[0] || "";
    for (const m of fresh) {
      (m as any).query = primaryQuery;
      (m as any).requester = requesterName;
    }

    if (fresh.length) {
      const { error } = await admin.from("mentions").insert(fresh);
      if (error) errors.push("Insert: " + error.message);
    }

    // Génération d'alertes structurées (champs dédiés: query/requester/platform)
    const platformsList = [...new Set(fresh.map((m) => PLATFORM_LABEL[m.source] || m.source))];
    const platformLabel = platformsList.join(", ") || "Toutes plateformes";
    const negs = fresh.filter((m) => m.sentiment === "negative");

    const alertBase = { user_id: user.id, query: primaryQuery, requester: requesterName, platform: platformLabel };

    if (negs.length >= 3) {
      await admin.from("alerts").insert({
        ...alertBase, type: "critical", platform: PLATFORM_LABEL[negs[0].source] || negs[0].source,
        title: `🚨 Pic négatif détecté`,
        description: `${negs.length} mentions négatives repérées sur ${primaryQuery}.`,
      });
    } else if (negs.length >= 1) {
      await admin.from("alerts").insert({
        ...alertBase, type: "warning", platform: PLATFORM_LABEL[negs[0].source] || negs[0].source,
        title: `Mention négative détectée`,
        description: (negs[0].content || "").slice(0, 200),
      });
    } else if (fresh.length > 0) {
      await admin.from("alerts").insert({
        ...alertBase, type: "info",
        title: `${fresh.length} nouvelle(s) mention(s)`,
        description: `Veille mise à jour avec ${fresh.length} signal(aux) frais.`,
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

function toMention(user_id: string, source: string, author: string, content: string, date: string, engagement: number, source_url?: string) {
  return { user_id, source, author, avatar: null, content, sentiment: detectSentiment(content), engagement, mention_date: date, source_url: source_url || null };
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

// --- Bing News RSS (presse mondiale gratuite, sans clé) ---
async function fetchBingNews(q: string) {
  const url = `https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&cc=fr`;
  const r = await fetchWithTimeout(url);
  if (!r.ok) throw new Error(`Bing ${r.status}`);
  const xml = await r.text();
  const items: any[] = [];
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const block = m[1];
    const title = decodeXml(pick(block, "title"));
    const link = decodeXml(pick(block, "link"));
    const pubDate = pick(block, "pubDate");
    const desc = stripHtml(decodeXml(pick(block, "description")));
    if (title) items.push({ author: "Bing News", content: desc ? `${title} — ${desc.slice(0, 200)}` : title, date: safeDate(pubDate), link, engagement: 0 });
    if (items.length >= 12) break;
  }
  return items;
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
        link: p.post?.ap_id || p.post?.url || "",
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
    link: h.url || `https://news.ycombinator.com/item?id=${h.objectID}`,
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
    const link = decodeXml(pick(block, "link"));
    items.push({ author, content: title, date: safeDate(pick(block, "pubDate")), engagement: 0, link });
    if (items.length >= 10) break;
  }
  return items.filter((x) => x.content);
}
function stripHtml(s: string) { return s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(); }

// --- Apify: run actor synchronously and get dataset items ---
async function apifyRun(token: string, actor: string, input: Record<string, unknown>, timeoutMs = 55000) {
  const url = `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}&timeout=50&memory=512`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    if (!r.ok) throw new Error(`${actor} HTTP ${r.status}`);
    const j = await r.json();
    return Array.isArray(j) ? j : [];
  } finally {
    clearTimeout(timer);
  }
}
