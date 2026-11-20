import { useEffect, useState } from 'react'
import { Download, Sparkles } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { formatBytes } from '@/lib/format'
import type { ArrRelease } from '@/lib/services/sonarr'

interface ReleasePickerSheetProps {
  open: boolean
  title: string
  onClose: () => void
  loadReleases: () => Promise<ArrRelease[]>
  onGrab: (release: ArrRelease) => Promise<void>
  onAutoSearch?: () => Promise<void>
}

export function ReleasePickerSheet({
  open,
  title,
  onClose,
  loadReleases,
  onGrab,
  onAutoSearch,
}: ReleasePickerSheetProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const [releases, setReleases] = useState<ArrRelease[]>([])
  const [grabbing, setGrabbing] = useState<string | null>(null)
  const [autoBusy, setAutoBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    let cancelled = false
    setStatus('loading')
    setError('')
    void loadReleases()
      .then((data) => {
        if (cancelled) return
        setReleases(data)
        setStatus('success')
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setStatus('error')
        setError(err instanceof Error ? err.message : 'Search failed')
      })
    return () => {
      cancelled = true
    }
  }, [open, loadReleases])

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={title}
      subtitle="Interactive indexer results"
    >
      <div className="space-y-3">
        {onAutoSearch ? (
          <Button
            variant="secondary"
            className="w-full"
            loading={autoBusy}
            onClick={() => {
              setAutoBusy(true)
              void onAutoSearch()
                .then(onClose)
                .catch((err: unknown) =>
                  toast.error(err instanceof Error ? err.message : 'Auto-search failed'),
                )
                .finally(() => setAutoBusy(false))
            }}
          >
            <Sparkles className="size-4" />
            Run automatic search instead
          </Button>
        ) : null}

        {status === 'loading' ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[var(--radius-xl)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] p-3"
              >
                <div className="skeleton h-4 w-5/6" />
                <div className="skeleton mt-2 h-3 w-44" />
                <div className="skeleton mt-3 h-9 w-full rounded-full" />
              </div>
            ))}
          </div>
        ) : null}

        {status === 'error' ? (
          <EmptyState compact title="Search failed" description={error} />
        ) : null}

        {status === 'success' && releases.length === 0 ? (
          <EmptyState
            compact
            title="No releases found"
            description="Indexers didn’t return any matching releases for this title."
          />
        ) : null}

        {status === 'success' && releases.length > 0 ? (
          <div className="space-y-2.5">
            {releases.slice(0, 40).map((release) => (
              <div
                key={`${release.indexerId}-${release.guid}`}
                className="rounded-[var(--radius-xl)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] p-3"
              >
                <p className="line-clamp-2 break-words text-sm font-medium text-[var(--color-foreground)]">
                  {release.title}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted-foreground)]">
                  <Badge>{release.indexer ?? 'Indexer'}</Badge>
                  <Badge>{release.quality?.quality?.name ?? 'Unknown'}</Badge>
                  <span className="tabular font-medium text-[var(--color-foreground)]">
                    {formatBytes(release.size)}
                  </span>
                  {typeof release.seeders === 'number' ? (
                    <Badge tone={release.seeders > 0 ? 'success' : 'warning'} className="tabular">
                      {release.seeders} seeders
                    </Badge>
                  ) : null}
                </div>
                <Button
                  size="sm"
                  variant="soft"
                  className="mt-2.5 w-full"
                  loading={grabbing === release.guid}
                  disabled={grabbing !== null}
                  onClick={() => {
                    setGrabbing(release.guid)
                    void onGrab(release)
                      .then(onClose)
                      .catch((err: unknown) =>
                        toast.error(err instanceof Error ? err.message : 'Grab failed'),
                      )
                      .finally(() => setGrabbing(null))
                  }}
                >
                  <Download className="size-3.5" />
                  Grab release
                </Button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </BottomSheet>
  )
}
