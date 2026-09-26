import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import { getLiveQuotes, getPriceHistory, type LiveQuotes } from "@/lib/prices.functions";
import { coins, type Coin } from "@/lib/market-data";

export function useLiveQuotes() {
  const fetchQuotes = useServerFn(getLiveQuotes);
  return useQuery<LiveQuotes>({
    queryKey: ["live-quotes"],
    queryFn: () => fetchQuotes(),
    refetchInterval: 20_000,
    refetchOnWindowFocus: true,
    staleTime: 10_000,
  });
}

/** Static coin metadata merged with live price, 24h change, cap and volume. */
export function useLiveCoins() {
  const { data, isFetching, dataUpdatedAt, isError, isPending } = useLiveQuotes();

  const liveCoins = useMemo<Coin[]>(
    () =>
      coins.map((c) => {
        const q = data?.[c.id];
        return q ? { ...c, price: q.price, change: q.change, cap: q.cap, volume: q.volume } : c;
      }),
    [data],
  );

  return { coins: liveCoins, isLive: !!data, isFetching, isError, isLoading: isPending && !isError, dataUpdatedAt };
}

export function useLiveCoin(id: string) {
  const { coins: liveCoins, ...rest } = useLiveCoins();
  const coin = liveCoins.find((c) => c.id === id);
  return { coin, ...rest };
}

export function usePriceHistory(coinId: string, range: string, enabled = true) {
  const fetchHistory = useServerFn(getPriceHistory);
  return useQuery<number[]>({
    queryKey: ["price-history", coinId, range],
    queryFn: () => fetchHistory({ data: { coinId, range } }),
    enabled,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}

/** Portfolio rows and totals derived from live prices. Holdings come from the signed-in account when provided. */
export function useLivePortfolio(holdingsMap?: Record<string, number>) {
  const { coins: liveCoins, isLive, isFetching, isError, isLoading } = useLiveCoins();

  return useMemo(() => {
    const amountOf = (c: Coin) => (holdingsMap ? (holdingsMap[c.id] ?? 0) : c.holding);
    const rows = liveCoins
      .filter((c) => amountOf(c) > 0)
      .map((c) => ({ ...c, holding: amountOf(c), value: amountOf(c) * c.price }))
      .sort((a, b) => b.value - a.value);

    const total = rows.reduce((sum, r) => sum + r.value, 0);
    const prev = rows.reduce((sum, r) => sum + r.value / (1 + r.change / 100), 0);
    const changeAbs = total - prev;
    const changePct = prev > 0 ? (changeAbs / prev) * 100 : 0;

    return { rows, total, changeAbs, changePct, isLive, isFetching, isError, isLoading };
  }, [liveCoins, isLive, isFetching, isError, isLoading, holdingsMap]);
}
