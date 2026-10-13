import { createServerFn } from "@tanstack/react-start";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const transactionPinSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Transaction PIN must be a 6-digit number");

export type TransactionPinStatus = {
  hasPin: boolean;
  locked: boolean;
  lockedUntil: string | null;
  failedAttempts: number;
};

async function readPinRecord(supabase: { from: (table: string) => any }, userId: string) {
  const { data, error } = await supabase
    .from("transaction_pins")
    .select("user_id, pin_hash, failed_attempts, locked_until, updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

export async function verifyTransactionPinForUser(
  supabase: { from: (table: string) => any },
  userId: string,
  pin: string,
): Promise<void> {
  const record = await readPinRecord(supabase, userId);
  if (!record) throw new Error("Transaction PIN is not set.");

  const lockedUntil = record.locked_until ? new Date(record.locked_until).getTime() : null;
  if (lockedUntil && lockedUntil > Date.now()) {
    const minutes = Math.max(1, Math.ceil((lockedUntil - Date.now()) / 60000));
    throw new Error(`Transaction PIN is temporarily locked. Please try again in ${minutes} minute(s).`);
  }

  const matches = await bcrypt.compare(pin, record.pin_hash);
  if (!matches) {
    const nextAttempts = Number(record.failed_attempts ?? 0) + 1;
    const lockThreshold = 5;
    const locked = nextAttempts >= lockThreshold;
    await supabase
      .from("transaction_pins")
      .update({
        failed_attempts: locked ? lockThreshold : nextAttempts,
        locked_until: locked ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    throw new Error(locked ? "Transaction PIN locked for 15 minutes." : "Invalid transaction PIN.");
  }

  await supabase
    .from("transaction_pins")
    .update({
      failed_attempts: 0,
      locked_until: null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId);
}

export const getTransactionPinStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TransactionPinStatus> => {
    const record = await readPinRecord(context.supabase, context.userId);
    if (!record) {
      return { hasPin: false, locked: false, lockedUntil: null, failedAttempts: 0 };
    }

    const lockedUntil = record.locked_until ? new Date(record.locked_until).getTime() : null;
    return {
      hasPin: true,
      locked: Boolean(lockedUntil && lockedUntil > Date.now()),
      lockedUntil: record.locked_until ? new Date(record.locked_until).toISOString() : null,
      failedAttempts: Number(record.failed_attempts ?? 0),
    };
  });

export const setTransactionPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ pin: transactionPinSchema }).parse(input))
  .handler(async ({ data, context }) => {
    const existing = await readPinRecord(context.supabase, context.userId);
    if (existing) throw new Error("Transaction PIN already exists. Use change instead.");

    const pinHash = await bcrypt.hash(data.pin, 12);
    const { error } = await context.supabase.from("transaction_pins").insert({
      user_id: context.userId,
      pin_hash: pinHash,
      failed_attempts: 0,
      locked_until: null,
    });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const changeTransactionPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        currentPin: transactionPinSchema,
        newPin: transactionPinSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyTransactionPinForUser(context.supabase, context.userId, data.currentPin);

    const pinHash = await bcrypt.hash(data.newPin, 12);
    const { error } = await context.supabase
      .from("transaction_pins")
      .update({
        pin_hash: pinHash,
        failed_attempts: 0,
        locked_until: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", context.userId);

    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const removeTransactionPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ pin: transactionPinSchema }).parse(input))
  .handler(async ({ data, context }) => {
    await verifyTransactionPinForUser(context.supabase, context.userId, data.pin);

    const { error } = await context.supabase.from("transaction_pins").delete().eq("user_id", context.userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const verifyTransactionPin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ pin: transactionPinSchema }).parse(input))
  .handler(async ({ data, context }) => {
    await verifyTransactionPinForUser(context.supabase, context.userId, data.pin);
    return { ok: true };
  });

export const transactionPinFieldError = "Transaction PIN must be a 6-digit number";
