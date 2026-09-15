import type { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-[480px] overflow-hidden bg-background pb-[86px]">
      <div className="h-1.5 w-full bg-gradient-rail" />
      <div className="pointer-events-none absolute -right-20 -top-24 size-72 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-40 size-60 rounded-full bg-accent/10 blur-3xl" />
      <div className="relative z-10">{children}</div>
      <BottomNav />
    </div>
  );
}
