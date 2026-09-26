import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
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
        content: "Manage your Voltex account: profile, demo cash balance, security and sign out.",
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

      <section className="mt-5 px-5">
        <div className="animate-fade-in flex items-center gap-3 rounded-lg border border-border bg-gradient-card p-4">
          <div className="grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-accent text-base font-semibold ring-2 ring-border">
            {initials}
          </div>
          <div className="min-w-0">
            <h1 className="truncate font-display text-lg font-semibold leading-tight">{name}</h1>
            <p className="truncate text-xs text-muted-foreground">{account?.email ?? "…"}</p>
            <span className="mt-1.5 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
              Demo trading account
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Total balance</p>
            {isLoading || portfolioLoading ? (
              <Skeleton className="mt-1.5 h-5 w-24" />
            ) : (
              <p className="num mt-1 text-sm font-semibold">{formatUsd(grandTotal)}</p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Cash available</p>
            {isLoading ? (
              <Skeleton className="mt-1.5 h-5 w-20" />
            ) : (
              <p className="num mt-1 text-sm font-semibold">{formatUsd(account?.cashUsd ?? 0)}</p>
            )}
          </div>
        </div>
      </section>

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
    </AppShell>
  );
}
