// Scan automatique multi-utilisateurs (cron). Aucun JWT requis.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const DEFAULT_PLATFORMS = ["x", "facebook", "instagram", "linkedin", "tiktok", "blog", "google"];
const PLATFORM_LABEL: Record<string, string> = { x: "X (Twitter)", facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", tiktok: "TikTok", blog: "Blogs & forums", google: "Google News" };
const UA = "Mozilla/5.0 (compatible; FocusTracker/2.0; +https://lovable.app)";

async function processUser(admin: any, APIFY: string, settings: any) {
  try {
    const userId = settings.user_id;
    const queries = [settings.brand, (settings as any).person].filter(Boolean).map((q: any) => String(q).trim()).filter(Boolean);
    if (!queries.length) return { user: userId, skipped: true };

    const { data: profile } = await admin.from("profiles").select("name").eq("id", userId).maybeSingle();
    const requesterName = (profile?.name?.trim() || "Utilisateur").toString();
    const platforms = enabledPlatforms((settings.platforms || {}) as Record<string, boolean>);

    const { data: existing } = await admin.from("mentions").select("source,content").eq("user_id", userId).order("created_at", { ascending: false }).limit(500);
    const seen = new Set((existing || []).map((m: any) => `${m.source}::${(m.content || "").slice(0, 100)}`));

    const tasks: Promise<any[]>[] = [];
    for (const q of queries) {
      if (platforms.blog || platforms.google) {
        const src = platforms.google ? "google" : "blog";
        tasks.push(fetchGoogleNews(q).then((items) => items.map((it) => toMention(userId, src, it.author, it.content, it.date, it.engagement, it.link))).catch(() => []));
        tasks.push(fetchBingNews(q).then((items) => items.map((it: any) => toMention(userId, "blog", it.author, it.content, it.date, it.engagement, it.link))).catch(() => []));
        tasks.push(fetchHN(q).then((items) => items.map((it: any) => toMention(userId, "blog", it.author, it.content, it.date, it.engagement, it.link))).catch(() => []));
      }
      if (APIFY) {
        if (platforms.x) tasks.push(apifyRun(APIFY, "apidojo~tweet-scraper", { searchTerms: [q], maxItems: 10, sort: "Latest" }).then((items) => items.map((it: any) => toMention(userId, "x", it.author?.userName || "X user", it.text || it.fullText || "", safeDate(it.createdAt), (it.likeCount || 0) + (it.retweetCount || 0), it.url))).catch(() => []));
        if (platforms.instagram) tasks.push(apifyRun(APIFY, "apify~instagram-search-scraper", { search: q, searchType: "hashtag", searchLimit: 1, resultsLimit: 10 }).then((items) => items.map((it: any) => toMention(userId, "instagram", it.ownerUsername || "Instagram", it.caption || "", safeDate(it.timestamp), (it.likesCount || 0) + (it.commentsCount || 0), it.url))).catch(() => []));
        if (platforms.tiktok) tasks.push(apifyRun(APIFY, "clockworks~tiktok-scraper", { hashtags: [q.replace(/\s+/g, "")], resultsPerPage: 10, shouldDownloadVideos: false }).then((items) => items.map((it: any) => toMention(userId, "tiktok", it.authorMeta?.name || "TikTok", it.text || "", safeDate(it.createTimeISO), (it.diggCount || 0) + (it.commentCount || 0), it.webVideoUrl))).catch(() => []));
        if (platforms.facebook) tasks.push(apifyRun(APIFY, "apify~facebook-posts-scraper", { searchQueries: [q], resultsLimit: 10 }).then((items) => items.map((it: any) => toMention(userId, "facebook", it.user?.name || "Facebook", it.text || it.message || "", safeDate(it.time), (it.likesCount || 0), it.url))).catch(() => []));
        if (platforms.linkedin) tasks.push(apifyRun(APIFY, "apimaestro~linkedin-posts-search-scraper-no-cookies", { keywords: q, totalPosts: 10 }).then((items) => items.map((it: any) => toMention(userId, "linkedin", it.author?.name || "LinkedIn", it.text || "", safeDate(it.postedAt), (it.likes || 0), it.url))).catch(() => []));
      } else {
        const src = platforms.x ? "x" : "blog";
        tasks.push(fetchMastodon(q).then((items) => items.map((it: any) => toMention(userId, src, it.author, it.content, it.date, it.engagement, it.link))).catch(() => []));
      }
    }

    const settled = await Promise.all(tasks);
    const collected = settled.flat();

    const fresh = collected.filter((m: any) => {
      const k = `${m.source}::${(m.content || "").slice(0, 100)}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const primaryQuery = queries[0] || "";
    for (const m of fresh) { (m as any).query = primaryQuery; (m as any).requester = requesterName; }

    if (fresh.length) {
      await admin.from("mentions").insert(fresh);
      const negs = fresh.filter((m: any) => m.sentiment === "negative");
      const platformLabel = [...new Set(fresh.map((m: any) => PLATFORM_LABEL[m.source] || m.source))].join(", ");
      const base = { user_id: userId, query: primaryQuery, requester: requesterName, platform: platformLabel };
      if (negs.length >= 3) await admin.from("alerts").insert({ ...base, type: "critical", title: "🚨 Pic négatif détecté", description: `${negs.length} mentions négatives sur ${primaryQuery}.` });
      else if (negs.length >= 1) await admin.from("alerts").insert({ ...base, type: "warning", title: "Mention négative détectée", description: (negs[0].content || "").slice(0, 200) });
      else await admin.from("alerts").insert({ ...base, type: "info", title: `${fresh.length} nouvelle(s) mention(s)`, description: `Veille mise à jour.` });
    }
    return { user: userId, inserted: fresh.length };
  } catch (e) { return { user: settings.user_id, error: String(e) }; }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const url = Deno.env.get("SUPABASE_URL")!;
  const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const APIFY = Deno.env.get("APIFY_TOKEN") || "";
  const admin = createClient(url, svc);

  const { data: allSettings } = await admin.from("monitoring_settings").select("*");
  const list = allSettings || [];

  // Run all users in parallel in the background so cron HTTP call returns immediately
  const work = Promise.all(list.map((s: any) => processUser(admin, APIFY, s))).catch((e) => console.error("scan error", e));
  // @ts-ignore EdgeRuntime is available in Supabase Edge Runtime
  try { (globalThis as any).EdgeRuntime?.waitUntil?.(work); } catch {}

  return json({ ok: true, dispatched: list.length });
});

function json(b: any, s = 200) { return new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
function enabledPlatforms(p: Record<string, boolean>) { const any = DEFAULT_PLATFORMS.some((k) => p[k]); const out: Record<string, boolean> = {}; for (const k of DEFAULT_PLATFORMS) out[k] = any ? Boolean(p[k]) : true; return out; }
function toMention(user_id: string, source: string, author: string, content: string, date: string, engagement: number, source_url?: string) { return { user_id, source, author, avatar: null, content, sentiment: detectSentiment(content), engagement, mention_date: date, source_url: source_url || null }; }
function detectSentiment(t: string) { const x = (t || "").toLowerCase(); const neg = ["nul","horrible","déçu","decu","arnaque","scandale","honte","mauvais","pire","pourri","boycott","fraude","catastrophe","problème","bug","panne","plainte"]; const pos = ["bravo","génial","genial","super","excellent","merci","top","parfait","incroyable","j'adore","jadore","recommande","qualité","innovant"]; if (neg.some((w) => x.includes(w))) return "negative"; if (pos.some((w) => x.includes(w))) return "positive"; return "neutral"; }
async function fetchWithTimeout(u: string, t = 9000) { const c = new AbortController(); const tm = setTimeout(() => c.abort(), t); try { return await fetch(u, { headers: { "User-Agent": UA, "Accept": "application/json, application/rss+xml, text/xml, */*" }, signal: c.signal }); } finally { clearTimeout(tm); } }
function safeDate(d?: string) { const x = d ? new Date(d) : new Date(); return Number.isNaN(x.getTime()) ? new Date().toISOString() : x.toISOString(); }
function decodeXml(s: string) { return (s || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">"); }
function pick(b: string, t: string) { const m = b.match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${t}>`)); return m ? m[1].trim() : ""; }
function stripHtml(s: string) { return s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(); }
async function fetchGoogleNews(q: string) { const r = await fetchWithTimeout(`https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=fr&gl=FR&ceid=FR:fr`); if (!r.ok) throw new Error(`GN ${r.status}`); const xml = await r.text(); const items: any[] = []; for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) { const b = m[1]; const title = pick(b, "title"); if (title) items.push({ author: decodeXml(pick(b, "source") || "Presse"), content: decodeXml(title), date: safeDate(pick(b, "pubDate")), link: pick(b, "link"), engagement: 0 }); if (items.length >= 10) break; } return items; }
async function fetchBingNews(q: string) { const r = await fetchWithTimeout(`https://www.bing.com/news/search?q=${encodeURIComponent(q)}&format=rss&cc=fr`); if (!r.ok) throw new Error(`Bing ${r.status}`); const xml = await r.text(); const items: any[] = []; for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) { const block = m[1]; const title = decodeXml(pick(block, "title")); const link = decodeXml(pick(block, "link")); const pubDate = pick(block, "pubDate"); if (title) items.push({ author: "Bing News", content: title, date: safeDate(pubDate), engagement: 0, link }); if (items.length >= 10) break; } return items; }
async function fetchHN(q: string) { const r = await fetchWithTimeout(`https://hn.algolia.com/api/v1/search_by_date?query=${encodeURIComponent(q)}&hitsPerPage=8`); if (!r.ok) throw new Error(`HN ${r.status}`); const j = await r.json(); return (j.hits || []).map((h: any) => ({ author: h.author || "HN", content: h.title || h.story_title || h.comment_text || "", date: safeDate(h.created_at), engagement: h.points || 0, link: h.url || `https://news.ycombinator.com/item?id=${h.objectID}` })).filter((x: any) => x.content); }
async function fetchMastodon(q: string) { const tag = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_]/g, "").slice(0, 40); if (!tag) return []; const r = await fetchWithTimeout(`https://mastodon.social/tags/${encodeURIComponent(tag)}.rss`); if (!r.ok) throw new Error(`Mastodon ${r.status}`); const xml = await r.text(); const items: any[] = []; for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) { const b = m[1]; const title = stripHtml(decodeXml(pick(b, "title"))); const author = stripHtml(decodeXml(pick(b, "dc:creator") || pick(b, "author") || "Mastodon")); items.push({ author, content: title, date: safeDate(pick(b, "pubDate")), engagement: 0, link: decodeXml(pick(b, "link")) }); if (items.length >= 8) break; } return items.filter((x) => x.content); }
async function apifyRun(token: string, actor: string, input: Record<string, unknown>, timeoutMs = 55000) { const c = new AbortController(); const tm = setTimeout(() => c.abort(), timeoutMs); try { const r = await fetch(`https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}&timeout=50&memory=512`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: c.signal }); if (!r.ok) throw new Error(`${actor} HTTP ${r.status}`); const j = await r.json(); return Array.isArray(j) ? j : []; } finally { clearTimeout(tm); } }
