import { Link, useNavigate } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'
import { Badge } from '@/components/ui/Badge'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useWantedMissing } from '@/hooks/useWantedMissing'
import { serviceAccent } from '@/lib/serviceColors'

export function WantedPage() {
  const navigate = useNavigate()
  const { isDemo, hydrated } = useConfiguredStack()
  const wanted = useWantedMissing(!isDemo)

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  return (
    <div className="space-y-4 px-4 pt-4 lg:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Wanted</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Missing monitored episodes and movies
        </p>
      </div>

      {isDemo ? (
        <EmptyState
          title="Demo mode"
          description="Add Sonarr or Radarr in Settings to load missing items."
        />
      ) : !wanted.hasSources ? (
        <EmptyState
          title="No *arr services"
          description="Configure Sonarr or Radarr to see wanted/missing."
        />
      ) : wanted.status === 'loading' ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading missing…</p>
      ) : wanted.status === 'error' ? (
        <EmptyState title="Couldn’t load wanted" description={wanted.error} />
      ) : wanted.items.length === 0 ? (
        <EmptyState title="Nothing missing" description="Monitored library looks complete." />
      ) : (
        <div className="panel divide-y divide-[var(--color-border)] overflow-hidden rounded-2xl">
          {wanted.items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => navigate(titlePath(item.titleId))}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5 active:scale-[0.99]"
            >
              <div className="min-w-0 flex-1">
                <div className="mb-1">
                  <Badge color={serviceAccent(item.service)}>{item.service}</Badge>
                </div>
                <p className="truncate text-sm font-medium">{item.title}</p>
                <p className="truncate text-xs text-[var(--color-muted-foreground)]">
                  {item.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <p className="pb-2 text-center text-xs text-[var(--color-muted-foreground)]">
        <Link to="/settings" className="text-[var(--color-accent)]">
          Settings
        </Link>
      </p>
    </div>
  )
}
