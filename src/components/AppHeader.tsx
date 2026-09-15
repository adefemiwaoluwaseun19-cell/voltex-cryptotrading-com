import { Link } from "@tanstack/react-router";

export function AppHeader({ title }: { title?: string }) {
  return (
    <header className="flex items-center justify-between px-5 pt-5">
      <Link to="/" className="flex items-center gap-2">
        <div className="grid size-8 place-items-center rounded-lg bg-gradient-brand font-display text-sm font-bold text-primary-foreground">
          V
        </div>
        <span className="font-display text-lg font-semibold tracking-tight">
          {title ?? "Voltex"}
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-9 place-items-center rounded-full border border-border bg-secondary text-sm text-muted-foreground"
        >
          <span className="block size-3.5 rounded-tr-md border-r-2 border-t-2" />
        </button>
        <Link
          to="/profile"
          className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-accent text-xs font-semibold ring-2 ring-border"
        >
          JD
        </Link>
      </div>
    </header>
  );
}
