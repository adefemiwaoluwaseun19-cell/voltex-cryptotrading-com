import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo } from "react";
import {
  executeTrade,
  getAccount,
  getTransactions,
  type AccountData,
  type TradeResult,
  type TxRow,
} from "@/lib/account.functions";

export function useAccount() {
  const fetchAccount = useServerFn(getAccount);
  const query = useQuery<AccountData>({
    queryKey: ["account"],
    queryFn: () => fetchAccount(),
    staleTime: 15_000,
    refetchInterval: 60_000,
  });

  const holdingsMap = useMemo<Record<string, number> | undefined>(() => {
    if (!query.data) return undefined;
    return Object.fromEntries(query.data.holdings.map((h) => [h.coinId, h.amount]));
  }, [query.data]);

  return { ...query, holdingsMap };
}

export function useTransactions() {
  const fetchTx = useServerFn(getTransactions);
  return useQuery<TxRow[]>({
    queryKey: ["transactions"],
    queryFn: () => fetchTx(),
    staleTime: 30_000,
  });
}

export function useExecuteTrade() {
  const run = useServerFn(executeTrade);
  const queryClient = useQueryClient();
  return useMutation<TradeResult, Error, { coinId: string; side: "buy" | "sell"; usdAmount: number }>({
    mutationFn: (input) => run({ data: input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["account"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
