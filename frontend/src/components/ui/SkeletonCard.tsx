export function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-shell bg-panel shadow-panel">
      <div className={`animate-pulse bg-[var(--color-surface-soft)] ${compact ? "aspect-video" : "aspect-video"}`} />
      <div className="grid gap-3 px-[22px] py-5">
        <div className="h-5 w-4/5 animate-pulse rounded-full bg-[var(--color-surface-soft)]" />
        {!compact ? <div className="h-4 w-1/2 animate-pulse rounded-full bg-[var(--color-surface-soft)]" /> : null}
      </div>
    </div>
  );
}
