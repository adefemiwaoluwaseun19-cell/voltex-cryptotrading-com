import type { ReactNode } from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton rounded-md ${className}`} aria-hidden="true" />;
}

export function RowSkeletons({ count = 6, spark = true }: { count?: number; spark?: boolean }) {
  return (
    <div className="stagger-list space-y-2" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-3">
          <Skeleton className="size-9 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-2.5 w-14" />
          </div>
          {spark && <Skeleton className="h-7 w-14" />}
          <div className="flex w-[86px] flex-col items-end gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-2.5 w-10" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="relative h-full w-full" role="status" aria-label="Loading chart">
      <div className="absolute inset-0 flex flex-col justify-between py-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-px w-full bg-border/60" />
        ))}
      </div>
      <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="relative h-full w-full" aria-hidden="true">
        <path
          className="chart-skeleton-line"
          d="M0,22 C10,18 18,26 28,20 S45,8 55,14 S72,24 82,12 S95,10 100,8"
          fill="none"
          stroke="var(--brand)"
          strokeWidth="1.6"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength="1"
        />
      </svg>
    </div>
  );
}

export function EmptyState({ icon, title, body, action }: { icon: ReactNode; title: string; body: string; action?: ReactNode }) {
  return (
    <div className="animate-fade-in flex flex-col items-center rounded-lg border border-dashed border-border bg-surface/60 px-6 py-10 text-center">
      <div className="grid size-12 place-items-center rounded-full bg-brand/15 text-brand">{icon}</div>
      <p className="mt-3 font-display text-sm font-semibold">{title}</p>
      <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-muted-foreground">{body}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
