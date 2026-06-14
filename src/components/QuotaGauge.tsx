import { useMemo } from "react";

type Props = { value: number; max: number; size?: number; label?: string };

export function QuotaGauge({ value, max, size = 120, label = "jours" }: Props) {
  const pct = useMemo(() => Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100)), [value, max]);
  const radius = (size - 16) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (pct / 100) * circ;
  // Color shifts: green > 50%, amber 20-50%, red < 20%
  const stroke = pct > 50 ? "hsl(142 71% 45%)" : pct > 20 ? "hsl(38 92% 50%)" : "hsl(0 84% 60%)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="hsl(var(--muted))" strokeWidth={10} fill="none" opacity={0.35} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={stroke}
          strokeWidth={10}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 700ms ease, stroke 400ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tracking-tight tabular-nums">{value}</span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</span>
      </div>
    </div>
  );
}
