import { Link, useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadHistory } from '@/hooks/useDownloadHistory'

export function HomeRecentDownloads() {
  const navigate = useNavigate()
  const { isDemo, hasAny } = useConfiguredStack()
  const history = useDownloadHistory(!isDemo && hasAny('sonarr', 'radarr'))
  const items = history.items.slice(0, 6)

  if (isDemo || !hasAny('sonarr', 'radarr')) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Recently downloaded</h2>
        <Link to="/history" className="min-h-[var(--tap)] content-center text-sm text-[var(--color-accent)]">
          History
        </Link>
      </div>
      {history.status === 'loading' ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading imports…</p>
      ) : items.length === 0 ? (
        <EmptyState title="No recent imports" description="Grabs will show up here." />
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              disabled={!item.titleId}
              onClick={() => {
                if (item.titleId) navigate(titlePath(item.titleId))
              }}
              className={`flex w-full items-center justify-between gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-3 text-left transition ${
                item.titleId ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default opacity-80'
              }`}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="block truncate text-xs text-[var(--color-muted-foreground)]">
                  {item.subtitle} · {item.eventType}
                </span>
              </span>
              <span className="shrink-0 text-[10px] uppercase text-[var(--color-muted-foreground)]">
                {item.service}
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
