// Alertes sonores via Web Audio API (pas d'asset nécessaire)
let ctx: AudioContext | null = null;

function getCtx() {
  if (typeof window === "undefined") return null;
  if (!ctx) ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
  return ctx;
}

type Severity = "info" | "warning" | "critical";

const PROFILES: Record<Severity, { freq: number[]; duration: number; type: OscillatorType }> = {
  info: { freq: [660], duration: 0.15, type: "sine" },
  warning: { freq: [880, 660], duration: 0.2, type: "triangle" },
  critical: { freq: [1000, 600, 1000, 600], duration: 0.15, type: "square" },
};

export function playAlertSound(severity: Severity = "info") {
  const c = getCtx();
  if (!c) return;
  if (c.state === "suspended") c.resume().catch(() => {});
  const p = PROFILES[severity] ?? PROFILES.info;
  let t = c.currentTime;
  p.freq.forEach((f) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = p.type;
    osc.frequency.value = f;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + p.duration);
    osc.connect(gain).connect(c.destination);
    osc.start(t);
    osc.stop(t + p.duration);
    t += p.duration + 0.05;
  });
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem("focus_sound_enabled", String(enabled));
}
export function isSoundEnabled() {
  return localStorage.getItem("focus_sound_enabled") !== "false";
}
