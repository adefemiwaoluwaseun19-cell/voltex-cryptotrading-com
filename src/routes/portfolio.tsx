import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { CoinBadge } from "@/components/CoinBadge";
import { EmptyState, RowSkeletons, Skeleton } from "@/components/Placeholders";
import { activity, formatPct, formatUsd } from "@/lib/market-data";
import { useLivePortfolio } from "@/lib/use-live-prices";

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
  const { rows, total, changeAbs, changePct, isLoading } = useLivePortfolio();
  const up = changeAbs >= 0;

  return (
    <AppShell>
      <AppHeader title="Portfolio" />

      <section className="mt-5 px-5">
        <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Total balance
        </h1>
        {isLoading ? (
          <div className="mt-2 space-y-2.5">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-44" />
          </div>
        ) : (
          <>
            <p className="num mt-1 font-display text-4xl font-semibold tracking-tight">
              {formatUsd(total)}
            </p>
            <p className={`num mt-2 text-sm font-semibold ${up ? "text-up" : "text-down"}`}>
              {up ? "+" : "−"}
              {formatUsd(Math.abs(changeAbs))} ({formatPct(changePct)}) today
            </p>
          </>
        )}

        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full border border-border">
          {isLoading
            ? <Skeleton className="h-full w-full rounded-none" />
            : rows.map((c, i) => (
                <div
                  key={c.id}
                  className={`allocation-segment bg-gradient-to-r ${c.swatch}`}
                  style={{ width: `${(c.value / total) * 100}%`, opacity: 1 - i * 0.08 }}
                />
              ))}
        </div>
        {!isLoading && (
          <div className="mt-3 grid grid-cols-2 gap-y-1.5">
            {rows.map((c) => (
              <div key={c.id} className="flex items-center gap-2">
                <span className={`size-2 rounded-full bg-gradient-to-br ${c.swatch}`} />
                <span className="text-xs">{c.symbol}</span>
                <span className="num ml-auto mr-4 text-xs text-muted-foreground">
                  {((c.value / total) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-5 px-5">
        <h2 className="mb-3 font-display text-base font-semibold">Holdings</h2>
        {isLoading ? (
          <RowSkeletons count={5} spark={false} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<span aria-hidden="true" className="text-lg">◎</span>}
            title="No holdings yet"
            body="Assets you buy will appear here with their live value and share of your portfolio."
            action={
              <Link
                to="/markets"
                className="pressable inline-block rounded-md bg-brand px-3.5 py-2 text-xs font-semibold text-brand-foreground shadow-brand"
              >
                Explore markets
              </Link>
            }
          />
        ) : (
          <div className="stagger-list space-y-2">
            {rows.map((coin) => (
              <Link
                key={coin.id}
                to="/coin/$coinId"
                params={{ coinId: coin.id }}
                className="market-row flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-3"
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
        )}
      </section>

      <section className="mt-5 px-5">
        <h2 className="mb-3 font-display text-base font-semibold">Recent activity</h2>
        {activity.length === 0 ? (
          <EmptyState
            icon={<span aria-hidden="true" className="text-lg">⇄</span>}
            title="No activity yet"
            body="Your buys, sells and deposits will show up here once you make your first trade."
          />
        ) : (
          <div className="stagger-list divide-y divide-border rounded-lg border border-border bg-surface px-3">
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
        )}
      </section>
    </AppShell>
  );
}
