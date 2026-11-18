export function PageSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="page-pad space-y-4" aria-busy aria-label="Loading">
      <div className="space-y-2">
        <div className="skeleton h-8 w-36 rounded-lg" />
        <div className="skeleton h-4 w-52 rounded-md" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="skeleton h-[5.5rem] rounded-[var(--radius-2xl)] border border-[var(--color-hairline)]"
          style={{ animationDelay: `${index * 80}ms` }}
        />
      ))}
    </div>
  )
}
