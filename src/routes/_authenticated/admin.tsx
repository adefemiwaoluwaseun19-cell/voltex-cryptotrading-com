import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { formatUsd } from "@/lib/market-data";
import { getIsAdmin, listAllWithdrawals, reviewWithdrawal } from "@/lib/withdraw.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Review send requests — Voltex" },
      { name: "description", content: "Approve or reject customer requests to send crypto to external wallets." },
      { property: "og:title", content: "Review send requests — Voltex" },
      { property: "og:description", content: "Approve or reject customer send requests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const isAdminFn = useServerFn(getIsAdmin);
  const listFn = useServerFn(listAllWithdrawals);
  const reviewFn = useServerFn(reviewWithdrawal);
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const admin = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const list = useQuery({ queryKey: ["all-withdrawals"], queryFn: () => listFn(), enabled: admin.data === true });
  const review = useMutation({
    mutationFn: (input: { id: string; approve: boolean }) => reviewFn({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["all-withdrawals"] }),
    onError: (e: Error) => setError(e.message),
  });

  const copy = (text: string) => navigator.clipboard?.writeText(text);

  return (
    <AppShell>
      <AppHeader title="Review" />
      <div className="mt-5 px-5 pb-8">
        <h1 className="font-display text-2xl font-semibold tracking-tight">Send requests</h1>
        {admin.isLoading ? (
          <p className="mt-3 text-sm text-muted-foreground">Loading…</p>
        ) : admin.data !== true ? (
          <p className="mt-3 text-sm text-muted-foreground">You don't have access to this page.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-muted-foreground">
              Pay out approved requests from your own wallet. Rejecting returns the coins to the customer.
            </p>
            {error && <p className="mt-3 rounded-md bg-down/15 px-3 py-2 text-xs text-down">{error}</p>}
            {list.isLoading && <p className="mt-4 text-sm text-muted-foreground">Loading requests…</p>}
            {list.data?.length === 0 && <p className="mt-4 text-sm text-muted-foreground">No send requests yet.</p>}
            <ul className="mt-4 space-y-3">
              {list.data?.map((w) => (
                <li key={w.id} className="rounded-lg border border-border bg-secondary p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="num text-sm font-semibold">
                      {w.units.toFixed(8)} {w.coin_id.toUpperCase()}
                    </span>
                    <span className={w.status === "completed" ? "text-up" : w.status === "rejected" ? "text-down" : "text-accent"}>
                      {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                    </span>
                  </div>
                  <p className="num mt-1 text-muted-foreground">
                    ≈ {formatUsd(w.units * w.price_usd)} · {new Date(w.created_at).toLocaleString()}
                  </p>
                  <button
                    type="button"
                    onClick={() => copy(w.address)}
                    className="mt-2 block w-full break-all text-left font-mono text-[11px]"
                    title="Copy address"
                  >
                    {w.address}
                  </button>
                  {w.status === "pending" && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={review.isPending}
                        onClick={() => {
                          setError(null);
                          review.mutate({ id: w.id, approve: true });
                        }}
                        className="pressable rounded-md bg-up/15 py-2 font-semibold text-up disabled:opacity-40"
                      >
                        Mark as paid
                      </button>
                      <button
                        type="button"
                        disabled={review.isPending}
                        onClick={() => {
                          setError(null);
                          review.mutate({ id: w.id, approve: false });
                        }}
                        className="pressable rounded-md bg-down/15 py-2 font-semibold text-down disabled:opacity-40"
                      >
                        Reject &amp; refund
                      </button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </AppShell>
  );
}
