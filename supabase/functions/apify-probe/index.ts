// Diagnostic: valide de bout en bout les connecteurs Apify Instagram + TikTok.
// GET /apify-probe?q=nike  → { instagram: { ok, count, sample }, tiktok: { ok, count, sample } }
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const IG_ACTOR = "apify~instagram-search-scraper";
const TT_ACTOR = "clockworks~tiktok-scraper";

async function apifyRun(token: string, actor: string, input: Record<string, unknown>, timeoutMs = 55000) {
  const ctrl = new AbortController();
  const tm = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const r = await fetch(
      `https://api.apify.com/v2/acts/${actor}/run-sync-get-dataset-items?token=${token}&timeout=50&memory=512`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal: ctrl.signal },
    );
    const text = await r.text();
    if (!r.ok) throw new Error(`${actor} HTTP ${r.status}: ${text.slice(0, 200)}`);
    const j = JSON.parse(text);
    return Array.isArray(j) ? j : [];
  } finally { clearTimeout(tm); }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const token = Deno.env.get("APIFY_TOKEN") || "";
  if (!token) return json({ error: "APIFY_TOKEN missing" }, 500);

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "nike").trim();
  const tag = q.replace(/\s+/g, "").toLowerCase();

  const [ig, tt] = await Promise.allSettled([
    apifyRun(token, IG_ACTOR, { search: q, searchType: "hashtag", searchLimit: 1, resultsLimit: 5 }),
    apifyRun(token, TT_ACTOR, { hashtags: [tag], resultsPerPage: 5, shouldDownloadVideos: false }),
  ]);

  const summarize = (r: PromiseSettledResult<any[]>, pick: (it: any) => any) =>
    r.status === "fulfilled"
      ? { ok: true, count: r.value.length, sample: r.value.slice(0, 2).map(pick) }
      : { ok: false, error: String((r as any).reason).slice(0, 300) };

  return json({
    query: q,
    instagram: summarize(ig, (it) => ({ author: it.ownerUsername, caption: (it.caption || "").slice(0, 120), url: it.url, likes: it.likesCount })),
    tiktok: summarize(tt, (it) => ({ author: it.authorMeta?.name, text: (it.text || "").slice(0, 120), url: it.webVideoUrl, likes: it.diggCount })),
  });
});

function json(b: any, s = 200) {
  return new Response(JSON.stringify(b, null, 2), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}
