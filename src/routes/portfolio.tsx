import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { CoinBadge } from "@/components/CoinBadge";
import {
  activity,
  formatPct,
  formatUsd,
  holdings,
  portfolioChange,
  portfolioChangeAbs,
  portfolioValue,
} from "@/lib/market-data";

export const Route = createFileRoute("/portfolio")({
  head: () => ({
    meta: [
      { title: "Your crypto portfolio — Voltex" },
      {
        name: "description",
        content:
          "Track total balance, allocation by asset and every recent buy, sell and deposit in your Voltex crypto portfolio.",
      },
      { property: "og:title", content: "Your crypto portfolio — Voltex" },
      {
        property: "og:description",
        content: "Balance, allocation and recent activity across your crypto holdings.",
      },
    ],
  }),
  component: PortfolioPage,
});

function PortfolioPage() {
  const rows = holdings
    .map((c) => ({ ...c, value: c.holding * c.price }))
    .sort((a, b) => b.value - a.value);

  return (
    <AppShell>
      <AppHeader title="Portfolio" />

      <section className="mt-5 px-5">
        <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Total balance
        </h1>
        <p className="num mt-1 font-display text-4xl font-semibold tracking-tight">
          {formatUsd(portfolioValue)}
        </p>
        <p className="num mt-2 text-sm font-semibold text-up">
          +{formatUsd(portfolioChangeAbs)} ({portfolioChange.toFixed(2)}%) today
        </p>

        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full border border-border">
          {rows.map((c, i) => (
            <div
              key={c.id}
              className={`bg-gradient-to-r ${c.swatch}`}
              style={{ width: `${(c.value / portfolioValue) * 100}%`, opacity: 1 - i * 0.08 }}
            />
          ))}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-y-1.5">
          {rows.map((c) => (
            <div key={c.id} className="flex items-center gap-2">
              <span className={`size-2 rounded-full bg-gradient-to-br ${c.swatch}`} />
              <span className="text-xs">{c.symbol}</span>
              <span className="num ml-auto mr-4 text-xs text-muted-foreground">
                {((c.value / portfolioValue) * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <h2 className="mb-3 font-display text-base font-semibold">Holdings</h2>
        <div className="space-y-2">
          {rows.map((coin) => (
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
                <p className="num text-sm font-semibold leading-none">{formatUsd(coin.value)}</p>
                <p className={`num mt-1 text-[11px] ${coin.change >= 0 ? "text-up" : "text-down"}`}>
                  {formatPct(coin.change)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 px-5">
        <h2 className="mb-3 font-display text-base font-semibold">Recent activity</h2>
        <div className="divide-y divide-border rounded-xl border border-border bg-surface px-3">
          {activity.map((item) => (
            <div key={item.id} className="flex items-center gap-3 py-3">
              <div
                className={`grid size-8 place-items-center rounded-lg text-xs font-bold ${
                  item.kind === "Sell" ? "bg-down/15 text-down" : "bg-up/15 text-up"
                }`}
              >
                {item.kind[0]}
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold">
                  {item.kind} {item.asset}
                </p>
                <p className="num mt-0.5 text-[11px] text-muted-foreground">{item.when}</p>
              </div>
              <div className="text-right">
                <p className={`num text-xs font-semibold ${item.kind === "Sell" ? "text-down" : "text-up"}`}>
                  {item.amount}
                </p>
                <p className="num mt-0.5 text-[11px] text-muted-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
