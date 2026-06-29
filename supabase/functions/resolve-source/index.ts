// Resolve the most consultable source URL for a mention.
// Strategy: build prioritized candidates (direct → alternative embeds → Google site: search → web search),
// probe them in parallel with short timeouts, return the first that responds (or the safest fallback).
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

interface Body {
  content?: string;
  brand?: string;
  author?: string;
  source?: string;
  source_url?: string;
}

const PROBE_TIMEOUT_MS = 1500;

function buildCandidates(b: Body): string[] {
  const clean = (b.content || "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/[«»""'']/g, '"')
    .replace(/\s+/g, " ")
    .trim();
  const firstSentence = clean.split(/[.!?]/)[0] || clean;
  const snippet = firstSentence.split(/\s+/).slice(0, 12).join(" ").trim();
  const brand = (b.brand || "").trim();
  const author = (b.author || "").replace(/^@/, "").trim();
  const parts: string[] = [];
  if (snippet) parts.push(`"${snippet}"`);
  if (brand && !snippet.toLowerCase().includes(brand.toLowerCase())) parts.push(`"${brand}"`);
  const baseQuery = parts.join(" ") || author || brand || "actualité";
  const q = encodeURIComponent(baseQuery);

  const src = (b.source || "").toLowerCase();
  const url = (b.source_url || "").trim();
  const isFake = !url || /example\.com|placeholder|fake/i.test(url) || !/^https?:\/\//i.test(url);
  const direct = isFake ? null : url;

  // Alternative consultable hosts (front-ends that proxy blocked platforms)
  const alt: Record<string, string[]> = {
    x: [`https://nitter.net/search?q=${q}`, `https://www.google.com/search?q=${q}+site%3Ax.com+OR+site%3Atwitter.com`],
    twitter: [`https://nitter.net/search?q=${q}`, `https://www.google.com/search?q=${q}+site%3Ax.com`],
    linkedin: [`https://www.google.com/search?q=${q}+site%3Alinkedin.com`, `https://www.bing.com/search?q=${q}+site%3Alinkedin.com`],
    facebook: [`https://www.google.com/search?q=${q}+site%3Afacebook.com`, `https://www.bing.com/search?q=${q}+site%3Afacebook.com`],
    instagram: [`https://www.google.com/search?q=${q}+site%3Ainstagram.com`, `https://www.bing.com/search?q=${q}+site%3Ainstagram.com`],
    tiktok: [`https://www.google.com/search?q=${q}+site%3Atiktok.com`, `https://www.bing.com/search?q=${q}+site%3Atiktok.com`],
    youtube: [`https://www.youtube.com/results?search_query=${q}`, `https://www.google.com/search?q=${q}+site%3Ayoutube.com`],
    reddit: [`https://www.reddit.com/search/?q=${q}`, `https://www.google.com/search?q=${q}+site%3Areddit.com`],
    google: [`https://news.google.com/search?q=${q}&hl=fr`, `https://www.google.com/search?q=${q}`],
    blog: [`https://www.google.com/search?q=${q}`, `https://www.bing.com/search?q=${q}`],
    presse: [`https://news.google.com/search?q=${q}&hl=fr`, `https://www.google.com/search?q=${q}`],
  };
  const fallback = [
    `https://www.google.com/search?q=${q}`,
    `https://www.bing.com/search?q=${q}`,
    `https://duckduckgo.com/?q=${q}`,
  ];
  const ordered: string[] = [];
  if (direct) ordered.push(direct);
  if (alt[src]) ordered.push(...alt[src]);
  ordered.push(...fallback);
  // dedupe
  return [...new Set(ordered)];
}

async function probe(url: string): Promise<boolean> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), PROBE_TIMEOUT_MS);
  try {
    const r = await fetch(url, {
      method: "GET",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 FocusBot/1.0" },
    });
    return r.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = (await req.json().catch(() => ({}))) as Body;
    const candidates = buildCandidates(body);
    // Probe in parallel; first OK wins. Search engines almost always respond OK → guaranteed result.
    const results = await Promise.all(candidates.map((u) => probe(u).then((ok) => ({ u, ok }))));
    const best = results.find((r) => r.ok)?.u ?? candidates[candidates.length - 1];
    return new Response(JSON.stringify({ url: best, candidates }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
