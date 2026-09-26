import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";
import { FloatingIcons } from "./FloatingIcons";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell relative mx-auto min-h-screen w-full max-w-[480px] overflow-hidden bg-background pb-[98px]">
      <div className="h-1 w-full bg-gradient-rail" />
      <div className="app-grid pointer-events-none absolute inset-x-0 top-0 h-72" />
      <FloatingIcons />
      <main className="page-enter relative z-10">{children}</main>
      <BottomNav />
    </div>
  );
}
