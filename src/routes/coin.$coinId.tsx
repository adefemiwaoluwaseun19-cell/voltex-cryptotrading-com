import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { CoinBadge } from "@/components/CoinBadge";
import { Sparkline } from "@/components/Sparkline";
import { formatPct, formatUsd, getCoin, sparkline } from "@/lib/market-data";
import { useLiveCoin, usePriceHistory } from "@/lib/use-live-prices";

export const Route = createFileRoute("/coin/$coinId")({
  loader: ({ params }) => {
    const coin = getCoin(params.coinId);
    if (!coin) throw notFound();
    return { coin };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Asset unavailable — Voltex" }, { name: "robots", content: "noindex" }],
      };
    }
    const { coin } = loaderData;
    const title = `${coin.name} (${coin.symbol}) price and chart — Voltex`;
    const description = `${coin.name} live price, 24-hour movement, market stats and an instant buy or sell ticket on Voltex.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
    };
  },
  component: CoinPage,
});

const ranges = ["1H", "1D", "1W", "1M", "1Y"] as const;

function CoinPage() {
  const { coin: staticCoin } = Route.useLoaderData();
  const [range, setRange] = useState<(typeof ranges)[number]>("1D");
  const { coin: liveCoin, isLive } = useLiveCoin(staticCoin.id);
  const coin = liveCoin ?? staticCoin;
  const up = coin.change >= 0;
  const history = usePriceHistory(coin.id, range);
  const series =
    history.data && history.data.length > 1
      ? history.data
      : sparkline(coin.id + range, 60, up);

  return (
    <AppShell>
      <AppHeader title={coin.symbol} />

      <section className="mt-5 px-5">
        <div className="flex items-center gap-3">
          <CoinBadge glyph={coin.glyph} swatch={coin.swatch} className="size-11 text-base" />
          <div>
            <h1 className="font-display text-xl font-semibold leading-tight">{coin.name}</h1>
            <p className="text-xs text-muted-foreground">{coin.symbol} / USD · Spot</p>
          </div>
        </div>
        <p className="num mt-4 font-display text-4xl font-semibold tracking-tight">
          {formatUsd(coin.price)}
        </p>
        <p className={`num mt-1 text-sm font-semibold ${up ? "text-up" : "text-down"}`}>
          {up ? "▲" : "▼"} {formatPct(coin.change)} today
        </p>
      </section>

      <div className="mt-4 flex gap-1.5 px-5">
        {ranges.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRange(r)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
              range === r ? "bg-brand text-brand-foreground" : "bg-secondary text-muted-foreground"
            }`}
          >
            {r}
          </button>
        ))}
      </div>

      <div className="mt-3 px-5">
        <div className="h-44 rounded-2xl border border-border bg-gradient-card p-2">
          <Sparkline id={`detail-${coin.id}-${range}`} values={series} up={up} area className="h-full w-full" />
        </div>
      </div>

      <section className="mt-4 grid grid-cols-3 gap-2 px-5">
        {[
          { label: "Market cap", value: coin.cap },
          { label: "24h volume", value: coin.volume },
          { label: "Supply", value: coin.supply },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{stat.label}</p>
            <p className="num mt-1 text-xs font-semibold">{stat.value}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 px-5">
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="font-display text-sm font-semibold">Your position</h2>
          <div className="mt-2 flex items-end justify-between">
            <p className="num text-lg font-semibold">{formatUsd(coin.holding * coin.price)}</p>
            <p className="num text-xs text-muted-foreground">
              {coin.holding} {coin.symbol}
            </p>
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{coin.about}</p>
        </div>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2 px-5">
        <Link
          to="/trade"
          search={{ coin: coin.id, side: "sell" }}
          className="flex h-12 items-center justify-center rounded-xl bg-secondary text-sm font-bold text-secondary-foreground"
        >
          Sell
        </Link>
        <Link
          to="/trade"
          search={{ coin: coin.id, side: "buy" }}
          className="flex h-12 items-center justify-center rounded-xl bg-gradient-brand text-sm font-bold text-primary-foreground"
        >
          Buy {coin.symbol}
        </Link>
      </div>
    </AppShell>
  );
}
