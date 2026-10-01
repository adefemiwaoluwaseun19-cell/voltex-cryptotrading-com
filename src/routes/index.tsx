import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ArrowUpRight, ChartNoAxesCombined, CircleCheck, LockKeyhole, Menu, ShieldCheck, Wallet, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CoinBadge } from "@/components/CoinBadge";
import { formatPct, formatUsd } from "@/lib/market-data";
import { useLiveCoins } from "@/lib/use-live-prices";
import logo from "@/assets/voltex-logo.png";
import hero from "@/assets/voltex-landing.jpg";

const TITLE = "Voltex — Crypto trading with clarity";
const DESCRIPTION = "Discover Voltex: follow live crypto markets, buy and sell digital assets, and see your portfolio in one place. Explore the platform before creating an account.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www-voltex-crypto-com.lovable.app/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://www-voltex-crypto-com.lovable.app/" }],
  }),
  component: LandingPage,
});

const capabilities = [
  { icon: ChartNoAxesCombined, index: "01", title: "See the market clearly", body: "Follow major digital assets with live quotes, 24-hour movement and price charts in one focused view." },
  { icon: ArrowUpRight, index: "02", title: "Trade with the full picture", body: "Choose an asset, enter an amount and review the price, fee and estimated total before confirming." },
  { icon: Wallet, index: "03", title: "Know what you hold", body: "Keep balances, individual positions and trading activity together in your personal portfolio." },
];

function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { coins, isLive, isLoading, isError } = useLiveCoins();
  const featured = coins.slice(0, 4);

  return (
    <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <header className="relative z-30 border-b border-border bg-background">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-5 md:px-10">
          <Link to="/" aria-label="Voltex home" className="shrink-0"><img src={logo} alt="Voltex" className="h-11 w-auto max-w-36 object-contain md:h-12" /></Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-9 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#platform" className="transition-colors hover:text-foreground">Platform</a>
            <a href="#markets" className="transition-colors hover:text-foreground">Markets</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <Link to="/about" className="transition-colors hover:text-foreground">About us</Link>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button>
            <Button asChild className="h-10 px-5"><Link to="/auth">Get started <ArrowUpRight /></Link></Button>
          </div>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X /> : <Menu />}</Button>
        </div>
        {menuOpen && <nav aria-label="Mobile navigation" className="flex flex-col gap-1 border-t border-border bg-background px-5 py-4 text-sm font-medium md:hidden">
          <a href="#platform" onClick={() => setMenuOpen(false)} className="py-3">Platform</a>
          <a href="#markets" onClick={() => setMenuOpen(false)} className="py-3">Markets</a>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="py-3">How it works</a>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="py-3">About us</Link>
          <div className="flex gap-3 pt-3"><Button asChild variant="outline" className="flex-1"><Link to="/auth">Sign in</Link></Button><Button asChild className="flex-1"><Link to="/auth">Get started</Link></Button></div>
        </nav>}
      </header>

      <main>
        <section className="relative isolate flex min-h-[580px] items-center overflow-hidden border-b border-border sm:min-h-[660px] lg:min-h-[690px]">
          <img src={hero} alt="A phone displaying digital asset market charts" width={1536} height={1024} fetchPriority="high" className="absolute inset-0 -z-20 h-full w-full object-cover object-[64%_center] sm:object-center" />
          <div className="absolute inset-0 -z-10 bg-hero-veil" />
          <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10">
            <div className="max-w-xl animate-fade-in">
              <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase text-accent"><span className="h-px w-8 bg-accent" />Powering your crypto future</p>
              <h1 className="font-display text-6xl font-semibold leading-[1.04] sm:text-7xl lg:text-8xl">Voltex<span className="text-accent">.</span></h1>
              <p className="mt-5 max-w-lg font-display text-3xl font-medium leading-tight sm:text-4xl">A clearer way to navigate crypto.</p>
              <p className="mt-6 max-w-md text-base leading-7 text-muted-foreground sm:text-lg">Follow the market, place considered trades and keep your portfolio in view — all from one focused platform.</p>
              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button asChild size="lg" className="h-12 px-6 font-semibold"><Link to="/auth">Create an account <ArrowRight /></Link></Button>
                <Button asChild size="lg" variant="outline" className="h-12 border-border bg-background/70 px-6 font-semibold"><a href="#platform">Explore the platform</a></Button>
              </div>
              <p className="mt-7 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-4 text-accent" /> Your portfolio is private to your account</p>
            </div>
          </div>
        </section>

        <section id="markets" className="border-b border-border bg-card py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-5 md:px-10">
            <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase text-accent">The market, in focus</p><h2 className="mt-2 font-display text-2xl font-semibold md:text-3xl">Assets worth watching</h2></div>
              <p className="text-xs text-muted-foreground">{isLive ? "Live market quotes · 24h change" : isLoading ? "Fetching current market prices…" : isError ? "Market prices temporarily unavailable" : "Fetching current market prices…"}</p>
            </div>
            <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {featured.map((coin) => <div key={coin.id} className="flex min-h-24 items-center justify-between gap-3 bg-background px-4 py-5">
                <div className="flex min-w-0 items-center gap-3"><CoinBadge glyph={coin.glyph} swatch={coin.swatch} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{coin.name}</p><p className="text-xs text-muted-foreground">{coin.symbol}</p></div></div>
                <div className="shrink-0 text-right"><p className="num text-sm font-semibold">{isLive ? formatUsd(coin.price) : "—"}</p><p className={`num mt-1 text-xs ${coin.change >= 0 ? "text-up" : "text-down"}`}>{isLive ? formatPct(coin.change) : "—"}</p></div>
              </div>)}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">Prices are indicative and may differ at execution. Digital assets carry risk.</p>
          </div>
        </section>

        <section id="platform" className="mx-auto max-w-7xl px-5 py-20 md:px-10 md:py-28">
          <div className="grid gap-6 border-b border-border pb-12 md:grid-cols-2 md:gap-16">
            <p className="text-xs font-bold uppercase text-accent">One connected experience</p>
            <div><h2 className="font-display text-3xl font-semibold leading-tight md:text-5xl">From first look to every position.</h2><p className="mt-5 max-w-lg leading-7 text-muted-foreground">Stay close to the details that matter. Voltex connects price discovery, trade review and portfolio tracking without losing the thread.</p></div>
          </div>
          <div className="grid gap-0 md:grid-cols-3">
            {capabilities.map(({ icon: Icon, index, title, body }) => <article key={index} className="border-b border-border px-1 py-10 md:border-b-0 md:border-r md:px-8 md:py-12 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
              <div className="mb-11 flex items-center justify-between"><Icon className="size-7 text-accent" strokeWidth={1.6} /><span className="num text-xs text-muted-foreground">{index} / 03</span></div>
              <h3 className="font-display text-xl font-semibold">{title}</h3><p className="mt-3 max-w-sm text-sm leading-7 text-muted-foreground">{body}</p>
            </article>)}
          </div>
        </section>

        <section id="how-it-works" className="border-y border-border bg-card py-20 md:py-28">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 md:grid-cols-2 md:items-center md:gap-20 md:px-10">
            <div><p className="text-xs font-bold uppercase text-accent">Getting started</p><h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-5xl">Make every move with more context.</h2><p className="mt-5 max-w-lg leading-7 text-muted-foreground">Start with an account, explore current market prices and review your order before you trade. Your activity and positions stay together afterward.</p><Button asChild className="mt-8 h-11 px-6"><Link to="/auth">Open your account <ArrowRight /></Link></Button></div>
            <ol className="border-t border-border">
              {["Create your account with your details", "Explore live markets and price history", "Review and place a buy or sell order", "Track your positions in your portfolio"].map((step, i) => <li key={step} className="flex items-center gap-5 border-b border-border py-6"><span className="num w-8 shrink-0 text-sm text-accent">0{i + 1}</span><span className="flex-1 font-display text-base font-medium sm:text-lg">{step}</span><CircleCheck className="size-5 shrink-0 text-muted-foreground" strokeWidth={1.5} /></li>)}
            </ol>
          </div>
        </section>

        <section className="mx-auto flex max-w-7xl flex-col gap-8 px-5 py-20 md:flex-row md:items-end md:justify-between md:px-10 md:py-24"><div><LockKeyhole className="size-7 text-accent" strokeWidth={1.5} /><h2 className="mt-5 max-w-xl font-display text-3xl font-semibold md:text-5xl">Ready to see where crypto can take you?</h2><p className="mt-5 max-w-lg text-sm leading-7 text-muted-foreground">Explore at your pace. Understand the risk. Make your own decisions.</p></div><Button asChild size="lg" className="h-12 w-fit px-6"><Link to="/auth">Get started <ArrowRight /></Link></Button></section>
      </main>

      <footer className="border-t border-border bg-card"><div className="mx-auto flex max-w-7xl flex-col gap-7 px-5 py-10 md:flex-row md:items-center md:justify-between md:px-10"><div><img src={logo} alt="Voltex" className="h-10 w-auto max-w-32 object-contain" /><p className="mt-3 text-xs text-muted-foreground">© {new Date().getFullYear()} Voltex. Digital assets involve risk.</p></div><div className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-muted-foreground"><Link to="/about" className="hover:text-foreground">About us</Link><Link to="/about" hash="legal" className="hover:text-foreground">Legal disclaimer</Link><Link to="/auth" className="hover:text-foreground">Sign in</Link></div></div></footer>
    </div>
  );
}