import { useMemo } from "react";
import { Clock, Sparkles } from "lucide-react";

type Props = {
  value: number;
  max: number;
  size?: number;
  label?: string;
  title?: string;
  subtitle?: string;
};

/**
 * QuotaGauge — jauge circulaire premium avec dégradé conique animé,
 * anneau interne mat et halo coloré selon le statut.
 */
export function QuotaGauge({ value, max, size = 156, label = "jours", title, subtitle }: Props) {
  const pct = useMemo(() => Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100)), [value, max]);
  const radius = (size - 22) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;

  // Palette par statut
  const status = pct > 50 ? "ok" : pct > 20 ? "warn" : "danger";
  const stroke =
    status === "ok" ? "url(#qg-grad-ok)" :
    status === "warn" ? "url(#qg-grad-warn)" :
    "url(#qg-grad-danger)";

  const glow =
    status === "ok" ? "shadow-[0_0_40px_-12px_rgba(16,185,129,0.55)]" :
    status === "warn" ? "shadow-[0_0_40px_-12px_rgba(245,158,11,0.55)]" :
    "shadow-[0_0_40px_-12px_rgba(244,63,94,0.55)]";

  const numberTone =
    status === "ok" ? "text-emerald-600 dark:text-emerald-400" :
    status === "warn" ? "text-amber-600 dark:text-amber-400" :
    "text-rose-600 dark:text-rose-400";

  return (
    <div className={`relative inline-flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br from-card via-card to-muted/40 p-4 ${glow} border border-border/40`}>
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="qg-grad-ok" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="qg-grad-warn" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="qg-grad-danger" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          {/* Rail */}
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth={12} fill="none" opacity={0.35} />
          {/* Progress */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={stroke}
            strokeWidth={12}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.22,1,.36,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-2">
          <Sparkles className={`w-3.5 h-3.5 mb-0.5 ${numberTone}`} />
          <span
            className={`font-extrabold tracking-tight tabular-nums leading-none ${numberTone}`}
            style={{ fontSize: value >= 1000 ? size * 0.18 : value >= 100 ? size * 0.24 : size * 0.3 }}
          >
            {value}
          </span>
          <span className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground font-semibold mt-1 truncate max-w-full text-center">{label}</span>
        </div>
      </div>

      {(title || subtitle) && (
        <div className="mt-3 text-center max-w-[200px]">
          {title && <p className="text-sm font-semibold leading-tight">{title}</p>}
          {subtitle && (
            <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-1 justify-center">
              <Clock className="w-3 h-3" /> {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
