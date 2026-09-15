import { Link } from "@tanstack/react-router";

const items = [
  { to: "/", glyph: "◈", label: "Home" },
  { to: "/markets", glyph: "▤", label: "Markets" },
  { to: "/trade", glyph: "⇄", label: "Trade" },
  { to: "/portfolio", glyph: "◔", label: "Portfolio" },
  { to: "/profile", glyph: "◎", label: "Profile" },
] as const;

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-[480px] grid-cols-5 border-t border-border bg-background/95 backdrop-blur">
      {items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === "/" }}
          className="flex flex-col items-center gap-1 py-3 text-[10px] font-semibold text-muted-foreground transition-colors"
          activeProps={{ className: "text-brand" }}
        >
          <span className="text-base leading-none">{item.glyph}</span>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
