import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { GECKO_IDS } from "@/lib/prices.functions";

export type AccountHolding = { coinId: string; amount: number };

export type AccountData = {
  displayName: string;
  avatarUrl: string | null;
  email: string | null;
  cashUsd: number;
  holdings: AccountHolding[];
};

export const getAccount = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AccountData> => {
    const { supabase, userId, claims } = context;

    const [profileRes, walletRes, holdingsRes] = await Promise.all([
      supabase.from("profiles").select("display_name, avatar_url").eq("id", userId).single(),
      supabase.from("wallets").select("cash_usd").eq("user_id", userId).single(),
      supabase.from("holdings").select("coin_id, amount").eq("user_id", userId),
    ]);

    if (walletRes.error || !walletRes.data) {
      // User signed up before the wallet trigger existed — create it lazily.
      const { data } = await supabase
        .from("wallets")
        .upsert({ user_id: userId, cash_usd: 10000 }, { onConflict: "user_id" })
        .select("cash_usd")
        .single();
      if (!data) throw new Error("Could not load your account");
      return {
        displayName: profileRes.data?.display_name ?? "Trader",
        avatarUrl: profileRes.data?.avatar_url ?? null,
        email: typeof claims?.email === "string" ? claims.email : null,
        cashUsd: Number(data.cash_usd),
        holdings: [],
      };
    }

    if (holdingsRes.error) throw new Error(holdingsRes.error.message);

    return {
      displayName: profileRes.data?.display_name ?? "Trader",
      avatarUrl: profileRes.data?.avatar_url ?? null,
      email: typeof claims?.email === "string" ? claims.email : null,
      cashUsd: Number(walletRes.data.cash_usd),
      holdings: (holdingsRes.data ?? []).map((h) => ({ coinId: h.coin_id, amount: Number(h.amount) })),
    };
  });

export type TxRow = {
  id: string;
  kind: "buy" | "sell";
  coin_id: string;
  units: number;
  price_usd: number;
  total_usd: number;
  fee_usd: number;
  created_at: string;
};

export const getTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TxRow[]> => {
    const { data, error } = await context.supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(25);
    if (error) throw new Error(error.message);
    return (data ?? []).map((t) => ({
      id: t.id,
      kind: t.kind as "buy" | "sell",
      coin_id: t.coin_id,
      units: Number(t.units),
      price_usd: Number(t.price_usd),
      total_usd: Number(t.total_usd),
      fee_usd: Number(t.fee_usd),
      created_at: t.created_at,
    }));
  });

export type TradeResult = { units: number; total: number; fee: number; cash: number };

export const executeTrade = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        coinId: z.string(),
        side: z.enum(["buy", "sell"]),
        usdAmount: z.number().positive(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<TradeResult> => {
    const geckoId = GECKO_IDS[data.coinId];
    if (!geckoId) throw new Error("Unknown asset");

    // The price is fetched on the server so a caller can't tamper with it.
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`;
    const res = await fetch(url, { headers: { accept: "application/json" } });
    if (!res.ok) throw new Error("Live price unavailable — please try again");
    const json = (await res.json()) as Record<string, { usd?: number }>;
    const price = json[geckoId]?.usd;
    if (typeof price !== "number" || price <= 0) throw new Error("Live price unavailable — please try again");

    const { data: result, error } = await context.supabase.rpc("execute_trade", {
      _coin_id: data.coinId,
      _side: data.side,
      _price_usd: price,
      _usd_amount: data.usdAmount,
    });
    if (error) throw new Error(error.message);
    const r = result as { units: string | number; total: string | number; fee: string | number; cash: string | number };
    return {
      units: Number(r.units),
      total: Number(r.total),
      fee: Number(r.fee),
      cash: Number(r.cash),
    };
  });
