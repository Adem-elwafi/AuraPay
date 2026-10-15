import { useId } from "react";

export interface SparklineProps {
  data: number[];
  height?: number;
  className?: string;
  strokeColor?: string;
}

/** Tiny trend line for KPI tiles. Decorative: the tile states the value in text. */
export default function Sparkline({
  data,
  height = 44,
  className,
  strokeColor = "var(--accent)",
}: SparklineProps) {
  const gid = `spark-${useId().replace(/:/g, "")}`;
  const W = 100;
  const safeData = data.length > 0 ? data : [0, 0];
  const min = Math.min(...safeData);
  const max = Math.max(...safeData);
  const span = max - min || 1;
  const pts = safeData.map((v, i) => [
    (i / Math.max(1, safeData.length - 1)) * W,
    4 + (1 - (v - min) / span) * (height - 8),
  ]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const area = `${line} L${W},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      className={className}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.28" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path
        d={line}
        fill="none"
        stroke={strokeColor}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export { Sparkline };
