import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type CashoutRow = {
  id: string;
  user_id: string;
  amount_usd: number;
  method: string;
  holder_name: string;
  last4: string;
  bank_name: string | null;
  status: string;
  created_at: string;
};

export const requestCashout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        amount: z.number().min(10),
        method: z.enum(["card", "bank"]),
        holder: z.string().trim().min(2).max(100),
        last4: z.string().regex(/^\d{4}$/),
        bank: z.string().trim().max(100).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("request_cash_withdrawal", {
      _amount: data.amount,
      _method: data.method,
      _holder: data.holder,
      _last4: data.last4,
      _bank: data.bank ?? "",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const select = "id, user_id, amount_usd, method, holder_name, last4, bank_name, status, created_at";
const norm = (rows: any[] | null): CashoutRow[] => (rows ?? []).map((r) => ({ ...r, amount_usd: Number(r.amount_usd) }));

export const getMyCashouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cash_withdrawals").select(select).eq("user_id", context.userId)
      .order("created_at", { ascending: false }).limit(10);
    if (error) throw new Error(error.message);
    return norm(data);
  });

export const listAllCashouts = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("cash_withdrawals").select(select).order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return norm(data);
  });

export const reviewCashout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), approve: z.boolean() }).parse(input))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.rpc("review_cash_withdrawal", { _id: data.id, _approve: data.approve });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
