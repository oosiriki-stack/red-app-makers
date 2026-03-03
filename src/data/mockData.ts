// Mock data for @robase e-reputation platform

export function getTrackingBrand(): string {
  try {
    const raw = localStorage.getItem("arobase_tracking");
    if (raw) {
      const t = JSON.parse(raw);
      if (t.brand) return t.brand;
    }
  } catch {}
  return "Votre Marque";
}

export function getActivePlatforms(): string[] {
  const map: Record<string, string> = { x: "X", facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", tiktok: "TikTok", blog: "Blog", google: "Google" };
  try {
    const raw = localStorage.getItem("arobase_tracking");
    if (raw) {
      const t = JSON.parse(raw);
      return Object.entries(t.platforms || {}).filter(([, v]) => v).map(([k]) => map[k] || k);
    }
  } catch {}
  return Object.values(map);
}

export const mentionsOverTime = [
  { date: "Jan", positive: 120, neutral: 80, negative: 30 },
  { date: "Fév", positive: 150, neutral: 90, negative: 25 },
  { date: "Mar", positive: 180, neutral: 70, negative: 45 },
  { date: "Avr", positive: 140, neutral: 100, negative: 35 },
  { date: "Mai", positive: 200, neutral: 85, negative: 20 },
  { date: "Jun", positive: 220, neutral: 95, negative: 28 },
  { date: "Jul", positive: 190, neutral: 110, negative: 40 },
];

export const reputationScore = 78;

export const stats = {
  totalMentions: 2847,
  sentimentAvg: 72,
  activeAlerts: 5,
  responseRate: 89,
};

export const mentions = [
  { id: 1, source: "X", author: "Marie Dupont", avatar: "MD", content: "Excellente expérience avec @entreprise ! Service client au top 👏", sentiment: "positive" as const, date: "Il y a 2h", engagement: 245 },
  { id: 2, source: "Facebook", author: "Jean Martin", avatar: "JM", content: "Déçu du délai de livraison, plus d'une semaine de retard...", sentiment: "negative" as const, date: "Il y a 3h", engagement: 89 },
  { id: 3, source: "Instagram", author: "Sophie L.", avatar: "SL", content: "Le nouveau produit est intéressant, à voir sur le long terme", sentiment: "neutral" as const, date: "Il y a 4h", engagement: 156 },
  { id: 4, source: "LinkedIn", author: "Pierre Dubois", avatar: "PD", content: "Partenariat très enrichissant avec cette entreprise. Bravo pour l'innovation !", sentiment: "positive" as const, date: "Il y a 5h", engagement: 312 },
  { id: 5, source: "TikTok", author: "Emma_style", avatar: "ES", content: "J'ai testé leur dernier produit... résultat moyen 😐", sentiment: "neutral" as const, date: "Il y a 6h", engagement: 1024 },
  { id: 6, source: "Blog", author: "Tech Review FR", avatar: "TR", content: "Analyse complète : cette entreprise perd du terrain face à la concurrence", sentiment: "negative" as const, date: "Il y a 7h", engagement: 567 },
  { id: 7, source: "X", author: "Lucas R.", avatar: "LR", content: "Le SAV a résolu mon problème en 10 min, impressionnant !", sentiment: "positive" as const, date: "Il y a 8h", engagement: 78 },
  { id: 8, source: "Facebook", author: "Claire B.", avatar: "CB", content: "Quelqu'un a un avis sur le nouveau forfait ? Je suis intéressée.", sentiment: "neutral" as const, date: "Il y a 9h", engagement: 45 },
];

export const alerts = [
  { id: 1, type: "critical" as const, title: "Pic de mentions négatives détecté", description: "Augmentation de 340% des mentions négatives en 2h sur X", time: "Il y a 15 min", read: false },
  { id: 2, type: "warning" as const, title: "Influenceur négatif identifié", description: "@TechCritique (250K abonnés) a publié un avis très négatif", time: "Il y a 1h", read: false },
  { id: 3, type: "critical" as const, title: "Risque de crise — Tendance virale", description: "Un thread négatif cumule 15K partages en 3h", time: "Il y a 2h", read: false },
  { id: 4, type: "info" as const, title: "Nouveau pic d'engagement positif", description: "Votre dernière campagne génère +500 mentions positives", time: "Il y a 4h", read: true },
  { id: 5, type: "warning" as const, title: "Concurrent en progression", description: "ConcurrentB gagne 12% de part de voix ce mois", time: "Il y a 6h", read: true },
];

export function getCompetitors() {
  const brand = getTrackingBrand();
  return [
    { name: brand, mentions: 2847, sentiment: 78, share: 35, trend: "+5%" },
    { name: "ConcurrentA", mentions: 2100, sentiment: 65, share: 26, trend: "+2%" },
    { name: "ConcurrentB", mentions: 1890, sentiment: 72, share: 23, trend: "+12%" },
    { name: "ConcurrentC", mentions: 1200, sentiment: 58, share: 16, trend: "-3%" },
  ];
}

export function getVoiceShare() {
  const brand = getTrackingBrand();
  return [
    { name: brand, value: 35, fill: "hsl(0, 72%, 51%)" },
    { name: "ConcurrentA", value: 26, fill: "hsl(0, 0%, 60%)" },
    { name: "ConcurrentB", value: 23, fill: "hsl(0, 40%, 70%)" },
    { name: "ConcurrentC", value: 16, fill: "hsl(0, 0%, 80%)" },
  ];
}

// Keep static exports for backward compat
export const competitors = getCompetitors();
export const voiceShare = getVoiceShare();

export const influencers = [
  { name: "Marie Influenceuse", platform: "Instagram", followers: "520K", engagement: 4.8, sentiment: "positive" as const },
  { name: "TechCritique", platform: "X", followers: "250K", engagement: 3.2, sentiment: "negative" as const },
  { name: "LifeStylePro", platform: "TikTok", followers: "1.2M", engagement: 6.1, sentiment: "positive" as const },
  { name: "BusinessInsider_FR", platform: "LinkedIn", followers: "180K", engagement: 2.9, sentiment: "neutral" as const },
  { name: "CritiqueConso", platform: "Blog", followers: "95K", engagement: 5.5, sentiment: "negative" as const },
];

export const trendingKeywords = [
  { word: "service client", count: 342, trend: "up" as const },
  { word: "innovation", count: 256, trend: "up" as const },
  { word: "prix", count: 189, trend: "down" as const },
  { word: "qualité", count: 178, trend: "stable" as const },
  { word: "livraison", count: 145, trend: "down" as const },
  { word: "recommande", count: 134, trend: "up" as const },
];

export const aiResponses = [
  { id: 1, mention: "Déçu du délai de livraison...", tone: "empathique", response: "Nous comprenons votre frustration concernant ce retard et nous en sommes sincèrement désolés. Notre équipe logistique travaille activement à résoudre ce problème. Nous vous contactons en message privé pour le suivi de votre commande.", status: "approved" as const, date: "Il y a 1h" },
  { id: 2, mention: "Perte de terrain face à la concurrence", tone: "institutionnel", response: "Merci pour cette analyse détaillée. Nous investissons massivement dans l'innovation avec 3 nouveaux produits prévus ce trimestre. Notre stratégie de développement reste solide et orientée client.", status: "pending" as const, date: "Il y a 3h" },
  { id: 3, mention: "Résultat moyen du dernier produit", tone: "commercial", response: "Merci pour votre retour Emma ! Nous serions ravis de vous faire découvrir notre gamme premium qui pourrait mieux correspondre à vos attentes. DM ouvert pour un code promo exclusif 🎁", status: "draft" as const, date: "Il y a 5h" },
];
