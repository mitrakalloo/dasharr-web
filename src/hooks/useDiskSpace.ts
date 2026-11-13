import { useEffect, useMemo, useState } from 'react'

import type { DemoStorage } from '@/data/demoDashboard'
import { getArrDiskSpace } from '@/lib/services/diskspace'
import { useConfigStore } from '@/stores/configStore'

type DiskState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: DemoStorage[] }
  | { status: 'error'; error: string }

export function useDiskSpace(enabled: boolean): DiskState {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const sources = useMemo(
    () =>
      services.filter(
        (service) =>
          service.enabled &&
          (service.type === 'sonarr' ||
            service.type === 'radarr' ||
            service.type === 'lidarr'),
      ),
    [services],
  )
  const [state, setState] = useState<DiskState>({ status: 'idle' })

  useEffect(() => {
    if (!enabled || sources.length === 0) {
      setState({ status: 'idle' })
      return
    }

    let cancelled = false

    async function run() {
      setState({ status: 'loading' })
      try {
        const settled = await Promise.allSettled(
          sources.map(async (service) => {
            const disks = await getArrDiskSpace(settings, service)
            return disks.map((disk, index) => ({
              id: `${service.id}-${index}`,
              label: disk.label || service.name,
              path: disk.path,
              usedTb: Math.max(0, (disk.totalSpace - disk.freeSpace) / 1024 ** 4),
              totalTb: disk.totalSpace / 1024 ** 4,
            }))
          }),
        )
        if (cancelled) return
        const data = settled.flatMap((result) =>
          result.status === 'fulfilled' ? result.value : [],
        )
        // Dedupe by path (Sonarr/Radarr often share mounts)
        const byPath = new Map<string, DemoStorage>()
        for (const volume of data) {
          if (!byPath.has(volume.path)) byPath.set(volume.path, volume)
        }
        setState({ status: 'success', data: [...byPath.values()] })
      } catch (error) {
        if (!cancelled) {
          setState({
            status: 'error',
            error: error instanceof Error ? error.message : 'Failed to load disk space',
          })
        }
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [enabled, sources, settings])

  return state
}
