import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface ReputationGaugeProps {
  score: number;
  size?: number;
}

export function ReputationGauge({ score, size = 160 }: ReputationGaugeProps) {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useMotionValue(0);
  const strokeDashoffset = useTransform(progress, (v) => circumference - (v / 100) * circumference);
  const displayScore = useMotionValue(0);

  useEffect(() => {
    const controls = animate(progress, score, { duration: 1.5, ease: "easeOut" });
    const controls2 = animate(displayScore, score, { duration: 1.5, ease: "easeOut" });
    return () => { controls.stop(); controls2.stop(); };
  }, [score]);

  const getColor = (s: number) => {
    if (s >= 70) return "hsl(142, 71%, 45%)";
    if (s >= 40) return "hsl(38, 92%, 50%)";
    return "hsl(0, 84%, 60%)";
  };

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth="10"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          style={{ strokeDashoffset }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="text-3xl font-bold">{displayScore}</motion.span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
}
