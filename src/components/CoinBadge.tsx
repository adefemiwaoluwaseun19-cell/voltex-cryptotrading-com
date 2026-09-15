import { cn } from "@/lib/utils";

export function CoinBadge({
  glyph,
  swatch,
  className,
}: {
  glyph: string;
  swatch: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br text-xs font-bold text-foreground",
        swatch,
        className ?? "size-9",
      )}
    >
      {glyph}
    </div>
  );
}
