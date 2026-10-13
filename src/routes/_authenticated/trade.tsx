import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { GECKO_IDS, fetchBitpayPrice } from "@/lib/prices.functions";
import { isValidAddress } from "@/lib/wallet-address";
import { transactionPinSchema, verifyTransactionPinForUser } from "@/lib/transaction-pin.functions";

export type WithdrawalRow = {
  id: string;
  coin_id: string;
  units: number;
  address: string;
  status: string;
  created_at: string;
};

export const requestWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        coinId: z.string(),
        usdAmount: z.number().positive(),
        address: z.string().trim().min(20).max(120),
        pin: transactionPinSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyTransactionPinForUser(context.supabase, context.userId, data.pin);

    const geckoId = GECKO_IDS[data.coinId];
    if (!geckoId) throw new Error("Unknown asset");
    if (!isValidAddress(data.coinId, data.address)) throw new Error("That wallet address doesn't look right for this coin");

    let price = await fetchBitpayPrice(data.coinId);
    if (price === null) {
      const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${geckoId}&vs_currencies=usd`);
      if (res.ok) price = ((await res.json()) as Record<string, { usd?: number }>)[geckoId]?.usd ?? null;
    }
    if (typeof price !== "number" || price <= 0) throw new Error("Live price unavailable — please try again");

    const { error } = await context.supabase.rpc("request_withdrawal", {
      _coin_id: data.coinId,
      _units: data.usdAmount / price,
      _price_usd: price,
      _address: data.address.trim(),
    });
    if (error) throw new Error(error.message);
    return { units: data.usdAmount / price };
  });

export const getWithdrawals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<WithdrawalRow[]> => {
    const { data, error } = await context.supabase
      .from("withdrawals")
      .select("id, coin_id, units, address, status, created_at")
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw new Error(error.message);
    return (data ?? []).map((w) => ({ ...w, units: Number(w.units) }));
  });

export type AdminWithdrawalRow = WithdrawalRow & { user_id: string; price_usd: number };

export const getIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    return data === true;
  });

export const listAllWithdrawals = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminWithdrawalRow[]> => {
    const { data, error } = await context.supabase
      .from("withdrawals")
      .select("id, user_id, coin_id, units, price_usd, address, status, created_at")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return (data ?? []).map((w) => ({ ...w, units: Number(w.units), price_usd: Number(w.price_usd) }));
  });

export const reviewWithdrawal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), approve: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("review_withdrawal", { _id: data.id, _approve: data.approve });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
