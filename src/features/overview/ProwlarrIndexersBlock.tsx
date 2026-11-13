import { Badge } from '@/components/ui/Badge'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useProwlarrIndexers } from '@/hooks/useProwlarrIndexers'
import { serviceAccent } from '@/lib/serviceColors'

export function ProwlarrIndexersBlock() {
  const { isDemo, has } = useConfiguredStack()
  const indexers = useProwlarrIndexers(!isDemo && has('prowlarr'))

  if (isDemo || !has('prowlarr')) return null

  return (
    <div className="mt-5 space-y-2">
      <p className="text-sm font-semibold" style={{ color: serviceAccent('prowlarr') }}>
        Prowlarr indexers
      </p>
      {indexers.status === 'loading' ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">Loading indexers…</p>
      ) : null}
      {indexers.status === 'error' ? (
        <p className="text-xs text-rose-300">{indexers.error}</p>
      ) : null}
      {indexers.status === 'success'
        ? indexers.data.slice(0, 12).map((indexer) => (
            <div
              key={indexer.id}
              className="flex min-h-10 items-center justify-between gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{indexer.name}</p>
                <p className="text-[11px] capitalize text-[var(--color-muted-foreground)]">
                  {indexer.protocol} · priority {indexer.priority}
                </p>
              </div>
              <Badge color={indexer.enable ? '#34d399' : '#a1a1aa'}>
                {indexer.enable ? 'On' : 'Off'}
              </Badge>
            </div>
          ))
        : null}
      {indexers.status === 'success' && indexers.data.length === 0 ? (
        <p className="text-xs text-[var(--color-muted-foreground)]">No indexers configured.</p>
      ) : null}
    </div>
  )
}
