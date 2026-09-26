import { createFileRoute, Link } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { CoinBadge } from "@/components/CoinBadge";
import { EmptyState, RowSkeletons, Skeleton } from "@/components/Placeholders";
import { formatPct, formatUsd } from "@/lib/market-data";
import { useAccount, useTransactions } from "@/lib/use-account";
import { useLivePortfolio } from "@/lib/use-live-prices";

export const Route = createFileRoute("/_authenticated/portfolio")({
  head: () => ({
    meta: [
      { title: "Your crypto portfolio — Voltex" },
      {
        name: "description",
        content:
          "Track total balance, allocation by asset and every recent buy and sell in your Voltex crypto portfolio.",
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

const whenLabel = (iso: string) => {
  const d = new Date(iso);
  const sameDay = new Date().toDateString() === d.toDateString();
  const time = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
  if (sameDay) return `Today · ${time}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })} · ${time}`;
};

function PortfolioPage() {
  const { data: account, holdingsMap, isLoading: accountLoading } = useAccount();
  const { rows, changeAbs, changePct, isLoading } = useLivePortfolio(holdingsMap);
  const { data: txs, isLoading: txLoading } = useTransactions();

  const cash = account?.cashUsd ?? 0;
  const grandTotal = cash + rows.reduce((sum, r) => sum + r.value, 0);
  const allocation = [
    { id: "usd", symbol: "USD", swatch: "from-slate-400 to-slate-600", value: cash },
    ...rows.map((r) => ({ id: r.id, symbol: r.symbol, swatch: r.swatch, value: r.value })),
  ].filter((a) => a.value > 0);
  const up = changeAbs >= 0;

  return (
    <AppShell>
      <AppHeader title="Portfolio" />

      <section className="mt-5 px-5">
        <h1 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-accent">
          Total balance
        </h1>
        {accountLoading || isLoading ? (
          <div className="mt-2 space-y-2.5">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-4 w-44" />
          </div>
        ) : (
          <>
            <p className="num mt-1 font-display text-4xl font-semibold tracking-tight">
              {formatUsd(grandTotal)}
            </p>
            <p className={`num mt-2 text-sm font-semibold ${up ? "text-up" : "text-down"}`}>
              {up ? "+" : "−"}
              {formatUsd(Math.abs(changeAbs))} ({formatPct(changePct)}) today
            </p>
            <p className="num mt-1 text-xs text-muted-foreground">
              Cash available · {formatUsd(cash)}
            </p>
          </>
        )}

        <div className="mt-4 flex h-2.5 overflow-hidden rounded-full border border-border">
          {accountLoading || isLoading ? (
            <Skeleton className="h-full w-full rounded-none" />
          ) : (
            allocation.map((a, i) => (
              <div
                key={a.id}
                className={`allocation-segment bg-gradient-to-r ${a.swatch}`}
                style={{ width: `${(a.value / grandTotal) * 100}%`, opacity: 1 - i * 0.08 }}
              />
            ))
          )}
        </div>
        {!accountLoading && !isLoading && allocation.length > 0 && (
          <div className="mt-3 grid grid-cols-2 gap-y-1.5">
            {allocation.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                <span className={`size-2 rounded-full bg-gradient-to-br ${a.swatch}`} />
                <span className="text-xs">{a.symbol}</span>
                <span className="num ml-auto mr-4 text-xs text-muted-foreground">
                  {((a.value / grandTotal) * 100).toFixed(0)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mt-5 px-5">
        <h2 className="mb-3 font-display text-base font-semibold">Holdings</h2>
        {accountLoading || isLoading ? (
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
        {txLoading ? (
          <RowSkeletons count={3} spark={false} />
        ) : !txs || txs.length === 0 ? (
          <EmptyState
            icon={<span aria-hidden="true" className="text-lg">⇄</span>}
            title="No activity yet"
            body="Your buys and sells will show up here once you make your first trade."
          />
        ) : (
          <div className="stagger-list divide-y divide-border rounded-lg border border-border bg-surface px-3">
            {txs.map((tx) => {
              const coinLabel = tx.coin_id.toUpperCase();
              return (
                <div key={tx.id} className="flex items-center gap-3 py-3">
                  <div
                    className={`grid size-8 place-items-center rounded-lg text-xs font-bold ${
                      tx.kind === "sell" ? "bg-down/15 text-down" : "bg-up/15 text-up"
                    }`}
                  >
                    {tx.kind === "buy" ? "B" : "S"}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold">
                      {tx.kind === "buy" ? "Buy" : "Sell"} {coinLabel}
                    </p>
                    <p className="num mt-0.5 text-[11px] text-muted-foreground">{whenLabel(tx.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`num text-xs font-semibold ${tx.kind === "sell" ? "text-down" : "text-up"}`}>
                      {tx.kind === "buy" ? "+" : "−"}
                      {tx.units.toFixed(tx.units < 1 ? 6 : 4)} {coinLabel}
                    </p>
                    <p className="num mt-0.5 text-[11px] text-muted-foreground">{formatUsd(tx.total_usd)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
