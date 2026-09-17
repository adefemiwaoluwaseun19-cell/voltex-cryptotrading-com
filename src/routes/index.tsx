import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { CoinBadge } from "@/components/CoinBadge";
import { Sparkline } from "@/components/Sparkline";
import { formatPct, formatUsd, sparkline } from "@/lib/market-data";
import { useLiveCoins, useLivePortfolio, usePriceHistory } from "@/lib/use-live-prices";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Voltex — Buy, sell and track crypto" },
      {
        name: "description",
        content:
          "Voltex is a crypto trading app with live market prices, instant buy and sell, and a portfolio that tracks every position.",
      },
      { property: "og:title", content: "Voltex — Buy, sell and track crypto" },
      {
        property: "og:description",
        content: "Live crypto markets, instant trades and a portfolio view in one app.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { coins } = useLiveCoins();
  const { rows, total, changeAbs, changePct } = useLivePortfolio();
  const featured = coins[0]!;
  const { data: history } = usePriceHistory(featured.id, "1D");
  const series = history?.length ? history : sparkline(featured.id, 40, featured.change > 0);

  return (
    <AppShell>
      <AppHeader />

      <section className="mt-5 px-5">
        <p className="text-sm text-muted-foreground">Welcome back, Jordan</p>
        <div className="mt-1 flex items-end justify-between">
          <div>
            <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
              Total balance
            </h1>
            <p className="num mt-1 font-display text-4xl font-semibold tracking-tight">
              {formatUsd(total)}
            </p>
          </div>
          <span
            className={`num mb-1 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
              changeAbs >= 0 ? "bg-up/15 text-up" : "bg-down/15 text-down"
            }`}
          >
            <span className="text-[10px]">{changeAbs >= 0 ? "▲" : "▼"}</span>{" "}
            {formatUsd(Math.abs(changeAbs))} ({formatPct(changePct)})
          </span>
        </div>
      </section>

      <div className="mt-4 flex items-center gap-2.5 px-5">
        <Link
          to="/markets"
          className="flex flex-1 items-center gap-2 rounded-full border border-border bg-secondary px-3 py-2.5"
        >
          <span className="text-sm text-muted-foreground">⌕</span>
          <span className="text-sm text-muted-foreground">Search assets</span>
        </Link>
        <Link
          to="/portfolio"
          aria-label="Portfolio"
          className="grid size-10 place-items-center rounded-full border border-border bg-secondary text-sm text-muted-foreground"
        >
          ≡
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-2 px-5">
        <Link
          to="/trade"
          search={{ coin: "btc", side: "buy" }}
          className="rounded-full bg-brand px-3.5 py-2 text-sm font-semibold text-brand-foreground"
        >
          Buy
        </Link>
        <Link
          to="/trade"
          search={{ coin: "btc", side: "sell" }}
          className="rounded-full bg-secondary px-3.5 py-2 text-sm font-semibold text-secondary-foreground"
        >
          Sell
        </Link>
        <Link
          to="/trade"
          search={{ coin: "eth", side: "buy" }}
          className="rounded-full bg-secondary px-3.5 py-2 text-sm font-semibold text-secondary-foreground"
        >
          Swap
        </Link>
      </div>

      <section className="mt-4 px-5">
        <div className="rounded-2xl border border-border bg-gradient-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CoinBadge glyph={featured.glyph} swatch={featured.swatch} className="size-7 text-[11px]" />
              <div>
                <p className="text-sm font-semibold leading-none">{featured.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{featured.symbol} / USD</p>
              </div>
            </div>
            <div className="text-right">
              <p className="num text-sm font-semibold leading-none">{formatUsd(featured.price)}</p>
              <p className="num mt-1 text-[11px] text-up">{formatPct(featured.change)}</p>
            </div>
          </div>
          <div className="mt-3 h-14">
            <Sparkline id="hero" values={series} up={featured.change > 0} area className="h-full w-full" />
          </div>
          <Link
            to="/coin/$coinId"
            params={{ coinId: featured.id }}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-gradient-brand text-sm font-bold text-primary-foreground active:scale-[0.99]"
          >
            Trade {featured.name}
          </Link>
        </div>
      </section>

      <section className="mt-5 px-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-base font-semibold">Portfolio</h2>
          <Link to="/portfolio" className="text-xs font-semibold text-accent">
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {holdings.slice(0, 3).map((coin) => (
            <Link
              key={coin.id}
              to="/coin/$coinId"
              params={{ coinId: coin.id }}
              className="flex items-center justify-between rounded-xl border border-border bg-surface px-3 py-3"
            >
              <div className="flex items-center gap-3">
                <CoinBadge glyph={coin.glyph} swatch={coin.swatch} />
                <div>
                  <p className="text-sm font-semibold leading-none">{coin.name}</p>
                  <p className="num mt-1 text-[11px] text-muted-foreground">
                    {coin.holding} {coin.symbol}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="num text-sm font-semibold leading-none">
                  {formatUsd(coin.holding * coin.price)}
                </p>
                <p
                  className={`num mt-1 text-[11px] ${coin.change >= 0 ? "text-up" : "text-down"}`}
                >
                  {formatPct(coin.change)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
