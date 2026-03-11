import { useMemo } from "react";

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}

export function CalorieRing({
  consumed,
  goal,
  size = 180,
  strokeWidth = 14,
}: CalorieRingProps) {
  const { progress, ringClass, strokeColor, textColor } = useMemo(() => {
    const pct = Math.min(consumed / goal, 1.1);
    const isWarn = pct >= 0.8 && pct < 1;
    const isOver = pct >= 1;

    return {
      progress: pct,
      ringClass: isOver
        ? "ring-glow-over"
        : isWarn
          ? "ring-glow-warn"
          : "ring-glow",
      strokeColor: isOver
        ? "oklch(0.63 0.22 25)"
        : isWarn
          ? "oklch(0.75 0.20 45)"
          : "oklch(0.78 0.19 65)",
      textColor: isOver
        ? "text-destructive"
        : isWarn
          ? "text-[oklch(0.75_0.20_45)]"
          : "text-primary",
    };
  }, [consumed, goal]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(progress, 1));
  const center = size / 2;

  const remaining = goal - consumed;

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className={`-rotate-90 ${ringClass}`}
        style={{ position: "absolute", inset: 0 }}
        role="img"
        aria-label={`Calorie progress: ${consumed} of ${goal} kcal`}
      >
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="oklch(0.22 0.015 55)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{
            transition:
              "stroke-dashoffset 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
        />
      </svg>

      {/* Inner content */}
      <div className="flex flex-col items-center justify-center z-10">
        <span
          className={`text-3xl font-bold font-display tracking-tight ${textColor}`}
        >
          {consumed.toLocaleString()}
        </span>
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
          kcal
        </span>
        <div className="mt-1 text-xs text-muted-foreground">
          {remaining > 0 ? (
            <span>{remaining.toLocaleString()} left</span>
          ) : (
            <span className="text-destructive font-medium">Goal reached!</span>
          )}
        </div>
      </div>
    </div>
  );
}
