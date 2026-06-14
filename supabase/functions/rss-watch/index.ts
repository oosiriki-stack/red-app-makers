// RSS Watch — ingests user-managed RSS feeds (Google Alerts, blogs) into mentions.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const UA = "Mozilla/5.0 (compatible; RobaseRSS/1.0; +https://lovable.app)";

function decodeXml(s: string) { return (s || "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">"); }
function stripHtml(s: string) { return s.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ").trim(); }
function pick(b: string, t: string) { const m = b.match(new RegExp(`<${t}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${t}>`)); return m ? m[1].trim() : ""; }
function safeDate(d?: string) { const x = d ? new Date(d) : new Date(); return Number.isNaN(x.getTime()) ? new Date().toISOString() : x.toISOString(); }
function detectSentiment(t: string) {
  const x = (t || "").toLowerCase();
  const neg = ["nul","horrible","déçu","decu","arnaque","scandale","honte","mauvais","pire","pourri","boycott","fraude","catastrophe","problème","bug","panne","plainte"];
  const pos = ["bravo","génial","genial","super","excellent","merci","top","parfait","incroyable","recommande","qualité"];
  if (neg.some((w) => x.includes(w))) return "negative";
  if (pos.some((w) => x.includes(w))) return "positive";
  return "neutral";
}

type FeedItem = { title: string; link: string; date: string; author: string; content: string };

function parseFeed(xml: string): FeedItem[] {
  const out: FeedItem[] = [];
  // Atom (Google Alerts uses Atom)
  if (xml.includes("<feed") && xml.includes("<entry")) {
    for (const m of xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)) {
      const b = m[1];
      const title = decodeXml(stripHtml(pick(b, "title")));
      const linkMatch = b.match(/<link[^>]*href="([^"]+)"/);
      const link = linkMatch ? decodeXml(linkMatch[1]) : "";
      const summary = decodeXml(stripHtml(pick(b, "content") || pick(b, "summary")));
      const date = safeDate(pick(b, "published") || pick(b, "updated"));
      const author = decodeXml(stripHtml(pick(b, "name") || "RSS"));
      if (title) out.push({ title, link, date, author, content: summary || title });
    }
  }
  // RSS 2.0
  for (const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/g)) {
    const b = m[1];
    const title = decodeXml(stripHtml(pick(b, "title")));
    const link = decodeXml(pick(b, "link"));
    const desc = decodeXml(stripHtml(pick(b, "description")));
    const date = safeDate(pick(b, "pubDate"));
    const author = decodeXml(stripHtml(pick(b, "author") || pick(b, "dc:creator") || "RSS"));
    if (title) out.push({ title, link, date, author, content: desc || title });
  }
  return out.slice(0, 30);
}

async function processFeed(admin: any, userId: string, feed: any, requester: string) {
  try {
    const r = await fetch(feed.url, { headers: { "User-Agent": UA, "Accept": "application/rss+xml, application/atom+xml, application/xml, text/xml, */*" }, signal: AbortSignal.timeout(12000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const xml = await r.text();
    const items = parseFeed(xml);
    if (!items.length) return { feed: feed.id, inserted: 0 };

    const { data: existing } = await admin.from("mentions").select("source_url").eq("user_id", userId).eq("source", feed.source || "google").order("created_at", { ascending: false }).limit(200);
    const seen = new Set((existing || []).map((m: any) => m.source_url).filter(Boolean));

    const rows = items
      .filter((it) => it.link && !seen.has(it.link))
      .map((it) => ({
        user_id: userId,
        source: feed.source || "google",
        author: `${feed.label} · ${it.author}`.slice(0, 200),
        avatar: null,
        content: `${it.title}\n\n${it.content}`.slice(0, 1500),
        sentiment: detectSentiment(it.title + " " + it.content),
        engagement: 0,
        mention_date: it.date,
        source_url: it.link,
        query: feed.label,
        requester,
      }));

    if (rows.length) {
      await admin.from("mentions").insert(rows);
    }
    await admin.from("rss_feeds").update({ last_fetched_at: new Date().toISOString(), last_item_key: items[0]?.link || null }).eq("id", feed.id);
    return { feed: feed.id, inserted: rows.length };
  } catch (e) {
    console.error("rss feed error", feed.url, e);
    return { feed: feed.id, error: String(e) };
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    const url = Deno.env.get("SUPABASE_URL")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, svc);

    // If no JWT -> cron mode: scan all active feeds
    let scope: any[] = [];
    let userId: string | null = null;
    if (authHeader?.startsWith("Bearer ")) {
      const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
      const supa = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
      const { data: claims } = await supa.auth.getClaims(authHeader.replace("Bearer ", ""));
      if (claims?.claims) {
        userId = claims.claims.sub;
        const { data } = await admin.from("rss_feeds").select("*").eq("user_id", userId).eq("is_active", true);
        scope = data || [];
      }
    }
    if (!scope.length && !userId) {
      const { data } = await admin.from("rss_feeds").select("*").eq("is_active", true);
      scope = data || [];
    }

    const byUser: Record<string, any[]> = {};
    for (const f of scope) (byUser[f.user_id] ||= []).push(f);

    const results: any[] = [];
    for (const [uid, feeds] of Object.entries(byUser)) {
      const { data: profile } = await admin.from("profiles").select("name").eq("id", uid).maybeSingle();
      const requester = profile?.name?.trim() || "Utilisateur";
      const r = await Promise.all(feeds.map((f) => processFeed(admin, uid, f, requester)));
      results.push(...r);
      const totalNew = r.reduce((s, x) => s + (x.inserted || 0), 0);
      if (totalNew > 0) {
        await admin.from("alerts").insert({ user_id: uid, type: "info", title: `RSS · ${totalNew} nouvelle(s) mention(s)`, description: `Veille RSS mise à jour (${feeds.length} flux).`, requester, platform: "RSS / Google Alerts" });
      }
    }

    return new Response(JSON.stringify({ ok: true, processed: results.length, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
