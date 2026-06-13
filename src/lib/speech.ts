// Browser Text-to-Speech (gratuit, natif)
let currentUtterance: SpeechSynthesisUtterance | null = null;

export function speak(text: string, opts?: { lang?: string; rate?: number }) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  stopSpeaking();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = opts?.lang ?? "fr-FR";
  u.rate = opts?.rate ?? 1;
  currentUtterance = u;
  window.speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

export function isSpeaking() {
  return typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking;
}

export function summarizeMentions(mentions: Array<{ source: string; sentiment: string; content: string }>, period: string) {
  if (mentions.length === 0) {
    return `Aucune mention détectée ${period}. Tout est calme.`;
  }
  const pos = mentions.filter((m) => m.sentiment === "positive").length;
  const neg = mentions.filter((m) => m.sentiment === "negative").length;
  const sources = [...new Set(mentions.map((m) => m.source))];
  const top = mentions[0];
  return `${period}, vous avez ${mentions.length} mentions, dont ${pos} positives et ${neg} négatives, réparties sur ${sources.length} sources : ${sources.slice(0, 4).join(", ")}. ` +
    `Mention la plus récente : ${top.content.slice(0, 200)}.`;
}
