import { Link } from "@tanstack/react-router";
import { ArrowLeftRight, ChartNoAxesCombined, House, PieChart, UserRound } from "lucide-react";

const items = [
  { to: "/dashboard", icon: House, label: "Home" },
  { to: "/markets", icon: ChartNoAxesCombined, label: "Markets" },
  { to: "/trade", icon: ArrowLeftRight, label: "Trade" },
  { to: "/portfolio", icon: PieChart, label: "Portfolio" },
  { to: "/profile", icon: UserRound, label: "Profile" },
] as const;

export function BottomNav() {
  return (
    <nav className="bottom-nav fixed inset-x-0 bottom-0 z-30 mx-auto grid max-w-[480px] grid-cols-5 border-t border-border bg-background/90 px-2 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl">
      {items.map((item) => {
        const Icon = item.icon;
        return (
        <Link
          key={item.to}
          to={item.to}
          activeOptions={{ exact: item.to === "/dashboard" }}
          className="nav-link relative flex min-h-14 flex-col items-center justify-center gap-1 rounded-md text-[10px] font-semibold text-muted-foreground transition-colors duration-200"
          activeProps={{ className: "text-brand" }}
        >
          <Icon className="nav-icon size-[19px]" strokeWidth={1.8} />
          {item.label}
        </Link>
      )})}
    </nav>
  );
}
