// Sonneries élégantes type Apple via Web Audio API (carillon sin doux, attaque lente)
let ctx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

type Severity = "info" | "warning" | "critical";

// Notes harmoniques inspirées des chimes Apple (Tri-tone)
const PROFILES: Record<Severity, { notes: number[]; gap: number; peak: number; release: number }> = {
  info:     { notes: [880.00, 1318.51],                        gap: 0.10, peak: 0.10, release: 0.55 }, // A5 → E6
  warning:  { notes: [987.77, 1318.51, 1567.98],               gap: 0.08, peak: 0.12, release: 0.60 }, // B5 → E6 → G6
  critical: { notes: [1318.51, 987.77, 1567.98, 1046.50],      gap: 0.07, peak: 0.14, release: 0.50 }, // alarme délicate
};

export function playAlertSound(severity: Severity = "info") {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const p = PROFILES[severity] ?? PROFILES.info;
  let t = c.currentTime + 0.02;

  p.notes.forEach((f) => {
    // Note principale (sinusoïdale douce)
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(p.peak, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + p.release);

    // Harmonique légère (1 octave au-dessus) pour le côté cristallin
    const harm = c.createOscillator();
    const harmGain = c.createGain();
    harm.type = "sine";
    harm.frequency.value = f * 2;
    harmGain.gain.setValueAtTime(0, t);
    harmGain.gain.linearRampToValueAtTime(p.peak * 0.25, t + 0.04);
    harmGain.gain.exponentialRampToValueAtTime(0.0001, t + p.release * 0.8);

    osc.connect(gain).connect(c.destination);
    harm.connect(harmGain).connect(c.destination);
    osc.start(t); harm.start(t);
    osc.stop(t + p.release + 0.05);
    harm.stop(t + p.release + 0.05);

    t += p.gap;
  });
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem("focus_sound_enabled", String(enabled));
}
export function isSoundEnabled() {
  return localStorage.getItem("focus_sound_enabled") !== "false";
}
