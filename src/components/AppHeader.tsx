import { Link } from "@tanstack/react-router";
import { Bell, ShieldCheck } from "lucide-react";
import { useAccount } from "@/lib/use-account";

export function AppHeader({ title }: { title?: string }) {
  const { data: account, isLoading } = useAccount();
  const name = account?.displayName || "Trader";
  const initials =
    name
      .split(/\s+/)
      .map((p) => p[0]?.toUpperCase() ?? "")
      .join("")
      .slice(0, 2) || "V";

  return (
    <header className="flex items-center justify-between px-5 pt-5">
      <Link to="/" className="group flex items-center gap-2.5 transition-opacity active:opacity-70">
        <div className="orbit-ring">
          <div className="logo-pulse grid size-8 place-items-center rounded-md bg-gradient-brand font-display text-sm font-bold text-primary-foreground shadow-brand">
            V
          </div>
        </div>
        <span className="font-display text-lg font-semibold tracking-tight">
          {title ?? "Voltex"}
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="pressable relative grid size-9 place-items-center rounded-full border border-border bg-secondary text-muted-foreground transition-colors hover:text-foreground"
        >
          <Bell className="size-4" strokeWidth={1.8} />
          <span className="ping-dot absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent ring-2 ring-background" />
        </button>
        <Link
          to="/profile"
          aria-label="Open profile"
          className="pressable relative grid size-9 place-items-center rounded-full bg-brand text-xs font-semibold text-brand-foreground ring-2 ring-border"
        >
          {isLoading ? <span className="opacity-60">…</span> : initials}
          <ShieldCheck className="absolute -bottom-0.5 -right-0.5 size-3.5 fill-background text-up" />
        </Link>
      </div>
    </header>
  );
}
