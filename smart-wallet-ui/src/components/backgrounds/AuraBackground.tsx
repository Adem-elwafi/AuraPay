import { cn } from "../../lib/cn";

export type AuraVariant = "landing" | "auth" | "app";

export interface AuraBackgroundProps {
  variant?: AuraVariant;
  className?: string;
}

/**
 * Atmosphere (auras + concentric orbits) for Landing, Auth and App layouts.
 * - variant="landing": top-centered orbital network with broad ambient radiance.
 * - variant="auth": left-biased orbital network suited for split login layouts.
 * - variant="app": calm, subtle ambient glow without rotating rings.
 */
export default function AuraBackground({ variant = "app", className }: AuraBackgroundProps) {
  const isAuth = variant === "auth";
  const isLanding = variant === "landing";
  const showOrbits = isAuth || isLanding;

  const radial1 = isAuth
    ? "radial-gradient(65% 55% at 30% 25%, rgba(16, 185, 129, 0.12), transparent 70%)"
    : isLanding
    ? "radial-gradient(75% 55% at 50% 15%, var(--aura-1), transparent 70%)"
    : "radial-gradient(70% 40% at 50% -5%, rgba(16, 185, 129, 0.08), transparent 70%)";

  return (
    <div aria-hidden className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)}>
      <div
        className="absolute inset-0"
        style={{
          background: [
            radial1,
            "radial-gradient(45% 40% at 90% 85%, rgba(52, 211, 153, 0.06), transparent 70%)",
            "radial-gradient(35% 35% at 10% 75%, rgba(16, 185, 129, 0.05), transparent 60%)",
            "linear-gradient(180deg, var(--bg-2) 0%, var(--bg) 50%, var(--bg) 100%)",
          ].join(", "),
        }}
      />
      {showOrbits && <Orbits align={isLanding ? "center" : "left"} />}
      {/* film grain */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

function Orbits({ align = "left" }: { align?: "left" | "center" }) {
  const rings = [
    { size: 420, dashed: false, dots: [35, 215], cls: "sw-orbit" },
    { size: 660, dashed: true, dots: [120, 300], cls: "sw-orbit-r" },
    { size: 920, dashed: false, dots: [70, 250], cls: "sw-orbit" },
    { size: 1200, dashed: true, dots: [160], cls: "sw-orbit-r" },
  ];

  const positionClass =
    align === "center"
      ? "left-1/2 top-[40%]"
      : "left-[25%] top-1/2";

  return (
    <div
      className={cn(
        "absolute h-[1200px] w-[1200px] -translate-x-1/2 -translate-y-1/2 opacity-35 [mask-image:radial-gradient(circle,black_40%,transparent_70%)]",
        positionClass
      )}
    >
      {rings.map(({ size, dashed, dots, cls }) => (
        <div
          key={size}
          className={cn(
            "absolute left-1/2 top-1/2 rounded-full border border-emerald-600/20",
            dashed && "border-dashed",
            cls
          )}
          style={{ width: size, height: size, transform: "translate(-50%,-50%)" }}
        >
          {dots.map((deg) => (
            <span
              key={deg}
              className="absolute left-1/2 top-1/2 h-0 w-0"
              style={{ transform: `rotate(${deg}deg) translateX(${size / 2}px)` }}
            >
              <span className="sw-glow absolute -left-1 -top-1 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_12px_2px_rgba(16,185,129,0.5)]" />
            </span>
          ))}
        </div>
      ))}
    </div>
  );
}

export { AuraBackground };
