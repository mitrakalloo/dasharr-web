import { useEffect, useState } from 'react'
import { toast } from 'sonner'

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
    <BottomSheet open={open} onClose={onClose} title={title}>
      {onAutoSearch ? (
        <Button
          variant="secondary"
          className="mb-3 w-full"
          onClick={() => {
            void onAutoSearch()
              .then(onClose)
              .catch((err: unknown) =>
                toast.error(err instanceof Error ? err.message : 'Auto-search failed'),
              )
          }}
        >
          Automatic search instead
        </Button>
      ) : null}

      {status === 'loading' ? (
        <p className="py-6 text-center text-sm text-[var(--color-muted-foreground)]">
          Searching indexers…
        </p>
      ) : null}

      {status === 'error' ? <EmptyState title="Search failed" description={error} /> : null}

      {status === 'success' && releases.length === 0 ? (
        <EmptyState title="No releases" description="Indexers didn’t return anything for this title." />
      ) : null}

      {status === 'success' ? (
        <div className="space-y-2">
          {releases.slice(0, 40).map((release) => (
            <div
              key={`${release.indexerId}-${release.guid}`}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-3 py-2"
            >
              <p className="line-clamp-2 text-sm font-medium">{release.title}</p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                {release.indexer ?? 'Indexer'} · {release.quality?.quality?.name ?? 'Unknown'} ·{' '}
                {formatBytes(release.size)}
                {typeof release.seeders === 'number' ? ` · ${release.seeders} seeders` : ''}
              </p>
              <Button
                variant="soft"
                className="mt-2 min-h-10 w-full text-xs"
                disabled={grabbing === release.guid}
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
                {grabbing === release.guid ? 'Grabbing…' : 'Grab'}
              </Button>
            </div>
          ))}
        </div>
      ) : null}
    </BottomSheet>
  )
}
