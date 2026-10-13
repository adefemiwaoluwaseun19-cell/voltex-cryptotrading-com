import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CreditCard, Landmark } from "lucide-react";
import { formatUsd } from "@/lib/market-data";
import { getMyCashouts, requestCashout } from "@/lib/cashout.functions";

export function CashoutPanel({ cash }: { cash: number }) {
  const qc = useQueryClient();
  const reqFn = useServerFn(requestCashout);
  const listFn = useServerFn(getMyCashouts);
  const list = useQuery({ queryKey: ["cashouts"], queryFn: () => listFn() });
  const [method, setMethod] = useState<"card" | "bank">("card");
  const [amount, setAmount] = useState("");
  const [holder, setHolder] = useState("");
  const [number, setNumber] = useState("");
  const [bank, setBank] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const digits = number.replace(/\D/g, "");
  const amt = Number(amount) || 0;
  const validNumber = method === "card" ? digits.length >= 13 && digits.length <= 19 : digits.length >= 6 && digits.length <= 20;
  const blocked = amt < 10 || amt > cash + 1e-9 || holder.trim().length < 2 || !validNumber;

  const m = useMutation({
    mutationFn: () =>
      reqFn({ data: { amount: amt, method, holder: holder.trim(), last4: digits.slice(-4), bank: method === "bank" ? bank : undefined } }),
    onSuccess: () => {
      setMsg({ ok: true, text: `Withdrawal of ${formatUsd(amt)} requested — usually paid within 1–3 business days.` });
      setAmount(""); setNumber("");
      qc.invalidateQueries({ queryKey: ["account"] });
      qc.invalidateQueries({ queryKey: ["cashouts"] });
      qc.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (e: Error) => setMsg({ ok: false, text: e.message }),
  });

  const input = "mt-1 w-full rounded-xl border border-border bg-secondary px-3 py-3 text-sm outline-none";

  return (
    <section className="mt-5 px-5">
      <div className="rounded-lg border border-border bg-gradient-card p-4">
        <h2 className="text-sm font-semibold">Withdraw to card or bank</h2>
        <p className="num mt-1 text-xs text-muted-foreground">
          Sell crypto to cash first. Cash available · {formatUsd(cash)}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
          {(["card", "bank"] as const).map((k) => (
            <button key={k} type="button" onClick={() => setMethod(k)}
              className={`pressable flex items-center justify-center gap-1.5 rounded-md py-2 text-xs font-semibold ${method === k ? "bg-brand text-brand-foreground" : "text-muted-foreground"}`}>
              {k === "card" ? <CreditCard className="size-3.5" /> : <Landmark className="size-3.5" />}
              {k === "card" ? "Debit / credit card" : "Bank account"}
            </button>
          ))}
        </div>
        <label className="mt-3 block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Amount in USD (min $10)</label>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))} className={input} placeholder="100" />
        <label className="mt-3 block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Name on {method === "card" ? "card" : "account"}</label>
        <input value={holder} onChange={(e) => setHolder(e.target.value)} className={input} autoComplete="name" />
        {method === "bank" && (
          <>
            <label className="mt-3 block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Bank name</label>
            <input value={bank} onChange={(e) => setBank(e.target.value)} className={input} />
          </>
        )}
        <label className="mt-3 block text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
          {method === "card" ? "Card number" : "Account number"}
        </label>
        <input inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value.replace(/[^0-9 ]/g, ""))} className={`${input} font-mono`} autoComplete="off" />
        <p className="mt-1 text-[11px] text-muted-foreground">For your security we only keep the last 4 digits.</p>
        <button type="button" disabled={blocked || m.isPending} onClick={() => { setMsg(null); m.mutate(); }}
          className="action-button mt-4 h-11 w-full rounded-md bg-gradient-brand text-sm font-bold text-primary-foreground shadow-brand disabled:opacity-40">
          {m.isPending ? "Submitting…" : amt > cash ? "Not enough cash" : "Request withdrawal"}
        </button>
        {msg && (
          <p className={`mt-3 rounded-md px-3 py-2 text-center text-xs font-semibold ${msg.ok ? "bg-up/15 text-up" : "bg-down/15 text-down"}`}>{msg.text}</p>
        )}
        {(list.data?.length ?? 0) > 0 && (
          <ul className="mt-4 space-y-2">
            {list.data!.map((w) => (
              <li key={w.id} className="flex justify-between rounded-md bg-secondary p-3 text-xs">
                <span className="num font-semibold">{formatUsd(w.amount_usd)} · {w.method === "card" ? "Card" : "Bank"} •••• {w.last4}</span>
                <span className={w.status === "completed" ? "text-up" : w.status === "rejected" ? "text-down" : "text-accent"}>
                  {w.status === "completed" ? "Paid" : w.status === "rejected" ? "Refunded" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
