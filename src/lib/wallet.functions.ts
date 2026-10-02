import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getBtcAddress = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ address: string | null; configured: boolean }> => {
    const { supabase, userId } = context;
    const existing = await supabase.from("btc_addresses").select("address").eq("user_id", userId).maybeSingle();
    if (existing.data?.address) return { address: existing.data.address, configured: true };

    const xpub = process.env["BTC_XPUB"]?.trim();
    const seed = process.env["BTC_MASTER_SEED"]?.trim();
    if (!xpub && !seed) return { address: null, configured: false };

    const { deriveBtcAddress, deriveBtcAddressFromSeed } = await import("./btc-derive.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("btc_addresses")
      .upsert({ user_id: userId }, { onConflict: "user_id" })
      .select("derivation_index, address")
      .single();
    if (error || !row) throw new Error("Could not create your Bitcoin address");
    if (row.address) return { address: row.address, configured: true };

    const address = xpub
      ? deriveBtcAddress(xpub, row.derivation_index)
      : deriveBtcAddressFromSeed(seed!, row.derivation_index);
    await supabaseAdmin.from("btc_addresses").update({ address }).eq("user_id", userId);
    return { address, configured: true };
  });

export type BtcDeposit = { txid: string; amountBtc: number; confirmations: number; time: number | null };

export const getBtcDeposits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<BtcDeposit[]> => {
    const { data } = await context.supabase
      .from("btc_addresses").select("address").eq("user_id", context.userId).maybeSingle();
    const address = data?.address;
    if (!address) return [];
    const base = "https://mempool.space/api";
    const [txRes, tipRes] = await Promise.all([fetch(`${base}/address/${address}/txs`), fetch(`${base}/blocks/tip/height`)]);
    if (!txRes.ok || !tipRes.ok) throw new Error("Deposit tracking is temporarily unavailable");
    const tip = Number(await tipRes.text());
    type Tx = {
      txid: string;
      vout: { scriptpubkey_address?: string; value: number }[];
      status: { confirmed: boolean; block_height?: number; block_time?: number };
    };
    const txs = (await txRes.json()) as Tx[];
    return txs
      .map((t) => {
        const sats = t.vout.filter((o) => o.scriptpubkey_address === address).reduce((s, o) => s + o.value, 0);
        return {
          txid: t.txid,
          amountBtc: sats / 1e8,
          confirmations: t.status.confirmed && t.status.block_height ? Math.max(1, tip - t.status.block_height + 1) : 0,
          time: t.status.block_time ?? null,
        };
      })
      .filter((d) => d.amountBtc > 0);
  });
