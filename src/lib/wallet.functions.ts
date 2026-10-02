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
