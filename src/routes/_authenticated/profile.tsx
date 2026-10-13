import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { CoinBadge } from "@/components/CoinBadge";
import { formatPct, formatUsd } from "@/lib/market-data";
import { useAccount, useExecuteTrade } from "@/lib/use-account";
import { useLiveCoins } from "@/lib/use-live-prices";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getWithdrawals, requestWithdrawal } from "@/lib/withdraw.functions";
import { isValidAddress } from "@/lib/wallet-address";

type Side = "buy" | "sell" | "send";

export const Route = createFileRoute("/_authenticated/trade")({
  validateSearch: (search: Record<string, unknown>): { coin: string; side: Side } => ({
    coin: typeof search["coin"] === "string" ? search["coin"] : "btc",
    side: search["side"] === "sell" ? "sell" : search["side"] === "send" ? "send" : "buy",
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
  const navigate = useNavigate();
  const { coins } = useLiveCoins();
  const { data: account, isLoading: accountLoading } = useAccount();
  const trade = useExecuteTrade();
  const qc = useQueryClient();
  const withdrawFn = useServerFn(requestWithdrawal);
  const listFn = useServerFn(getWithdrawals);
  const withdrawals = useQuery({ queryKey: ["withdrawals"], queryFn: () => listFn() });
  const withdraw = useMutation({
    mutationFn: (input: { coinId: string; usdAmount: number; address: string; pin: string }) =>
      withdrawFn({ data: input }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
      qc.invalidateQueries({ queryKey: ["withdrawals"] });
    },
  });
  const [address, setAddress] = useState("");
  const [pin, setPin] = useState("");

  const coin = coins.find((c) => c.id === coinId) ?? coins[0]!;
  const [spend, setSpend] = useState("250");
  const [placed, setPlaced] = useState<string | null>(null);
  const [tradeError, setTradeError] = useState<string | null>(null);

  const usd = Number(spend) || 0;
  const isSend = side === "send";
  const fee = isSend ? 0 : usd * 0.004;
  const units = usd / coin.price;
  const cash = account?.cashUsd ?? 0;
  const held = account?.holdings.find((h) => h.coinId === coin.id)?.amount ?? 0;
  const heldValue = held * coin.price;
  const buyTotal = usd + fee;
  const overCash = account !== undefined && side === "buy" && buyTotal > cash + 1e-9;
  const addressOk = isValidAddress(coin.id, address);
  const badAddress = isSend && !addressOk;
  const overHeld = account !== undefined && side !== "buy" && usd > heldValue + 1e-9;
  const pinOk = /^\d{6}$/.test(pin);
  const blocked =
    usd <= 0 || overCash || overHeld || badAddress || trade.isPending || withdraw.isPending || !pinOk;

  const setSide = (next: Side) =>
    navigate({ to: "/trade", search: { coin: coin.id, side: next }, replace: true });

  const setMax = () => {
    if (side !== "buy") {
      setSpend((Math.floor(heldValue * 100) / 100).toFixed(2));
    } else {
      setSpend((Math.floor((cash / 1.004) * 100) / 100).toFixed(2));
    }
  };

  const confirm = () => {
    if (!pinOk) {
      setTradeError("Enter your 6-digit transaction PIN.");
      return;
    }
    if (blocked) return;
    setPlaced(null);
    setTradeError(null);
    if (side === "send") {
      withdraw.mutate(
        { coinId: coin.id, usdAmount: usd, address: address.trim(), pin },
        {
          onSuccess: (r) => {
            setPlaced(`Send request for ${r.units.toFixed(r.units < 1 ? 6 : 4)} ${coin.symbol} submitted — pending review`);
            setAddress("");
            setPin("");
          },
          onError: (e) => setTradeError(e.message),
        },
      );
      return;
    }
    trade.mutate(
      { coinId: coin.id, side, usdAmount: usd, pin },
      {
        onSuccess: (r) => {
          setPlaced(
            `${side === "buy" ? "Bought" : "Sold"} ${r.units.toFixed(r.units < 1 ? 6 : 4)} ${coin.symbol} — settled ${formatUsd(r.total)}`,
          );
          setPin("");
        },
        onError: (e) => setTradeError(e.message),
      },
    );
  };

  return (
    <AppShell>
      <AppHeader title="Trade" />

      <div className="mt-5 px-5">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          {side === "buy" ? "Buy" : side === "sell" ? "Sell" : "Send"} crypto
        </h1>
        <p className="num mt-1 text-sm text-muted-foreground">
          {accountLoading ? "Loading cash…" : `Cash available · ${formatUsd(cash)}`}
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-1 rounded-lg bg-secondary p-1 mx-5">
        <button
          type="button"
          onClick={() => setSide("buy")}
          className={`pressable rounded-md py-2.5 text-sm font-semibold transition-all ${
            side === "buy" ? "bg-brand text-brand-foreground shadow-brand" : "text-muted-foreground"
          }`}
        >
          Buy
        </button>
        <button
          type="button"
          onClick={() => setSide("sell")}
          className={`pressable rounded-md py-2.5 text-sm font-semibold transition-all ${
            side === "sell" ? "bg-brand text-brand-foreground shadow-brand" : "text-muted-foreground"
          }`}
        >
          Sell
        </button>
        <button
          type="button"
          onClick={() => setSide("send")}
          className={`pressable rounded-md py-2.5 text-sm font-semibold transition-all ${
            side === "send" ? "bg-brand text-brand-foreground shadow-brand" : "text-muted-foreground"
          }`}
        >
          Send
        </button>
      </div>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5 pb-1">
        {coins.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => navigate({ to: "/trade", search: { coin: c.id, side }, replace: true })}
            className={`pressable flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold ${
              c.id === coin.id ? "border-accent bg-accent/10 text-accent" : "border-border bg-secondary"
            }`}
          >
            <CoinBadge glyph={c.glyph} swatch={c.swatch} className="size-5 text-[9px]" />
            {c.symbol}
          </button>
        ))}
      </div>

      <section className="mt-4 px-5">
        <div className="rounded-lg border border-border bg-gradient-card p-4">
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

          {isSend && (
            <div className="mt-4">
              <label htmlFor="recipient" className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
                Recipient {coin.symbol} wallet address
              </label>
              <input
                id="recipient"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={`Paste a ${coin.symbol} address`}
                autoComplete="off"
                spellCheck={false}
                className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-3 font-mono text-xs outline-none"
              />
              {address.length > 0 && !addressOk && (
                <p className="mt-1 text-[11px] text-down">This doesn't look like a valid {coin.symbol} address.</p>
              )}
              <p className="mt-1 text-[11px] text-muted-foreground">
                Double-check the address. Crypto sent to the wrong address can't be recovered.
              </p>
            </div>
          )}

          <div className="mt-4 flex items-center justify-between">
            <label className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Amount in USD
            </label>
            <button
              type="button"
              onClick={setMax}
              className="pressable rounded bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent"
            >
              Max
            </button>
          </div>
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
                className="pressable num flex-1 rounded-md bg-secondary py-2 text-xs font-semibold text-secondary-foreground"
              >
                ${amount}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label htmlFor="transaction-pin" className="block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
              Transaction PIN
            </label>
            <input
              id="transaction-pin"
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoComplete="one-time-code"
              placeholder="Enter 6-digit PIN"
              className="mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-3 text-sm font-semibold outline-none"
            />
            {!pinOk && pin.length > 0 && <p className="mt-1 text-[11px] text-down">PIN must be exactly 6 digits.</p>}
          </div>

          <dl className="mt-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">You {side === "buy" ? "receive" : side === "sell" ? "sell" : "send"}</dt>
              <dd className="num font-semibold">
                {units.toFixed(units < 1 ? 6 : 4)} {coin.symbol}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">{isSend ? "Fee" : "Fee (0.40%)"}</dt>
              <dd className="num font-semibold">{formatUsd(fee)}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-border pt-2">
              <dt className="text-muted-foreground">{side === "buy" ? "Total cost" : side === "sell" ? "You receive" : "Value sent"}</dt>
              <dd className="num font-semibold">
                {formatUsd(side === "buy" ? usd + fee : usd - fee)}
              </dd>
            </div>
          </dl>

          {side !== "buy" && (
            <p className="num mt-2 text-[11px] text-muted-foreground">
              You hold {held} {coin.symbol}
            </p>
          )}

          <button
            type="button"
            disabled={blocked}
            onClick={confirm}
            className="action-button mt-4 h-12 w-full rounded-md bg-gradient-brand text-sm font-bold text-primary-foreground shadow-brand disabled:opacity-40"
          >
            {trade.isPending || withdraw.isPending
              ? "Submitting…"
              : overCash
                ? "Not enough cash"
                : overHeld
                  ? "Not enough holdings"
                  : isSend
                    ? badAddress ? "Enter a valid address" : "Request send"
                    : side === "buy"
                      ? "Confirm buy"
                      : "Confirm sell"}
          </button>

          {placed && (
            <p className="animate-scale-in mt-3 rounded-md bg-up/15 px-3 py-2 text-center text-xs font-semibold text-up">
              {placed}
            </p>
          )}
          {tradeError && (
            <p className="animate-scale-in mt-3 rounded-md bg-down/15 px-3 py-2 text-center text-xs font-semibold text-down">
              {tradeError}
            </p>
          )}
        </div>
      </section>

      {isSend && (withdrawals.data?.length ?? 0) > 0 && (
        <section className="mt-5 px-5 pb-6">
          <h2 className="text-sm font-semibold">Recent send requests</h2>
          <ul className="mt-2 space-y-2">
            {withdrawals.data!.map((w) => (
              <li key={w.id} className="rounded-lg border border-border bg-secondary p-3 text-xs">
                <div className="flex justify-between">
                  <span className="num font-semibold">{w.units.toFixed(6)} {w.coin_id.toUpperCase()}</span>
                  <span className={w.status === "completed" ? "text-up" : w.status === "rejected" ? "text-down" : "text-accent"}>
                    {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                  </span>
                </div>
                <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">To {w.address}</p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </AppShell>
  );
}
