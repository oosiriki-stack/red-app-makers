import PptxGenJS from "pptxgenjs";
import type { Mention, ReportPeriod } from "./pdfReport";
import { filterByPeriod } from "./pdfReport";

const PERIOD_LABEL: Record<ReportPeriod, string> = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
  yearly: "Annuel",
};

export function generatePptxReport(opts: {
  brand: string;
  period: ReportPeriod;
  mentions: Mention[];
  alertsCount: number;
  ownerName?: string;
  ownerEmail?: string;
}) {
  const filtered = filterByPeriod(opts.mentions, opts.period);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = `FOCUS · Rapport ${PERIOD_LABEL[opts.period]} · ${opts.brand}`;

  const PRIMARY = "E5A100";
  const DARK = "0F172A";
  const MUTED = "64748B";

  // === Slide 1 : Couverture ===
  const s1 = pptx.addSlide();
  s1.background = { color: DARK };
  s1.addText("FOCUS", { x: 0.6, y: 0.6, w: 4, h: 0.6, color: PRIMARY, fontSize: 28, bold: true, fontFace: "Calibri" });
  s1.addText(`Rapport ${PERIOD_LABEL[opts.period]}`, { x: 0.6, y: 2.5, w: 12, h: 1, color: "FFFFFF", fontSize: 44, bold: true });
  s1.addText(opts.brand || "Surveillance", { x: 0.6, y: 3.6, w: 12, h: 0.8, color: PRIMARY, fontSize: 28 });
  s1.addText(
    `Généré le ${new Date().toLocaleDateString("fr-FR")} · ${opts.ownerName || ""} ${opts.ownerEmail ? `· ${opts.ownerEmail}` : ""}`,
    { x: 0.6, y: 6.5, w: 12, h: 0.4, color: "94A3B8", fontSize: 14 }
  );

  // === Slide 2 : KPIs ===
  const total = filtered.length;
  const pos = filtered.filter((m) => m.sentiment === "positive").length;
  const neg = filtered.filter((m) => m.sentiment === "negative").length;
  const neu = filtered.filter((m) => m.sentiment === "neutral").length;
  const score = total > 0 ? Math.round(((pos - neg) / total) * 50 + 50) : 0;

  const s2 = pptx.addSlide();
  s2.addText("Vue d'ensemble", { x: 0.5, y: 0.4, w: 12, h: 0.6, fontSize: 28, bold: true, color: DARK });
  const kpis = [
    { label: "Mentions totales", value: String(total), color: PRIMARY },
    { label: "Score réputation", value: `${score}/100`, color: score >= 60 ? "16A34A" : score >= 40 ? "EAB308" : "DC2626" },
    { label: "Positives", value: String(pos), color: "16A34A" },
    { label: "Négatives", value: String(neg), color: "DC2626" },
    { label: "Neutres", value: String(neu), color: "64748B" },
    { label: "Alertes non lues", value: String(opts.alertsCount), color: "F59E0B" },
  ];
  kpis.forEach((k, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    s2.addShape("roundRect", { x: 0.5 + col * 4.2, y: 1.4 + row * 2.4, w: 4, h: 2.1, fill: { color: "F8FAFC" }, line: { color: "E2E8F0", width: 1 }, rectRadius: 0.15 });
    s2.addText(k.value, { x: 0.5 + col * 4.2, y: 1.6 + row * 2.4, w: 4, h: 1, fontSize: 36, bold: true, color: k.color, align: "center" });
    s2.addText(k.label, { x: 0.5 + col * 4.2, y: 2.7 + row * 2.4, w: 4, h: 0.6, fontSize: 14, color: MUTED, align: "center" });
  });

  // === Slide 3 : Répartition sentiments (chart) ===
  const s3 = pptx.addSlide();
  s3.addText("Répartition des sentiments", { x: 0.5, y: 0.4, w: 12, h: 0.6, fontSize: 28, bold: true, color: DARK });
  s3.addChart(pptx.ChartType.doughnut, [{
    name: "Sentiments",
    labels: ["Positives", "Négatives", "Neutres"],
    values: [pos, neg, neu],
  }], { x: 1, y: 1.4, w: 11, h: 5.5, chartColors: ["16A34A", "DC2626", "94A3B8"], showLegend: true, legendPos: "r", showPercent: true });

  // === Slide 4 : Top sources ===
  const sourcesMap: Record<string, number> = {};
  filtered.forEach((m) => { sourcesMap[m.source || "autre"] = (sourcesMap[m.source || "autre"] || 0) + 1; });
  const sources = Object.entries(sourcesMap).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const s4 = pptx.addSlide();
  s4.addText("Top sources", { x: 0.5, y: 0.4, w: 12, h: 0.6, fontSize: 28, bold: true, color: DARK });
  if (sources.length) {
    s4.addChart(pptx.ChartType.bar, [{ name: "Mentions", labels: sources.map((s) => s[0]), values: sources.map((s) => s[1]) }],
      { x: 0.8, y: 1.4, w: 11.5, h: 5.5, chartColors: [PRIMARY], showLegend: false, barDir: "bar" });
  } else {
    s4.addText("Aucune source détectée sur la période.", { x: 0.5, y: 3, w: 12, h: 1, fontSize: 16, color: MUTED, align: "center" });
  }

  // === Slide 5 : Mentions à fort impact ===
  const s5 = pptx.addSlide();
  s5.addText("Mentions à fort impact", { x: 0.5, y: 0.4, w: 12, h: 0.6, fontSize: 28, bold: true, color: DARK });
  const top = [...filtered]
    .sort((a: any, b: any) => (b.impact_score || 0) - (a.impact_score || 0))
    .slice(0, 8);
  if (top.length === 0) {
    s5.addText("Aucune mention sur la période.", { x: 0.5, y: 3, w: 12, h: 1, fontSize: 16, color: MUTED, align: "center" });
  } else {
    const rows: any[] = [[
      { text: "Source", options: { bold: true, color: "FFFFFF", fill: { color: DARK } } },
      { text: "Auteur", options: { bold: true, color: "FFFFFF", fill: { color: DARK } } },
      { text: "Extrait", options: { bold: true, color: "FFFFFF", fill: { color: DARK } } },
      { text: "Sentiment", options: { bold: true, color: "FFFFFF", fill: { color: DARK } } },
      { text: "Impact", options: { bold: true, color: "FFFFFF", fill: { color: DARK } } },
    ]];
    top.forEach((m: any) => {
      rows.push([
        { text: m.source || "—" },
        { text: (m.author || "—").slice(0, 22) },
        { text: (m.content || "").slice(0, 90) + (((m.content || "").length > 90) ? "…" : "") },
        { text: m.sentiment === "positive" ? "✅ Positif" : m.sentiment === "negative" ? "🚨 Négatif" : "Neutre" },
        { text: `${m.impact_score || 0}/100`, options: { bold: true, color: PRIMARY } },
      ]);
    });
    s5.addTable(rows, { x: 0.4, y: 1.3, w: 12.5, fontSize: 11, border: { type: "solid", color: "E2E8F0", pt: 0.5 }, colW: [1.4, 2, 5.5, 2, 1.6] });
  }

  // === Slide 6 : Recommandations ===
  const s6 = pptx.addSlide();
  s6.addText("Recommandations FOCUS GPT", { x: 0.5, y: 0.4, w: 12, h: 0.6, fontSize: 28, bold: true, color: DARK });
  const recos: string[] = [];
  if (neg > pos) recos.push("• Pic négatif : déclencher le protocole de gestion de crise et publier une communication officielle sous 4h.");
  if (sources.length) recos.push(`• Concentrez l'effort de modération sur les sources prioritaires : ${sources.slice(0, 3).map((s) => s[0]).join(", ")}.`);
  if (score < 50) recos.push("• Score de réputation en zone d'alerte : lancez une campagne de réponses aux avis positifs pour rééquilibrer.");
  if (score >= 75) recos.push("• Excellente dynamique : capitalisez avec une campagne de témoignages et de cas clients.");
  if (top.length) recos.push("• Répondez en priorité aux mentions à fort impact ci-dessus pour réduire le TTR (< 15 min).");
  if (recos.length === 0) recos.push("• Aucune action critique. Maintenez la cadence de surveillance.");
  s6.addText(recos.map((r) => ({ text: r, options: { breakLine: true, color: DARK, fontSize: 18 } })) as any, { x: 0.8, y: 1.4, w: 12, h: 5.5, valign: "top" });

  pptx.writeFile({ fileName: `focus-rapport-${opts.period}-${new Date().toISOString().slice(0, 10)}.pptx` });
}
