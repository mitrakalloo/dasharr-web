import { useState } from 'react'

interface TitleOverviewProps {
  overview: string
  path: string
}

export function TitleOverview({ overview, path }: TitleOverviewProps) {
  const [expanded, setExpanded] = useState(false)
  const long = overview.length > 180
  const text = !expanded && long ? `${overview.slice(0, 180).trim()}…` : overview

  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold">Overview</h2>
      <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">{text}</p>
      {long ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="min-h-10 cursor-pointer text-sm font-medium text-sky-300 active:scale-95"
        >
          {expanded ? 'Show less' : 'Show more'}
        </button>
      ) : null}
      <p className="truncate font-mono text-[11px] text-[var(--color-muted-foreground)]">{path}</p>
    </section>
  )
}
