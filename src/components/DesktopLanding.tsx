import { Link } from "@tanstack/react-router";
import { Apple, Eye, Globe, Lock, Play, ShieldCheck, Smartphone, Target, TrendingUp, Zap } from "lucide-react";
import logo from "@/assets/voltex-logo.png";
import { CoinBadge } from "./CoinBadge";
import { Sparkline } from "./Sparkline";
import { FloatingIcons } from "./FloatingIcons";
import { AppFooter } from "./AppFooter";
import { formatPct, formatUsd } from "@/lib/market-data";

type Coin = { id: string; name: string; symbol: string; glyph: string; swatch: string; price: number; change: number };
type Row = Coin & { holding: number };

const NAV = [
  { to: "/", label: "Home" },
  { to: "/markets", label: "Markets" },
  { to: "/trade", label: "Trade" },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/about", label: "About" },
] as const;

const FEATURES = [
  { Icon: Smartphone, title: "Mobile-first trading", body: "Buy, sell and track assets anywhere with a fast, intuitive interface." },
  { Icon: Lock, title: "Advanced security", body: "Encrypted sessions, verified accounts and atomic trade settlement." },
  { Icon: TrendingUp, title: "Grow your wealth", body: "Live prices, clear charts and portfolio analytics to guide decisions." },
  { Icon: Globe, title: "Global access", body: "Leading digital assets available around the clock, every day." },
];

export function DesktopLanding({
  balance,
  changePct,
  featured,
  series,
  rows,
}: {
  balance: number | null;
  changePct: number;
  featured: Coin;
  series: number[];
  rows: Row[];
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <FloatingIcons />
      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-8 py-5">
        <Link to="/"><img src={logo} alt="Voltex" className="h-12 w-auto" /></Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }} className="transition-colors hover:text-foreground" activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/profile" className="rounded-full border border-border px-5 py-2 text-sm font-semibold hover:border-brand">Account</Link>
          <Link to="/trade" search={{ coin: "btc", side: "buy" }} className="action-button rounded-full bg-gradient-brand px-5 py-2 text-sm font-bold text-primary-foreground shadow-brand">Start trading</Link>
        </div>
      </header>

      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-2 items-center gap-12 px-8 pb-16 pt-10">
        <div className="animate-fade-in">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-accent">Powering your crypto future</p>
          <h1 className="mt-4 font-display text-6xl font-semibold leading-[1.05] tracking-tight">
            Smarter crypto trading for a <span className="text-brand">brighter future</span>
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Live market prices, instant buy and sell, and a portfolio that tracks every position — all in one secure platform.
          </p>
          <div className="mt-6 flex gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-2"><ShieldCheck className="size-4 text-up" />Secure</span>
            <span className="flex items-center gap-2"><Zap className="size-4 text-accent" />Fast</span>
            <span className="flex items-center gap-2"><Globe className="size-4 text-brand" />Global</span>
          </div>
          <div className="mt-8 flex gap-3">
            <a href="#" className="pressable flex items-center gap-3 rounded-xl border border-border bg-secondary px-5 py-3 hover:border-brand">
              <Apple className="size-7" />
              <span className="leading-tight"><span className="block text-[10px] text-muted-foreground">Download on the</span><span className="text-base font-semibold">App Store</span></span>
            </a>
            <a href="#" className="pressable flex items-center gap-3 rounded-xl border border-border bg-secondary px-5 py-3 hover:border-brand">
              <Play className="size-7 fill-current" />
              <span className="leading-tight"><span className="block text-[10px] text-muted-foreground">Get it on</span><span className="text-base font-semibold">Google Play</span></span>
            </a>
          </div>
        </div>

        <div className="relative flex justify-center">
          <span className="glow-orb absolute inset-10 rounded-full bg-brand/25 blur-3xl" />
          <div className="float-drift relative w-[320px] rounded-[3rem] border-[10px] border-secondary bg-background p-5 shadow-brand" style={{ animationDuration: "10s" }}>
            <div className="mx-auto mb-4 h-5 w-24 rounded-full bg-secondary" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">Total balance</p>
            <p className="num mt-1 font-display text-3xl font-semibold">{balance === null ? "—" : formatUsd(balance)}</p>
            <p className={`num text-xs ${changePct >= 0 ? "text-up" : "text-down"}`}>{formatPct(changePct)} today</p>
            <div className="mt-4 rounded-2xl border border-border bg-gradient-card p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CoinBadge glyph={featured.glyph} swatch={featured.swatch} className="size-7 text-[11px]" />
                  <span className="text-sm font-semibold">{featured.name}</span>
                </div>
                <span className="num text-sm font-semibold">{formatUsd(featured.price)}</span>
              </div>
              <div className="mt-2 h-16"><Sparkline id="desk" values={series} up={featured.change > 0} area className="h-full w-full" /></div>
            </div>
            <div className="mt-3 space-y-2">
              {rows.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl bg-surface px-3 py-2">
                  <div className="flex items-center gap-2"><CoinBadge glyph={c.glyph} swatch={c.swatch} className="size-6 text-[10px]" /><span className="text-xs font-semibold">{c.symbol}</span></div>
                  <span className="num text-xs">{formatUsd(c.holding * c.price)}</span>
                </div>
              ))}
            </div>
            <Link to="/trade" search={{ coin: featured.id, side: "buy" }} className="mt-4 flex h-10 items-center justify-center rounded-xl bg-gradient-brand text-sm font-bold text-primary-foreground">Trade now</Link>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl grid-cols-4 gap-5 px-8">
        {FEATURES.map(({ Icon, title, body }) => (
          <div key={title} className="rounded-2xl border border-border bg-surface/60 p-6 backdrop-blur transition-colors hover:border-brand/60">
            <Icon className="size-6 text-brand" />
            <h3 className="mt-4 font-display font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <section className="relative z-10 mx-auto mt-6 grid max-w-7xl grid-cols-2 gap-5 px-8 pb-12">
        <div className="rounded-2xl border border-border bg-gradient-card p-6">
          <Eye className="size-6 text-accent" />
          <h3 className="mt-3 font-display text-lg font-semibold">Our vision</h3>
          <p className="mt-2 text-sm text-muted-foreground">A world where anyone can access digital assets with confidence, clarity and control.</p>
        </div>
        <div className="rounded-2xl border border-border bg-gradient-card p-6">
          <Target className="size-6 text-accent" />
          <h3 className="mt-3 font-display text-lg font-semibold">Our mission</h3>
          <p className="mt-2 text-sm text-muted-foreground">To deliver secure, transparent and fast crypto trading tools built for everyday investors.</p>
        </div>
      </section>
      <AppFooter />
    </div>
  );
}
