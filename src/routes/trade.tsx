import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { CoinBadge } from "@/components/CoinBadge";
import { coins, formatPct, formatUsd, getCoin } from "@/lib/market-data";

type Side = "buy" | "sell";

export const Route = createFileRoute("/trade")({
  validateSearch: (search: Record<string, unknown>): { coin: string; side: Side } => ({
    coin: typeof search["coin"] === "string" ? search["coin"] : "btc",
    side: search["side"] === "sell" ? "sell" : "buy",
  }),
  head: () => ({
    meta: [
      { title: "Buy and sell crypto — Voltex" },
      {
        name: "description",
        content:
          "Place a buy or sell order in seconds: pick an asset, set the amount and review the total before you confirm.",
      },
      { property: "og:title", content: "Buy and sell crypto — Voltex" },
      {
        property: "og:description",
        content: "Pick an asset, set an amount and review your total before confirming.",
      },
    ],
  }),
  component: TradePage,
});

const quickAmounts = [50, 100, 250, 500];

function TradePage() {
  const { coin: coinId, side } = Route.useSearch();
  const navigate = useNavigate({ from: "/trade" });
  const coin = getCoin(coinId) ?? coins[0]!;
  const [spend, setSpend] = useState("250");
  const [placed, setPlaced] = useState<string | null>(null);

  const usd = Number(spend) || 0;
  const units = usd / coin.price;
  const fee = usd * 0.004;

  const setSide = (next: Side) =>
    navigate({ search: { coin: coin.id, side: next }, replace: true });

  return (
    <AppShell>
      <AppHeader title="Trade" />

      <div className="mt-5 px-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {side === "buy" ? "Buy" : "Sell"} crypto
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">Market order · settles instantly</p>
      </div>

      <div className="mt-4 flex gap-2 px-5">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold ${
            side === "buy" ? "bg-brand text-brand-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`flex-1 rounded-full py-2.5 text-sm font-semibold ${
            side === "sell" ? "bg-brand text-brand-foreground" : "bg-secondary text-secondary-foreground"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {coins.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate({ search: { coin: c.id, side }, replace: true })}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold ${
              c.id === coin.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-secondary"
            }`}
          >
            <CoinBadge glyph={c.glyph} swatch={c.swatch} className="size-5 text-[9px]" />
            {c.symbol}
          </button>
        ))}
      </div>

      <section className="mt-4 px-5">
        <div className="rounded-2xl border border-border bg-gradient-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CoinBadge glyph={coin.glyph} swatch={coin.swatch} className="size-7 text-[11px]" />
              <div>
                <p className="text-sm font-semibold leading-none">{coin.name}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">{coin.symbol} / USD</p>
              </div>
            </div>
            <div className="text-right">
              <p className="num text-sm font-semibold leading-none">{formatUsd(coin.price)}</p>
              <p className={`num mt-1 text-[11px] ${coin.change >= 0 ? "text-up" : "text-down"}`}>
                {formatPct(coin.change)}
              </p>
            </div>
          </div>

          <label className="mt-4 block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            Amount in USD
          </label>
          <div className="mt-1 flex items-center rounded-xl border border-border bg-secondary px-3">
            <span className="text-sm text-muted-foreground">$</span>
            <input
              inputMode="decimal"
              value={spend}
              onChange={(e) => setSpend(e.target.value.replace(/[^0-9.]/g, ""))}
              aria-label="Amount in USD"
              className="num w-full bg-transparent px-2 py-3 font-display text-lg font-semibold outline-none"
            />
          </div>

          <div className="mt-2 flex gap-2">
            {quickAmounts.map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => setSpend(String(amount))}
                className="num flex-1 rounded-lg bg-secondary py-2 text-xs font-semibold text-secondary-foreground"
              >
                ${amount}
              </button>
            ))}
          </div>

          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">You {side === "buy" ? "receive" : "sell"}</dt>
              <dd className="num font-semibold">
                {units.toFixed(units < 1 ? 6 : 4)} {coin.symbol}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Fee (0.40%)</dt>
              <dd className="num font-semibold">{formatUsd(fee)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="num font-semibold">
                {formatUsd(side === "buy" ? usd + fee : usd - fee)}
              </dd>
            </div>
          </dl>

          <button
            type="button"
            disabled={usd <= 0}
            onClick={() =>
              setPlaced(
                `${side === "buy" ? "Bought" : "Sold"} ${units.toFixed(units < 1 ? 6 : 4)} ${coin.symbol} for ${formatUsd(usd)}`,
              )
            }
            className="mt-4 h-12 w-full rounded-xl bg-gradient-brand text-sm font-bold text-primary-foreground active:scale-[0.99] disabled:opacity-40"
          >
            {side === "buy" ? "Confirm buy" : "Confirm sell"}
          </button>

          {placed && (
            <p className="mt-3 rounded-lg bg-up/15 px-3 py-2 text-center text-xs font-semibold text-up">
              {placed}
            </p>
          )}
        </div>
      </section>
    </AppShell>
  );
}
