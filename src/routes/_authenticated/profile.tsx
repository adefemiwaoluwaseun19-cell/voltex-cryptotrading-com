import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { getIsAdmin } from "@/lib/withdraw.functions";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Bitcoin, Check, Copy, LogOut } from "lucide-react";
import { getBtcAddress, getBtcDeposits } from "@/lib/wallet.functions";

function BtcDepositsPanel() {
  const fetchDeposits = useServerFn(getBtcDeposits);
  const { data, isLoading } = useQuery({
    queryKey: ["btc-deposits"],
    queryFn: () => fetchDeposits(),
    refetchInterval: 60_000,
  });
  return (
    <section className="mt-5 px-5">
      <h2 className="mb-3 font-display text-base font-semibold">Bitcoin deposit activity</h2>
      <div className="rounded-lg border border-border bg-surface p-3">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No incoming Bitcoin transactions detected yet. Deposits to your address appear here automatically.
          </p>
        ) : (
          <ul className="stagger-list divide-y divide-border">
            {data.map((d) => (
              <li key={d.txid} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="num truncate text-sm font-semibold">+{d.amountBtc.toFixed(8)} BTC</p>
                    <a
                      href={`https://mempool.space/tx/${d.txid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="num truncate text-[11px] text-muted-foreground underline decoration-border underline-offset-2 hover:text-accent"
                      aria-label={`View transaction ${d.txid} on a public block explorer`}
                    >
                      {d.txid}
                    </a>
                  </div>
                <span
                  className={
                    d.confirmations >= 3
                      ? "shrink-0 rounded-full bg-up/15 px-2 py-0.5 text-[10px] font-semibold text-up"
                      : "shrink-0 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent"
                  }
                >
                  {d.confirmations >= 3 ? "Confirmed" : `Pending · ${d.confirmations}/3`}
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-2 text-[11px] text-muted-foreground">
          Tap a transaction ID to view it on the public Bitcoin block explorer. Deposit tracking is shown for
          reference only and does not change your traded balances.
        </p>
      </div>
    </section>
  );
}

function BtcAddressCard() {
  const fetchAddr = useServerFn(getBtcAddress);
  const { data, isLoading } = useQuery({ queryKey: ["btc-address"], queryFn: () => fetchAddr(), staleTime: Infinity });
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    if (!data?.address) return;
    await navigator.clipboard.writeText(data.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <section className="mt-5 px-5">
      <h2 className="mb-3 font-display text-base font-semibold">Your Bitcoin deposit address</h2>
      <div className="rounded-lg border border-border bg-surface p-3">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Bitcoin className="size-4 text-accent" /> Send only BTC on the Bitcoin network
        </div>
        {isLoading ? (
          <Skeleton className="mt-2 h-5 w-full" />
        ) : data?.address ? (
          <div className="mt-2 flex items-center gap-2">
            <code className="num min-w-0 flex-1 break-all text-sm font-semibold">{data.address}</code>
            <button type="button" onClick={copy} aria-label="Copy address" className="pressable rounded-md border border-border p-2 hover:border-brand">
              {copied ? <Check className="size-4 text-up" /> : <Copy className="size-4" />}
            </button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">Bitcoin deposits are being set up. Check back soon.</p>
        )}
      </div>
    </section>
  );
}
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { CashoutPanel } from "@/components/CashoutPanel";
import { Skeleton } from "@/components/Placeholders";
import { formatUsd } from "@/lib/market-data";
import { useAccount } from "@/lib/use-account";
import { useLivePortfolio } from "@/lib/use-live-prices";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Account and security — Voltex" },
      {
        name: "description",
        content: "Manage your Voltex account: profile, balance, security and sign out.",
      },
      { property: "og:title", content: "Account and security — Voltex" },
      { property: "og:description", content: "Profile, balance, security settings and alerts." },
    ],
  }),
  component: ProfilePage,
});

const groups = [
  {
    title: "Preferences",
    rows: ["Price alerts", "Display currency", "Notifications"],
  },
  {
    title: "Security",
    rows: ["Two-factor authentication", "Passkeys and devices", "Login history"],
  },
];

function ProfilePage() {
  const navigate = useNavigate();
  const isAdminFn = useServerFn(getIsAdmin);
  const isAdmin = useQuery({ queryKey: ["is-admin"], queryFn: () => isAdminFn() });
  const queryClient = useQueryClient();
  const { data: account, holdingsMap, isLoading: accountLoading } = useAccount();
  const { total } = useLivePortfolio(holdingsMap);

  const name = account?.displayName ?? "Trader";
  const initials =
    name
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "V";
  const grandTotal = (account?.cashUsd ?? 0) + total;

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <AppShell>
      <AppHeader title="Profile" />
      {isAdmin.data && (
        <div className="mt-4 px-5">
          <Link to="/admin" className="pressable block rounded-lg border border-accent bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">
            Review send requests →
          </Link>
        </div>
      )}

      <section className="mt-5 px-5">
        <div className="animate-fade-in flex items-center gap-3 rounded-lg border border-border bg-gradient-card p-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-accent text-base font-semibold ring-2 ring-border">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold leading-tight">{name}</h1>
            <p className="truncate text-xs text-muted-foreground">{account?.email ?? "…"}</p>
            <span className="mt-1.5 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
              Verified trading account
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Total balance</p>
            {accountLoading ? (
              <Skeleton className="mt-1.5 h-5 w-24" />
            ) : (
              <p className="num mt-1 text-sm font-semibold">{formatUsd(grandTotal)}</p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Cash available</p>
            {accountLoading ? (
              <Skeleton className="mt-1.5 h-5 w-20" />
            ) : (
              <p className="num mt-1 text-sm font-semibold">{formatUsd(account?.cashUsd ?? 0)}</p>
            )}
          </div>
        </div>
      </section>

      <BtcAddressCard />
      <BtcDepositsPanel />

      {groups.map((group) => (
        <section key={group.title} className="mt-5 px-5">
          <h2 className="mb-3 font-display text-base font-semibold">{group.title}</h2>
          <div className="stagger-list divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
            {group.rows.map((row) => (
              <button
                key={row}
                type="button"
                className="pressable flex w-full items-center justify-between px-3 py-3.5 text-left text-sm font-medium transition-colors hover:bg-secondary"
              >
                {row}
                <span className="text-muted-foreground">›</span>
              </button>
            ))}
          </div>
        </section>
      ))}

      <section className="mt-5 px-5">
        <button
          type="button"
          onClick={handleSignOut}
          className="pressable flex w-full items-center justify-center gap-2 rounded-lg border border-down/40 bg-down/10 px-3 py-3.5 text-sm font-semibold text-down"
        >
          <LogOut className="size-4" strokeWidth={1.8} />
          Sign out
        </button>
      </section>
      <CashoutPanel cash={account?.cashUsd ?? 0} />
    </AppShell>
  );
}
