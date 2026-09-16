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
  const { data, isFetching, dataUpdatedAt, isError } = useLiveQuotes();

  const liveCoins = useMemo<Coin[]>(
    () =>
      coins.map((c) => {
        const q = data?.[c.id];
        return q ? { ...c, price: q.price, change: q.change, cap: q.cap, volume: q.volume } : c;
      }),
    [data],
  );

  return { coins: liveCoins, isLive: !!data, isFetching, isError, dataUpdatedAt };
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
