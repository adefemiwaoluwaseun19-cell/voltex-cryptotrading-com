import { Bitcoin, Coins, Hexagon, Sparkles, TrendingUp, Zap } from "lucide-react";

type FloatIcon = {
  Icon: typeof Zap;
  className: string;
  style?: React.CSSProperties;
};

const ICONS: FloatIcon[] = [
  { Icon: Bitcoin, className: "left-[6%] top-[9%] text-brand/25", style: { animationDuration: "9s" } },
  { Icon: Zap, className: "right-[8%] top-[16%] text-accent/25", style: { animationDuration: "11s", animationDelay: "-3s" } },
  { Icon: TrendingUp, className: "left-[12%] top-[38%] text-up/20", style: { animationDuration: "13s", animationDelay: "-6s" } },
  { Icon: Coins, className: "right-[10%] top-[52%] text-brand/20", style: { animationDuration: "10s", animationDelay: "-2s" } },
  { Icon: Hexagon, className: "left-[7%] top-[70%] text-accent/20", style: { animationDuration: "12s", animationDelay: "-8s" } },
  { Icon: Sparkles, className: "right-[14%] top-[82%] text-brand/20", style: { animationDuration: "14s", animationDelay: "-5s" } },
];

/** Decorative drifting icon field. Render inside a relative container. */
export function FloatingIcons() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {ICONS.map(({ Icon, className, style }, i) => (
        <span
          key={i}
          className={`float-drift absolute grid size-9 place-items-center rounded-full border border-border/60 bg-surface/40 backdrop-blur-sm ${className}`}
          style={style}
        >
          <Icon className="size-4" strokeWidth={1.6} />
        </span>
      ))}
      <span className="glow-orb absolute -left-16 top-24 size-48 rounded-full bg-brand/15 blur-3xl" />
      <span
        className="glow-orb absolute -right-20 top-1/2 size-56 rounded-full bg-accent/10 blur-3xl"
        style={{ animationDelay: "-4s" }}
      />
    </div>
  );
}
