import { useMemo } from 'react'

import { useCalendarReleases } from '@/hooks/useCalendarReleases'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useDownloadQueue } from '@/hooks/useDownloadQueue'
import { DEMO_QUEUE, DEMO_RELEASES } from '@/data/demoDashboard'

export function useOverviewSections() {
  const stack = useConfiguredStack()
  const { isDemo, has, hasAny } = stack
  const calendar = useCalendarReleases(!isDemo && hasAny('sonarr', 'radarr', 'lidarr'))
  const queue = useDownloadQueue(
    !isDemo &&
      hasAny(
        'sabnzbd',
        'qbittorrent',
        'transmission',
        'nzbget',
        'deluge',
        'sonarr',
        'radarr',
        'lidarr',
      ),
  )

  const showQueue =
    isDemo ||
    hasAny(
      'sabnzbd',
      'qbittorrent',
      'transmission',
      'nzbget',
      'deluge',
      'sonarr',
      'radarr',
      'lidarr',
    )
  const showCalendar = isDemo || hasAny('sonarr', 'radarr', 'lidarr')
  const showStorage = isDemo || hasAny('sonarr', 'radarr', 'lidarr')
  const showSeerr = isDemo || has('seerr')
  const showWatching = !isDemo && has('tautulli')

  const queuePreview = useMemo(() => {
    if (isDemo) return DEMO_QUEUE.slice(0, 3)
    return queue.items.slice(0, 3)
  }, [isDemo, queue.items])

  const upcoming = useMemo(() => {
    if (isDemo) {
      return DEMO_RELEASES.filter(
        (release) =>
          new Date(release.airDate) >= new Date(new Date().setHours(0, 0, 0, 0)),
      ).slice(0, 18)
    }
    if (calendar.status !== 'success') return []
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    return calendar.data
      .filter((release) => new Date(release.airDate) >= start)
      .slice(0, 18)
  }, [isDemo, calendar])

  return {
    ...stack,
    showQueue,
    showCalendar,
    showStorage,
    showSeerr,
    showWatching,
    queuePreview,
    upcoming,
    calendarStatus: calendar.status,
    calendarError: calendar.status === 'error' ? calendar.error : undefined,
    queueStatus: queue.status,
    queueError: queue.status === 'error' ? queue.error : undefined,
    queueUpdatedAt: queue.status === 'success' ? queue.updatedAt : undefined,
    pauseOrResume: queue.pauseOrResume,
    retryItem: queue.retryItem,
    removeItem: queue.removeItem,
  }
}
