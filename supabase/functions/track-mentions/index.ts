// Tracker gratuit multi-sources (aucune clé requise)
// Sources: Google News RSS, Reddit JSON, Hacker News Algolia, Mastodon public search, RSS blogs
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
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
    const { data: settings } = await admin.from("monitoring_settings").select("*").eq("user_id", user.id).single();
    if (!settings?.brand) return json({ error: "Pas de marque configurée" }, 400);

    const queries = [settings.brand, (settings as any).person].filter(Boolean) as string[];
    const platforms = (settings.platforms || {}) as Record<string, boolean>;

    // Récupère mentions déjà existantes pour éviter doublons (par contenu+source)
    const { data: existing } = await admin.from("mentions").select("source,content").eq("user_id", user.id).order("created_at", { ascending: false }).limit(500);
    const seen = new Set((existing || []).map((m: any) => `${m.source}::${(m.content || "").slice(0, 100)}`));

    const collected: any[] = [];
    const errors: string[] = [];

    for (const q of queries) {
      // 1. Google News RSS (couvre presse/blogs en français) → mappé selon plateformes
      if (platforms.blog || platforms.google) {
        try {
          const items = await fetchGoogleNews(q);
          for (const it of items) collected.push(toMention(user.id, platforms.blog ? "blog" : "google", it.author, it.content, it.date, it.engagement));
        } catch (e) { errors.push("GoogleNews: " + e); }
      }
      // 2. Reddit (proxy "communautés sociales")
      if (platforms.facebook || platforms.linkedin) {
        try {
          const items = await fetchReddit(q);
          for (const it of items) collected.push(toMention(user.id, platforms.facebook ? "facebook" : "linkedin", it.author, it.content, it.date, it.engagement));
        } catch (e) { errors.push("Reddit: " + e); }
      }
      // 3. Hacker News (tech / actualité)
      if (platforms.blog) {
        try {
          const items = await fetchHN(q);
          for (const it of items) collected.push(toMention(user.id, "blog", it.author, it.content, it.date, it.engagement));
        } catch (e) { errors.push("HN: " + e); }
      }
      // 4. Mastodon public search (remplaçant gratuit de Twitter/X)
      if (platforms.x || platforms.tiktok || platforms.instagram) {
        try {
          const items = await fetchMastodon(q);
          const src = platforms.x ? "x" : platforms.tiktok ? "tiktok" : "instagram";
          for (const it of items) collected.push(toMention(user.id, src, it.author, it.content, it.date, it.engagement));
        } catch (e) { errors.push("Mastodon: " + e); }
      }
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

    return json({ ok: true, count: fresh.length, scanned: collected.length, sources_used: [...new Set(fresh.map((m) => m.source))], errors });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }

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
  const r = await fetch(url);
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
    items.push({ author: source, content: title, date: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(), link, engagement: 0 });
    if (items.length >= 10) break;
  }
  return items;
}
function pick(block: string, tag: string) {
  const m = block.match(new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`));
  return m ? m[1].trim() : "";
}

// --- Reddit search.json ---
async function fetchReddit(q: string) {
  const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=new&limit=10`;
  const r = await fetch(url, { headers: { "User-Agent": "Focus-Tracker/1.0" } });
  if (!r.ok) throw new Error(`Reddit ${r.status}`);
  const j = await r.json();
  return (j.data?.children || []).map((c: any) => ({
    author: `u/${c.data.author}`,
    content: c.data.title + (c.data.selftext ? " — " + c.data.selftext.slice(0, 200) : ""),
    date: new Date(c.data.created_utc * 1000).toISOString(),
    engagement: (c.data.score || 0) + (c.data.num_comments || 0),
  }));
}

// --- Hacker News Algolia ---
async function fetchHN(q: string) {
  const url = `https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&hitsPerPage=10`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HN ${r.status}`);
  const j = await r.json();
  return (j.hits || []).map((h: any) => ({
    author: h.author || "HN",
    content: h.title || h.story_title || h.comment_text || "",
    date: h.created_at || new Date().toISOString(),
    engagement: h.points || 0,
  })).filter((x: any) => x.content);
}

// --- Mastodon (mastodon.social) statuses search public ---
async function fetchMastodon(q: string) {
  const url = `https://mastodon.social/api/v2/search?q=${encodeURIComponent(q)}&type=statuses&limit=10&resolve=true`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`Mastodon ${r.status}`);
  const j = await r.json();
  return (j.statuses || []).map((s: any) => ({
    author: `@${s.account?.acct || "anon"}`,
    content: stripHtml(s.content || ""),
    date: s.created_at,
    engagement: (s.favourites_count || 0) + (s.reblogs_count || 0) + (s.replies_count || 0),
  }));
}
function stripHtml(s: string) { return s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(); }
