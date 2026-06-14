// Reddit official scan — read-only via public JSON endpoints. No secret required.
// Ingests posts + top comments matching the user's brand/person into mentions.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const UA = "web:robase-reputation:v1.0 (by /u/robase-app)";

function safeDate(t?: number | string) {
  if (typeof t === "number") return new Date(t * 1000).toISOString();
  const d = t ? new Date(t) : new Date();
  return Number.isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function detectSentiment(t: string) {
  const x = (t || "").toLowerCase();
  const neg = ["nul","horrible","déçu","decu","arnaque","scandale","honte","mauvais","pire","pourri","boycott","fraude","catastrophe","problème","bug","panne","plainte","scam","awful","terrible","worst"];
  const pos = ["bravo","génial","genial","super","excellent","merci","top","parfait","incroyable","recommande","qualité","amazing","great","love","best"];
  if (neg.some((w) => x.includes(w))) return "negative";
  if (pos.some((w) => x.includes(w))) return "positive";
  return "neutral";
}

async function fetchJson(url: string) {
  const r = await fetch(url, { headers: { "User-Agent": UA, "Accept": "application/json" } });
  if (!r.ok) throw new Error(`Reddit ${r.status}`);
  return r.json();
}

async function scanQuery(query: string, limit = 15) {
  const out: any[] = [];
  // 1. Top posts
  try {
    const search = await fetchJson(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${limit}&restrict_sr=0`);
    for (const c of (search?.data?.children || [])) {
      const d = c.data;
      const content = (d.title || "") + (d.selftext ? "\n\n" + d.selftext : "");
      out.push({
        source: "reddit",
        author: `u/${d.author || "anon"} · r/${d.subreddit || "all"}`,
        content: content.slice(0, 1500),
        engagement: (d.score || 0) + (d.num_comments || 0),
        date: safeDate(d.created_utc),
        link: `https://www.reddit.com${d.permalink}`,
        permalink: d.permalink,
      });
    }
  } catch (e) { console.error("reddit posts", e); }

  // 2. Comments (via global comments search)
  try {
    const comments = await fetchJson(`https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&type=comment&sort=new&limit=${Math.floor(limit / 2)}`);
    for (const c of (comments?.data?.children || [])) {
      const d = c.data;
      if (!d.body) continue;
      out.push({
        source: "reddit",
        author: `u/${d.author || "anon"} · r/${d.subreddit || "all"} (comment)`,
        content: (d.body || "").slice(0, 1500),
        engagement: d.score || 0,
        date: safeDate(d.created_utc),
        link: d.permalink ? `https://www.reddit.com${d.permalink}` : `https://www.reddit.com/r/${d.subreddit}`,
        permalink: d.permalink,
      });
    }
  } catch (e) { console.error("reddit comments", e); }

  return out;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supa = createClient(url, anon, { global: { headers: { Authorization: authHeader } } });
    const { data: claims, error: authErr } = await supa.auth.getClaims(authHeader.replace("Bearer ", ""));
    if (authErr || !claims?.claims) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const userId = claims.claims.sub;
    const admin = createClient(url, svc);

    const { data: settings } = await admin.from("monitoring_settings").select("brand,person,monitoring_started_at").eq("user_id", userId).maybeSingle();
    const body = await req.json().catch(() => ({}));
    const queries: string[] = body.queries || [settings?.brand, (settings as any)?.person].filter(Boolean);
    if (!queries.length) return new Response(JSON.stringify({ error: "No brand or person configured" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const { data: profile } = await admin.from("profiles").select("name").eq("id", userId).maybeSingle();
    const requester = profile?.name?.trim() || "Utilisateur";

    const { data: existing } = await admin.from("mentions").select("source_url,content").eq("user_id", userId).eq("source", "reddit").limit(500);
    const seenUrl = new Set((existing || []).map((m: any) => m.source_url).filter(Boolean));

    const collected: any[] = [];
    for (const q of queries) {
      const items = await scanQuery(q);
      for (const it of items) {
        if (seenUrl.has(it.link)) continue;
        seenUrl.add(it.link);
        collected.push({
          user_id: userId,
          source: "reddit",
          author: it.author,
          avatar: null,
          content: it.content,
          sentiment: detectSentiment(it.content),
          engagement: it.engagement,
          mention_date: it.date,
          source_url: it.link,
          query: q,
          requester,
        });
      }
    }

    const cutoff = settings?.monitoring_started_at ? new Date(settings.monitoring_started_at).getTime() : 0;
    const fresh = collected.filter((m) => !cutoff || new Date(m.mention_date).getTime() >= cutoff);

    if (fresh.length) {
      await admin.from("mentions").insert(fresh);
      await admin.from("alerts").insert({
        user_id: userId,
        type: fresh.some((m) => m.sentiment === "negative") ? "warning" : "info",
        title: `Reddit · ${fresh.length} nouvelle(s) discussion(s)`,
        description: `Mots-clés: ${queries.join(", ")}`,
        query: queries[0],
        requester,
        platform: "Reddit",
      });
    }

    return new Response(JSON.stringify({ ok: true, inserted: fresh.length, queries }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
