import * as XLSX from "xlsx";
import type { Mention, ReportPeriod } from "./pdfReport";

const PERIOD_LABEL: Record<ReportPeriod, string> = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
  yearly: "Annuel",
};

export type ExcelReportParams = {
  brand: string;
  period: ReportPeriod;
  mentions: Mention[];
  alertsCount: number;
  ownerName?: string | null;
  ownerEmail?: string | null;
  person?: string | null;
  country?: string | null;
  city?: string | null;
  commune?: string | null;
};

export function generateExcelReport(p: ExcelReportParams): XLSX.WorkBook {
  const wb = XLSX.utils.book_new();

  // Summary sheet
  const pos = p.mentions.filter((m) => m.sentiment === "positive").length;
  const neu = p.mentions.filter((m) => m.sentiment === "neutral").length;
  const neg = p.mentions.filter((m) => m.sentiment === "negative").length;
  const sources = Array.from(new Set(p.mentions.map((m) => m.source)));
  const engagement = p.mentions.reduce((s, m) => s + (m.engagement || 0), 0);

  const summary = [
    ["FOCUS · Rapport e-Réputation"],
    [`Période`, PERIOD_LABEL[p.period]],
    [`Marque`, p.brand || "—"],
    [`Personne suivie`, p.person || "—"],
    [`Zone`, [p.country, p.city, p.commune].filter(Boolean).join(" · ") || "—"],
    [`Propriétaire`, `${p.ownerName || ""} ${p.ownerEmail ? `<${p.ownerEmail}>` : ""}`.trim() || "—"],
    [`Généré le`, new Date().toLocaleString("fr-FR")],
    [],
    ["Indicateurs clés"],
    ["Total mentions", p.mentions.length],
    ["Alertes non lues", p.alertsCount],
    ["Engagement total", engagement],
    ["Sources actives", sources.length],
    [],
    ["Répartition sentiment"],
    ["Positif", pos],
    ["Neutre", neu],
    ["Négatif", neg],
  ];
  const wsSum = XLSX.utils.aoa_to_sheet(summary);
  wsSum["!cols"] = [{ wch: 22 }, { wch: 50 }];
  XLSX.utils.book_append_sheet(wb, wsSum, "Synthèse");

  // Mentions sheet
  const rows = p.mentions.map((m) => ({
    Date: new Date(m.mention_date).toLocaleString("fr-FR"),
    Source: m.source,
    Auteur: m.author,
    Sentiment: m.sentiment,
    Engagement: m.engagement ?? 0,
    Contenu: m.content,
    URL: m.source_url || "",
  }));
  const wsMent = XLSX.utils.json_to_sheet(rows, { header: ["Date", "Source", "Auteur", "Sentiment", "Engagement", "Contenu", "URL"] });
  wsMent["!cols"] = [{ wch: 20 }, { wch: 14 }, { wch: 22 }, { wch: 12 }, { wch: 12 }, { wch: 70 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, wsMent, "Mentions");

  // Sources sheet
  const bySource = sources.map((s) => {
    const items = p.mentions.filter((m) => m.source === s);
    return {
      Source: s,
      Mentions: items.length,
      Positif: items.filter((i) => i.sentiment === "positive").length,
      Neutre: items.filter((i) => i.sentiment === "neutral").length,
      Négatif: items.filter((i) => i.sentiment === "negative").length,
      Engagement: items.reduce((a, i) => a + (i.engagement || 0), 0),
    };
  }).sort((a, b) => b.Mentions - a.Mentions);
  const wsSrc = XLSX.utils.json_to_sheet(bySource);
  wsSrc["!cols"] = [{ wch: 18 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }];
  XLSX.utils.book_append_sheet(wb, wsSrc, "Par source");

  return wb;
}

export function downloadExcel(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}
