import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/ui/EmptyState'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { useTautulliSessions } from '@/hooks/useTautulliSessions'
import { getUnraidSnapshot } from '@/lib/services/unraid'
import { useConfigStore } from '@/stores/configStore'

export function HomeTorrentQueueWidget() {
  const { isDemo, hasAny } = useConfiguredStack()
  const queue = useDownloadQueue(
    !isDemo && hasAny('qbittorrent', 'transmission', 'deluge'),
  )
  const torrents = queue.items
    .filter(
      (item) =>
        item.service === 'qbittorrent' ||
        item.service === 'transmission' ||
        item.service === 'deluge',
    )
    .slice(0, 5)

  if (isDemo || !hasAny('qbittorrent', 'transmission', 'deluge')) return null

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Torrent queue</h2>
        <Link to="/queue" className="min-h-[var(--tap)] content-center text-sm text-[var(--color-accent)]">
          Queue
        </Link>
      </div>
      {torrents.length === 0 ? (
        <EmptyState title="No active torrents" description="Torrent clients are idle." />
      ) : (
        <div className="space-y-2">
          {torrents.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5"
            >
              <p className="truncate text-sm font-medium">{item.title}</p>
              <p className="tabular text-xs text-[var(--color-muted-foreground)]">
                {item.progress}% · {item.speed}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export function HomeTautulliStatsWidget() {
  const { isDemo, has } = useConfiguredStack()
  const watching = useTautulliSessions(!isDemo && has('tautulli'))
  if (isDemo || !has('tautulli')) return null
  return (
    <div className="panel flex items-center justify-between rounded-2xl px-4 py-3">
      <div>
        <h2 className="text-sm font-semibold">Tautulli</h2>
        <p className="text-xs text-[var(--color-muted-foreground)]">Active streams</p>
      </div>
      <p className="tabular text-2xl font-semibold text-teal-300">{watching.items.length}</p>
    </div>
  )
}

export function HomeUnraidSnapshotWidget() {
  const { isDemo, has } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const unraid = useConfigStore((state) =>
    state.services.find((service) => service.type === 'unraid' && service.enabled),
  )
  const [summary, setSummary] = useState<string>('…')

  useEffect(() => {
    if (!unraid || isDemo) return
    let cancelled = false
    void getUnraidSnapshot(settings, unraid)
      .then((data) => {
        if (cancelled) return
        const used = Number(data.capacity?.used ?? 0)
        const total = Number(data.capacity?.total ?? 0)
        const pct = total > 0 ? Math.round((used / total) * 100) : 0
        setSummary(`${data.state} · ${pct}% used · ${data.containers.length} containers`)
      })
      .catch(() => {
        if (!cancelled) setSummary('Unavailable')
      })
    return () => {
      cancelled = true
    }
  }, [unraid, isDemo, settings])

  if (isDemo || !has('unraid')) return null
  return (
    <div className="panel rounded-2xl px-4 py-3">
      <h2 className="text-sm font-semibold">Unraid</h2>
      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">{summary}</p>
    </div>
  )
}

export function HomeHouseholdRecsWidget() {
  const { isDemo, has } = useConfiguredStack()
  if (isDemo || !has('seerr') || !has('tautulli')) return null
  return (
    <div className="panel space-y-2 rounded-2xl p-4">
      <h2 className="text-sm font-semibold">For your household</h2>
      <p className="text-xs text-[var(--color-muted-foreground)]">
        Open Discover to request titles based on what the house has been watching.
      </p>
      <Link
        to="/discover"
        className="inline-flex min-h-[var(--tap)] items-center text-sm font-medium text-[var(--color-accent)]"
      >
        Browse Discover
      </Link>
    </div>
  )
}
