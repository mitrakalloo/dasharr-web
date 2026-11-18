export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3 px-4 pt-6" aria-busy aria-label="Loading">
      <div className="h-7 w-40 animate-pulse rounded-lg bg-white/8" />
      <div className="h-4 w-56 animate-pulse rounded bg-white/5" />
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="h-20 animate-pulse rounded-2xl border border-[var(--color-border)] bg-white/5"
        />
      ))}
    </div>
  )
}
