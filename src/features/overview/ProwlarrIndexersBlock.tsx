import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useProwlarrIndexers } from '@/hooks/useProwlarrIndexers'
import { serviceAccent } from '@/lib/serviceColors'
import { useConfigStore } from '@/stores/configStore'

interface ProwlarrIndexersBlockProps {
  onSelect?: () => void
}

export function ProwlarrIndexersBlock({ onSelect }: ProwlarrIndexersBlockProps) {
  const { isDemo, has } = useConfiguredStack()
  const services = useConfigStore((state) => state.services)
  const prowlarr = services.find((s) => s.enabled && s.type === 'prowlarr')
  const indexers = useProwlarrIndexers(!isDemo && has('prowlarr'))

  if (isDemo || !has('prowlarr')) return null

  return (
    <div className="space-y-2.5 border-t border-[var(--color-hairline)] pt-4">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={prowlarr ? `/service/${prowlarr.id}` : '/indexers'}
          onClick={onSelect}
          className="font-display text-sm font-semibold tracking-tight hover:underline"
          style={{ color: serviceAccent('prowlarr') }}
        >
          Prowlarr indexers
        </Link>
        <Link
          to="/indexers"
          onClick={onSelect}
          className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--color-primary)] hover:underline"
        >
          Search releases
          <ChevronRight className="size-3.5" aria-hidden />
        </Link>
      </div>
      {indexers.status === 'loading' ? (
        <div className="space-y-2">
          <div className="skeleton h-12 rounded-[var(--radius-lg)]" />
          <div className="skeleton h-12 rounded-[var(--radius-lg)]" />
        </div>
      ) : null}
      {indexers.status === 'error' ? (
        <p className="text-xs text-[var(--color-destructive)]">{indexers.error}</p>
      ) : null}
      {indexers.status === 'success'
        ? indexers.data.slice(0, 12).map((indexer) => (
            <Link
              key={indexer.id}
              to={prowlarr ? `/service/${prowlarr.id}` : '/indexers'}
              onClick={onSelect}
              className="flex min-h-11 items-center justify-between gap-2 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3 py-2 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)]"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-[var(--color-foreground)]">
                  {indexer.name}
                </p>
                <p className="text-[11px] capitalize text-[var(--color-muted-foreground)]">
                  {indexer.protocol} · priority {indexer.priority}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1.5">
                <Badge dot tone={indexer.enable ? 'success' : 'neutral'}>
                  {indexer.enable ? 'On' : 'Off'}
                </Badge>
                <ChevronRight className="size-3.5 text-[var(--color-muted-foreground)]" aria-hidden />
              </div>
            </Link>
          ))
        : null}
      {indexers.status === 'success' && indexers.data.length === 0 ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">No indexers configured.</p>
      ) : null}
    </div>
  )
}
