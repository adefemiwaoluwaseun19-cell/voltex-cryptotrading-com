import { ShieldCheck, Zap } from "lucide-react";

const TICKER_ITEMS = [
  "Live prices every 20s",
  "0.40% flat trading fee",
  "8 assets tracked",
  "Instant buy & sell",
  "Bank-grade security",
  "Portfolio analytics",
];

/** Slim footer strip with a scrolling marquee, sits above the bottom nav. */
export function AppFooter() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <footer className="relative z-10 mt-8 border-t border-border/60 bg-surface/30">
      <div className="ticker-mask overflow-hidden py-2.5">
        <div className="ticker-track flex w-max items-center gap-8 pr-8">
          {items.map((label, i) => (
            <span
              key={i}
              className="flex items-center gap-2 text-[11px] font-medium text-muted-foreground"
            >
              <Zap className="size-3 text-accent/70" strokeWidth={2} />
              {label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-1.5 border-t border-border/40 py-2 text-[10px] text-muted-foreground/70">
        <ShieldCheck className="size-3 text-up/70" strokeWidth={2} />
        Voltex — demo trading experience. Not financial advice.
      </div>
    </footer>
  );
}
