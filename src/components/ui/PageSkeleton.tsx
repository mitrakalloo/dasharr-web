interface PageSkeletonProps {
  rows?: number
  variant?: 'list' | 'grid' | 'dashboard' | 'detail' | 'calendar'
}

export function PageSkeleton({ rows = 4, variant = 'list' }: PageSkeletonProps) {
  if (variant === 'detail') {
    return (
      <div className="space-y-6 pb-10" aria-busy aria-label="Loading">
        <div className="border-b border-[var(--color-hairline)] bg-[var(--color-card)]/60 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-[var(--content-max)] gap-5">
            <div className="skeleton h-44 w-28 shrink-0 rounded-[var(--radius-lg)]" />
            <div className="flex-1 space-y-3 self-end">
              <div className="skeleton h-3.5 w-24 rounded-full" />
              <div className="skeleton h-8 w-3/5 rounded-lg" />
              <div className="skeleton h-4 w-48 rounded-md" />
              <div className="skeleton h-3.5 w-40 rounded-md" />
            </div>
          </div>
        </div>
        <div className="page-pad grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="space-y-4">
            <div className="skeleton h-28 rounded-[var(--radius-2xl)]" />
            <div className="skeleton h-24 rounded-[var(--radius-2xl)]" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="skeleton h-16 rounded-[var(--radius-xl)]"
                style={{ animationDelay: `${index * 70}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (variant === 'dashboard') {
    return (
      <div className="page-pad space-y-5" aria-busy aria-label="Loading">
        <div className="flex items-center gap-2">
          <div className="skeleton h-9 w-24 rounded-full" />
          <div className="skeleton h-9 w-28 rounded-full" />
          <div className="skeleton h-9 w-20 rounded-full" />
        </div>
        <div className="skeleton h-40 rounded-[var(--radius-2xl)]" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="skeleton h-20 rounded-[var(--radius-xl)]"
              style={{ animationDelay: `${i * 60}ms` }}
            />
          ))}
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="skeleton h-36 rounded-[var(--radius-2xl)]" />
          <div className="skeleton h-36 rounded-[var(--radius-2xl)]" />
        </div>
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className="page-pad space-y-5" aria-busy aria-label="Loading">
        <div className="space-y-2">
          <div className="skeleton h-8 w-36 rounded-lg" />
          <div className="skeleton h-4 w-56 rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: Math.max(rows, 6) }).map((_, index) => (
            <div
              key={index}
              className="skeleton h-28 rounded-[var(--radius-2xl)] border border-[var(--color-hairline)]"
              style={{ animationDelay: `${index * 60}ms` }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'calendar') {
    return (
      <div className="page-pad space-y-5" aria-busy aria-label="Loading">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="skeleton h-8 w-36 rounded-lg" />
            <div className="skeleton h-4 w-52 rounded-md" />
          </div>
          <div className="skeleton h-10 w-36 rounded-[var(--radius-lg)]" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
          <div className="skeleton h-80 rounded-[var(--radius-2xl)]" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="skeleton h-20 rounded-[var(--radius-xl)]"
                style={{ animationDelay: `${index * 70}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-pad space-y-4" aria-busy aria-label="Loading">
      <div className="space-y-2">
        <div className="skeleton h-8 w-36 rounded-lg" />
        <div className="skeleton h-4 w-52 rounded-md" />
      </div>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="skeleton h-20 rounded-[var(--radius-2xl)] border border-[var(--color-hairline)]"
          style={{ animationDelay: `${index * 75}ms` }}
        />
      ))}
    </div>
  )
}
