import { useState } from 'react'
import { Folder } from 'lucide-react'

interface TitleOverviewProps {
  overview: string
  path: string
}

export function TitleOverview({ overview, path }: TitleOverviewProps) {
  const [expanded, setExpanded] = useState(false)
  const long = overview.length > 210
  const text = !expanded && long ? `${overview.slice(0, 210).trim()}…` : overview

  return (
    <section className="panel space-y-2.5 rounded-[var(--radius-2xl)] p-4">
      <h2 className="font-display text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
        Overview
      </h2>
      <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">{text}</p>
      {long ? (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="inline-flex min-h-9 cursor-pointer items-center text-xs font-semibold text-[var(--color-primary)] transition hover:opacity-80 active:scale-95"
        >
          {expanded ? 'Show less' : 'Read more'}
        </button>
      ) : null}
      {path ? (
        <div className="flex items-center gap-2 rounded-[var(--radius-lg)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] px-2.5 py-1.5 text-[11px] text-[var(--color-muted-foreground)]">
          <Folder className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate font-mono">{path}</span>
        </div>
      ) : null}
    </section>
  )
}
