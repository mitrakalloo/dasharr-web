import { useNavigate } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadHistory } from '@/hooks/useDownloadHistory'
import { serviceAccent } from '@/lib/serviceColors'

export function HomeRecentDownloads() {
  const navigate = useNavigate()
  const { isDemo, hasAny } = useConfiguredStack()
  const history = useDownloadHistory(!isDemo && hasAny('sonarr', 'radarr'))
  const items = history.items.slice(0, 6)

  if (isDemo || !hasAny('sonarr', 'radarr')) return null

  return (
    <section className="space-y-3">
      <SectionHeader
        title="Recently downloaded"
        count={items.length}
        actionLabel="History"
        actionTo="/history"
      />
      {history.status === 'loading' ? (
        <div className="space-y-2">
          <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
          <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
        </div>
      ) : items.length === 0 ? (
        <EmptyState compact title="No recent imports" description="Grabs and imports will show up here." />
      ) : (
        <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                navigate(item.titleId ? titlePath(item.titleId) : '/history')
              }}
              className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--color-hover)] active:scale-[0.995]"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="mt-0.5 block truncate text-xs text-[var(--color-muted-foreground)]">
                  {item.subtitle} · {item.eventType}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-2">
                <Badge color={serviceAccent(item.service)}>{item.service}</Badge>
                <ChevronRight className="size-4 text-[var(--color-muted-foreground)]" aria-hidden />
              </span>
            </button>
          ))}
        </div>
      )}
    </section>
  )
}
