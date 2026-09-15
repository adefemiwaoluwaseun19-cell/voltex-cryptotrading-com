import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { AppHeader } from "@/components/AppHeader";
import { formatUsd, portfolioValue } from "@/lib/market-data";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Account and security — Voltex" },
      {
        name: "description",
        content:
          "Manage your Voltex account: verification status, payment methods, security settings and price alerts.",
      },
      { property: "og:title", content: "Account and security — Voltex" },
      {
        property: "og:description",
        content: "Verification, payment methods, security settings and alerts.",
      },
    ],
  }),
  component: ProfilePage,
});

const groups = [
  {
    title: "Account",
    rows: ["Personal details", "Identity verification", "Payment methods", "Withdrawal addresses"],
  },
  {
    title: "Security",
    rows: ["Two-factor authentication", "Passkeys and devices", "Anti-phishing code", "Login history"],
  },
  {
    title: "Preferences",
    rows: ["Price alerts", "Display currency", "Notifications", "Sign out"],
  },
];

function ProfilePage() {
  return (
    <AppShell>
      <AppHeader title="Profile" />

      <section className="mt-5 px-5">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-gradient-card p-4">
          <div className="grid size-14 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-accent text-base font-semibold ring-2 ring-border">
            JD
          </div>
          <div className="min-w-0">
            <h1 className="font-display text-lg font-semibold leading-tight">Jordan Doyle</h1>
            <p className="truncate text-xs text-muted-foreground">jordan.doyle@voltex.app</p>
            <span className="mt-1.5 inline-flex rounded-full bg-up/15 px-2 py-0.5 text-[10px] font-semibold text-up">
              Verified · Tier 2
            </span>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Balance</p>
            <p className="num mt-1 text-sm font-semibold">{formatUsd(portfolioValue)}</p>
          </div>
          <div className="rounded-xl border border-border bg-surface p-3">
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Daily limit</p>
            <p className="num mt-1 text-sm font-semibold">$100,000.00</p>
          </div>
        </div>
      </section>

      {groups.map((group) => (
        <section key={group.title} className="mt-5 px-5">
          <h2 className="mb-3 font-display text-base font-semibold">{group.title}</h2>
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
            {group.rows.map((row) => (
              <button
                key={row}
                type="button"
                className="flex w-full items-center justify-between px-3 py-3.5 text-left text-sm font-medium"
              >
                {row}
                <span className="text-muted-foreground">›</span>
              </button>
            ))}
          </div>
        </section>
      ))}
    </AppShell>
  );
}
