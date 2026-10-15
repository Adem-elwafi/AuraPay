import { useId, useMemo, useState, type PointerEvent } from "react";
import { useElementWidth } from "../../lib/useElementWidth";
import { formatEUR, formatShortDate } from "../../lib/format";

export interface FlowPoint {
  date: string;
  net: number;
}

export interface FlowChartProps {
  points: FlowPoint[];
}

const H = 240;
const PAD = { top: 16, right: 12, bottom: 28, left: 56 };

/** "Nice" tick step for a 0→max axis with ~3 intervals. */
function niceStep(max: number): number {
  const raw = max / 3;
  const pow = 10 ** Math.floor(Math.log10(raw || 1));
  const candidate = [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= raw);
  return candidate || 50;
}

/**
 * Single-series area chart of the cumulative net flow.
 * One series → no legend (the card title names it). Crosshair + tooltip on hover/touch.
 */
export default function FlowChart({ points }: FlowChartProps) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const gid = `flow-${useId().replace(/:/g, "")}`;

  const { series, x, y, ticks, line, area } = useMemo(() => {
    if (!points || points.length === 0) {
      return {
        series: [],
        x: () => 0,
        y: () => 0,
        ticks: [0, 50, 100],
        line: "",
        area: "",
      };
    }

    let run = 0;
    const series = points.map((p) => ({ ...p, cum: (run += p.net) }));
    const lo = Math.min(0, ...series.map((s) => s.cum));
    const hiRaw = Math.max(10, ...series.map((s) => s.cum));
    const step = niceStep(hiRaw - lo);
    const hi = Math.ceil(hiRaw / step) * step;
    const ticks: number[] = [];
    for (let t = Math.floor(lo / step) * step; t <= hi + 1e-6; t += step) ticks.push(t);

    const innerW = Math.max(10, width - PAD.left - PAD.right);
    const innerH = H - PAD.top - PAD.bottom;
    const x = (i: number) =>
      PAD.left + (series.length <= 1 ? innerW / 2 : (i / (series.length - 1)) * innerW);
    const yRange = hi - ticks[0] || 1;
    const y = (v: number) => PAD.top + (1 - (v - ticks[0]) / yRange) * innerH;

    const line = series
      .map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(s.cum).toFixed(1)}`)
      .join(" ");
    const area = `${line} L${x(series.length - 1)},${y(ticks[0])} L${x(0)},${y(ticks[0])} Z`;

    return { series, x, y, ticks, line, area };
  }, [points, width]);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (series.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const innerW = width - PAD.left - PAD.right;
    const i = Math.round(((px - PAD.left) / innerW) * (series.length - 1));
    setHover(Math.max(0, Math.min(series.length - 1, i)));
  };

  const labelEvery = Math.max(1, Math.ceil(series.length / (width < 520 ? 3 : 6)));
  const h = hover != null && series[hover] ? series[hover] : null;
  const last = series[series.length - 1];

  return (
    <div ref={ref} className="relative w-full min-w-0 select-none" style={{ height: H }}>
      {width > 0 && series.length > 0 && last && (
        <svg
          width={width}
          height={H}
          role="img"
          aria-label={`Flux net cumulé : ${formatEUR(last.cum, { signed: true })} sur ${series.length} jours`}
          onPointerMove={onMove}
          onPointerDown={onMove}
          onPointerLeave={() => setHover(null)}
          className="block touch-pan-y"
        >
          <defs>
            <linearGradient id={gid} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* recessive grid + y labels */}
          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={PAD.left}
                x2={width - PAD.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--line)"
                strokeDasharray={t === 0 ? "" : "3 5"}
              />
              <text
                x={PAD.left - 10}
                y={y(t)}
                dy="0.32em"
                textAnchor="end"
                fontSize="11"
                fill="var(--muted)"
                className="tabular"
              >
                {t.toLocaleString("fr-FR")} €
              </text>
            </g>
          ))}

          {/* x labels */}
          {series.map((s, i) =>
            i % labelEvery === 0 || i === series.length - 1 ? (
              <text
                key={s.date}
                x={x(i)}
                y={H - 8}
                textAnchor={i === 0 ? "start" : i === series.length - 1 ? "end" : "middle"}
                fontSize="11"
                fill="var(--muted)"
              >
                {formatShortDate(s.date)}
              </text>
            ) : null
          )}

          <path d={area} fill={`url(#${gid})`} />
          <path
            d={line}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* end marker */}
          <circle
            cx={x(series.length - 1)}
            cy={y(last.cum)}
            r="5"
            fill="var(--accent)"
            stroke="var(--surface)"
            strokeWidth="2"
          />

          {h && (
            <g pointerEvents="none">
              <line
                x1={x(hover!)}
                x2={x(hover!)}
                y1={PAD.top}
                y2={H - PAD.bottom}
                stroke="var(--line-strong)"
              />
              <circle
                cx={x(hover!)}
                cy={y(h.cum)}
                r="5"
                fill="var(--accent)"
                stroke="var(--surface)"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>
      )}

      {h && width > 0 && (
        <div
          className="pointer-events-none absolute top-2 z-10 min-w-[170px] rounded-xl border border-[var(--line-strong)] bg-[var(--surface)] px-3.5 py-2.5 text-[12px] shadow-xl backdrop-blur text-[var(--text)]"
          style={{
            left: Math.min(Math.max(x(hover!) - 85, 0), width - 175),
          }}
        >
          <p className="font-semibold text-[var(--text)]">{formatShortDate(h.date)}</p>
          <div className="mt-1.5 flex justify-between gap-4 text-[var(--muted)]">
            <span>Flux du jour</span>
            <span className="tabular font-semibold text-[var(--text)]">
              {formatEUR(h.net, { signed: true })}
            </span>
          </div>
          <div className="mt-0.5 flex justify-between gap-4 text-[var(--muted)]">
            <span>Cumul</span>
            <span className="tabular font-semibold text-[var(--accent-text)]">
              {formatEUR(h.cum, { signed: true })}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export { FlowChart };
