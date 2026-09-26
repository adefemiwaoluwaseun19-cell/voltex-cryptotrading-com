import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { CoinBadge } from "@/components/CoinBadge";
import { Sparkline } from "@/components/Sparkline";
import { EmptyState, RowSkeletons } from "@/components/Placeholders";
import { formatPct, formatUsd, sparkline } from "@/lib/market-data";
import { useLiveCoins } from "@/lib/use-live-prices";

export const Route = createFileRoute("/markets")({
  head: () => ({
    meta: [
      { title: "Crypto markets and live prices — Voltex" },
      {
        name: "description",
        content:
          "Browse live crypto prices, 24-hour movement and trend lines for Bitcoin, Ethereum, Solana and more on Voltex.",
      },
      { property: "og:title", content: "Crypto markets and live prices — Voltex" },
      {
        property: "og:description",
        content: "Live prices and 24-hour movement across the major crypto assets.",
      },
    ],
  }),
  component: MarketsPage,
});

const filters = ["All", "Gainers", "Losers", "Holdings"] as const;

function MarketsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const { coins, isLive, isError, isLoading } = useLiveCoins();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return coins
      .filter((c) => !q || c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q))
      .filter((c) => {
        if (filter === "Gainers") return c.change > 0;
        if (filter === "Losers") return c.change < 0;
        if (filter === "Holdings") return c.holding > 0;
        return true;
      });
  }, [coins, query, filter]);

  return (
    <AppShell>
      <AppHeader title="Markets" />

      <div className="mt-5 px-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Markets</h1>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
          <span
            className={`size-1.5 rounded-full ${isError ? "bg-down" : isLive ? "animate-pulse bg-up" : "bg-muted-foreground"}`}
          />
          {isError ? "Live feed unavailable" : isLive ? "Live spot prices · USD" : "Loading live prices…"}
        </p>
      </div>

      <div className="mt-4 px-5">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-2.5 transition-colors focus-within:border-brand focus-within:bg-surface">
          <span className="text-sm text-muted-foreground">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assets"
            aria-label="Search assets"
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto px-5 pb-1">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`pressable shrink-0 rounded-md px-3.5 py-2 text-sm font-semibold transition-colors ${
              filter === f ? "bg-brand text-brand-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-3 px-5">
          <RowSkeletons count={7} />
        </div>
      ) : (
        <div className="stagger-list mt-3 space-y-2 px-5">
          {rows.map((coin) => (
            <Link
              key={coin.id}
              to="/coin/$coinId"
              params={{ coinId: coin.id }}
              className="market-row flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-3"
            >
              <CoinBadge glyph={coin.glyph} swatch={coin.swatch} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-none">{coin.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{coin.symbol} / USD</p>
              </div>
              <div className="h-7 w-14">
                <Sparkline id={coin.id} values={sparkline(coin.id, 24, coin.change > 0)} up={coin.change > 0} className="h-full w-full" />
              </div>
              <div className="w-[86px] text-right">
                <p className="num text-sm font-semibold leading-none">{formatUsd(coin.price)}</p>
                <p className={`num mt-1 text-[11px] ${coin.change >= 0 ? "text-up" : "text-down"}`}>
                  {formatPct(coin.change)}
                </p>
              </div>
            </Link>
          ))}
          {rows.length === 0 && (
            <EmptyState
              icon={<span aria-hidden="true" className="text-lg">⌕</span>}
              title="No assets found"
              body="Try a different search term or clear the filters to see every listed asset."
              action={
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setFilter("All");
                  }}
                  className="pressable rounded-md bg-secondary px-3.5 py-2 text-xs font-semibold text-secondary-foreground"
                >
                  Clear filters
                </button>
              }
            />
          )}
        </div>
      )}
    </AppShell>
  );
}
