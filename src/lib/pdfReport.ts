import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type Mention = {
  id: string;
  source: string;
  author: string;
  content: string;
  sentiment: string;
  engagement: number | null;
  mention_date: string;
  source_url?: string | null;
};

export type ReportPeriod = "daily" | "weekly" | "monthly" | "yearly";

const PERIOD_LABEL: Record<ReportPeriod, string> = {
  daily: "Quotidien",
  weekly: "Hebdomadaire",
  monthly: "Mensuel",
  yearly: "Annuel",
};

export function filterByPeriod<T extends { mention_date: string }>(items: T[], period: ReportPeriod): T[] {
  const now = Date.now();
  const ms: Record<ReportPeriod, number> = {
    daily: 24 * 3600 * 1000,
    weekly: 7 * 24 * 3600 * 1000,
    monthly: 30 * 24 * 3600 * 1000,
    yearly: 365 * 24 * 3600 * 1000,
  };
  return items.filter((m) => now - new Date(m.mention_date).getTime() <= ms[period]);
}

function drawHeader(doc: jsPDF, brand: string, period: ReportPeriod) {
  doc.setFillColor(229, 161, 0);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("FOCUS · Rapport e-Réputation", 14, 14);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`${PERIOD_LABEL[period]} · ${brand || "Sans marque"} · ${new Date().toLocaleString("fr-FR")}`, 14, 22);
  doc.setTextColor(20, 20, 20);
}

function drawSentimentChart(doc: jsPDF, x: number, y: number, w: number, h: number, counts: { positive: number; neutral: number; negative: number }) {
  const total = counts.positive + counts.neutral + counts.negative || 1;
  const segments: Array<{ label: string; value: number; r: number; g: number; b: number }> = [
    { label: "Positif", value: counts.positive, r: 34, g: 197, b: 94 },
    { label: "Neutre", value: counts.neutral, r: 148, g: 163, b: 184 },
    { label: "Négatif", value: counts.negative, r: 239, g: 68, b: 68 },
  ];

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Répartition des sentiments", x, y);

  let cursorX = x;
  const segY = y + 4;
  segments.forEach((s) => {
    const segW = (s.value / total) * w;
    doc.setFillColor(s.r, s.g, s.b);
    doc.rect(cursorX, segY, segW, h, "F");
    cursorX += segW;
  });

  const legendY = segY + h + 8;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  segments.forEach((s, i) => {
    const cx = x + i * (w / 3);
    doc.setFillColor(s.r, s.g, s.b);
    doc.rect(cx, legendY - 3, 4, 4, "F");
    doc.text(`${s.label}: ${s.value} (${Math.round((s.value / total) * 100)}%)`, cx + 6, legendY);
  });
}

function drawSourceChart(doc: jsPDF, x: number, y: number, w: number, sources: Record<string, number>) {
  const entries = Object.entries(sources).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(...entries.map((e) => e[1]), 1);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Top sources", x, y);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  entries.forEach(([src, count], i) => {
    const rowY = y + 8 + i * 8;
    const barW = (count / max) * (w - 60);
    doc.setFillColor(229, 161, 0);
    doc.rect(x + 40, rowY - 4, barW, 5, "F");
    doc.text(src, x, rowY);
    doc.text(String(count), x + 40 + barW + 2, rowY);
  });
}

export function generatePdfReport(opts: {
  brand: string;
  period: ReportPeriod;
  mentions: Mention[];
  alertsCount: number;
  person?: string;
  country?: string;
  city?: string;
  commune?: string;
  ownerName?: string;
  ownerEmail?: string;
}): jsPDF {
  const { brand, period, mentions, alertsCount, person, country, city, commune, ownerName, ownerEmail } = opts;
  const doc = new jsPDF();
  drawHeader(doc, brand, period);

  const positive = mentions.filter((m) => m.sentiment === "positive").length;
  const negative = mentions.filter((m) => m.sentiment === "negative").length;
  const neutral = mentions.filter((m) => m.sentiment === "neutral").length;
  const total = mentions.length;
  const score = total > 0 ? Math.round(((positive - negative) / total) * 50 + 50) : 0;
  const avgEngagement = total > 0 ? Math.round(mentions.reduce((s, m) => s + (m.engagement || 0), 0) / total) : 0;
  const topAuthor = (() => {
    const c: Record<string, number> = {};
    mentions.forEach((m) => { if (m.author) c[m.author] = (c[m.author] || 0) + 1; });
    const e = Object.entries(c).sort((a, b) => b[1] - a[1])[0];
    return e ? `${e[0]} (${e[1]})` : "—";
  })();

  // Identité / contexte
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Contexte de surveillance", 14, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const locParts = [commune, city, country].filter(Boolean).join(", ") || "Non renseigné";
  doc.text(`Marque : ${brand || "—"}`, 14, 45);
  doc.text(`Personne suivie : ${person || "—"}`, 110, 45);
  doc.text(`Localisation : ${locParts}`, 14, 51);
  doc.text(`Titulaire : ${ownerName || "—"}${ownerEmail ? " · " + ownerEmail : ""}`, 110, 51);

  // KPI blocks
  const kpis = [
    { label: "Score e-Réputation", value: `${score}/100` },
    { label: "Mentions totales", value: String(total) },
    { label: "Alertes actives", value: String(alertsCount) },
    { label: "Engagement moyen", value: String(avgEngagement) },
  ];
  kpis.forEach((k, i) => {
    const x = 14 + i * 46;
    doc.setDrawColor(229, 161, 0);
    doc.setFillColor(252, 247, 235);
    doc.roundedRect(x, 58, 42, 18, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(20, 20, 20);
    doc.text(k.value, x + 3, 67);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(110);
    doc.text(k.label, x + 3, 72);
  });
  doc.setTextColor(20);

  // Charts
  drawSentimentChart(doc, 14, 90, 180, 8, { positive, neutral, negative });
  const sourceCounts: Record<string, number> = {};
  mentions.forEach((m) => { sourceCounts[m.source] = (sourceCounts[m.source] || 0) + 1; });
  drawSourceChart(doc, 14, 125, 180, sourceCounts);

  // Top auteur
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Auteur le plus actif : `, 14, 185);
  doc.setFont("helvetica", "normal");
  doc.text(topAuthor, 60, 185);

  // Mentions table
  autoTable(doc, {
    startY: 192,
    head: [["Date & Heure", "Plateforme", "Auteur", "Sentiment", "Extrait", "Lien"]],
    body: mentions.slice(0, 25).map((m) => [
      new Date(m.mention_date).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }),
      m.source,
      (m.author || "—").slice(0, 18),
      m.sentiment,
      (m.content || "").slice(0, 60),
      m.source_url ? "Voir" : "—",
    ]),
    styles: { fontSize: 7.5, cellPadding: 1.8 },
    headStyles: { fillColor: [229, 161, 0], textColor: 255 },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    margin: { left: 14, right: 14 },
    didDrawCell: (data) => {
      if (data.section === "body" && data.column.index === 5) {
        const m = mentions[data.row.index];
        if (m?.source_url) {
          doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: m.source_url });
        }
      }
    },
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(229, 161, 0);
    doc.line(14, 285, 196, 285);
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(`Focus · Rapport ${PERIOD_LABEL[period]} · ${brand || "—"} · ${locParts}`, 14, 290);
    doc.text(`Page ${i}/${pageCount} · Généré le ${new Date().toLocaleString("fr-FR")}`, 140, 290);
  }

  return doc;
}

export function generatePaymentReceipt(opts: {
  payerName: string;
  payerEmail: string;
  plan: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  validatedAt: string;
  expiresAt: string;
}): jsPDF {
  const doc = new jsPDF();
  doc.setFillColor(229, 161, 0);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("REÇU DE PAIEMENT", 14, 16);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Focus · Plateforme e-Réputation", 14, 25);

  doc.setTextColor(20);
  doc.setFontSize(11);
  let y = 50;
  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold"); doc.text(label, 14, y);
    doc.setFont("helvetica", "normal"); doc.text(value, 80, y);
    y += 9;
  };
  row("N° de transaction", opts.transactionId);
  row("Date de validation", new Date(opts.validatedAt).toLocaleString("fr-FR"));
  row("Client", opts.payerName);
  row("Email", opts.payerEmail);
  row("Plan", opts.plan.toUpperCase());
  row("Moyen de paiement", opts.paymentMethod);
  row("Montant", `${opts.amount.toLocaleString("fr-FR")} FCFA`);
  row("Valable jusqu'au", new Date(opts.expiresAt).toLocaleDateString("fr-FR"));

  doc.setDrawColor(229, 161, 0);
  doc.line(14, y + 4, 196, y + 4);
  y += 14;
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text("Merci pour votre confiance.", 14, y);
  doc.text("Ce reçu est généré électroniquement et fait foi de paiement.", 14, y + 5);
  doc.text("Support : rpepperco@gmail.com · +225 0759690001", 14, y + 10);

  return doc;
}
