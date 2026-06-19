// Détection d'anomalies réputationnelles (cron 15 min)
// Calcule pour chaque utilisateur le volume de mentions négatives sur 1h,
// le compare à la moyenne 7j, et déclenche une alerte critique en cas de pic.
// Calcule aussi un risk_score 0-100 stocké dans anomaly_baselines.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const svc = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const admin = createClient(url, svc);

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: settings } = await admin.from("monitoring_settings").select("user_id, brand");
    const list = settings || [];
    const results: any[] = [];

    for (const s of list) {
      const userId = s.user_id;
      // fenêtre 1h
      const { data: recent } = await admin
        .from("mentions")
        .select("sentiment")
        .eq("user_id", userId)
        .gte("mention_date", oneHourAgo);
      const recentTotal = recent?.length || 0;
      const recentNeg = (recent || []).filter((m: any) => m.sentiment === "negative").length;

      // baseline 7j (par heure)
      const { data: week } = await admin
        .from("mentions")
        .select("sentiment")
        .eq("user_id", userId)
        .gte("mention_date", sevenDaysAgo);
      const weekNeg = (week || []).filter((m: any) => m.sentiment === "negative").length;
      const baselinePerHour = weekNeg / (7 * 24);
      const stddev = Math.max(1, Math.sqrt(baselinePerHour));
      const zscore = baselinePerHour > 0 ? (recentNeg - baselinePerHour) / stddev : (recentNeg >= 3 ? 4 : 0);

      // risk score 0-100
      const negRatio = recentTotal > 0 ? recentNeg / recentTotal : 0;
      const volumeFactor = Math.min(1, recentNeg / 10);
      const zFactor = Math.min(1, Math.max(0, zscore) / 5);
      const risk = Math.round(((negRatio * 0.4) + (volumeFactor * 0.3) + (zFactor * 0.3)) * 100);

      await admin.from("anomaly_baselines").insert({
        user_id: userId,
        window_start: oneHourAgo,
        negative_count: recentNeg,
        total_count: recentTotal,
        risk_score: risk,
      });

      // Alerte critique si pic
      if (zscore >= 3 && recentNeg >= 3) {
        await admin.from("alerts").insert({
          user_id: userId,
          type: "critical",
          title: "🚨 Pic anormal de mentions négatives",
          description: `${recentNeg} mentions négatives sur la dernière heure (baseline: ${baselinePerHour.toFixed(1)}/h). Score de risque: ${risk}/100.`,
          query: s.brand || "",
          platform: "tous canaux",
        });
      } else if (risk >= 60) {
        await admin.from("alerts").insert({
          user_id: userId,
          type: "warning",
          title: "⚠️ Risque réputationnel élevé",
          description: `Score de risque actuel: ${risk}/100 (${recentNeg} négatives / ${recentTotal} mentions sur 1h).`,
          query: s.brand || "",
          platform: "tous canaux",
        });
      }

      results.push({ user: userId, risk, recentNeg, recentTotal });
    }

    return new Response(JSON.stringify({ ok: true, scanned: list.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
