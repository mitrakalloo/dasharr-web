import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { CalendarDays } from 'lucide-react'

import { EmptyState } from '@/components/ui/EmptyState'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { DEMO_RELEASES } from '@/data/demoDashboard'
import { CalendarAgenda } from '@/features/calendar/CalendarAgenda'
import { CalendarDayStrip } from '@/features/calendar/CalendarDayStrip'
import { CalendarMonthGrid } from '@/features/calendar/CalendarMonthGrid'
import { CalendarMonthHeader } from '@/features/calendar/CalendarMonthHeader'
import { CalendarViewToggle } from '@/features/calendar/CalendarViewToggle'
import { formatMonthLabel } from '@/features/calendar/calendar.helpers'
import { useCalendarActions } from '@/features/calendar/useCalendarActions'
import { useCalendarState } from '@/features/calendar/useCalendarState'
import { useCalendarReleases } from '@/hooks/useCalendarReleases'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { cn } from '@/lib/cn'
import { serviceAccent } from '@/lib/serviceColors'
import { useConfigStore } from '@/stores/configStore'

export function CalendarPage() {
  const { isDemo, hasAny, hydrated, has } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const [params, setParams] = useSearchParams()
  const canShow = isDemo || hasAny('sonarr', 'radarr', 'lidarr')
  const live = useCalendarReleases(!isDemo && canShow)
  const rawEvents = useMemo(
    () => (isDemo ? DEMO_RELEASES : live.status === 'success' ? live.data : []),
    [isDemo, live],
  )
  const serviceFilter = params.get('source') ?? 'all'

  function setServiceFilter(next: string) {
    const nextParams = new URLSearchParams(params)
    if (next === 'all') nextParams.delete('source')
    else nextParams.set('source', next)
    setParams(nextParams, { replace: true })
  }

  const filteredEvents = useMemo(() => {
    if (serviceFilter === 'all') return rawEvents
    return rawEvents.filter((event) => event.service === serviceFilter)
  }, [rawEvents, serviceFilter])

  const cal = useCalendarState(filteredEvents)
  const { handleToggle, handleSearch } = useCalendarActions({
    isDemo,
    settings,
    services,
    events: cal.events,
    toggleMonitored: cal.toggleMonitored,
  })

  const legend = (['sonarr', 'radarr', 'lidarr'] as const).filter(
    (kind) => isDemo || has(kind),
  )

  if (!hydrated) {
    return <PageSkeleton variant="calendar" />
  }

  if (!canShow) {
    return (
      <div className="page-pad space-y-5">
        <PageHeader
          title="Schedule"
          description="Universal calendar across Sonarr, Radarr, and Lidarr"
        />
        <EmptyState
          icon={<CalendarDays className="size-5" aria-hidden />}
          title="No calendar sources"
          description="Add Sonarr, Radarr, or Lidarr in Settings to see upcoming releases."
          actionLabel="Add service"
          actionTo="/settings?focus=services"
        />
      </div>
    )
  }

  const subtitle = isDemo
    ? 'Universal schedule · demo'
    : live.status === 'loading'
      ? 'Syncing upcoming releases…'
      : live.status === 'error'
        ? live.error
        : `${filteredEvents.length} release${filteredEvents.length === 1 ? '' : 's'} in range`

  return (
    <div className="page-pad space-y-5">
      <PageHeader
        title="Schedule"
        description={subtitle}
        actions={<CalendarViewToggle value={cal.view} onChange={cal.setView} />}
      />

      {!isDemo && live.status === 'error' ? (
        <EmptyState title="Couldn’t load calendar" description={live.error} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(340px,430px)] lg:items-start">
          <section className="panel rounded-[var(--radius-2xl)] p-4">
            {cal.view === 'month' ? (
              <>
                <CalendarMonthHeader
                  label={formatMonthLabel(cal.month)}
                  isOnToday={cal.isOnToday}
                  onPrev={cal.prevMonth}
                  onNext={cal.nextMonth}
                  onToday={cal.jumpToday}
                />
                <div className="pt-3">
                  <CalendarMonthGrid
                    days={cal.days}
                    selectedKey={cal.selectedKey}
                    onSelect={cal.selectDay}
                  />
                </div>
              </>
            ) : (
              <CalendarDayStrip
                days={cal.stripDays}
                selectedKey={cal.selectedKey}
                todayKey={cal.todayKey}
                events={cal.events}
                onSelect={cal.selectDay}
                onToday={cal.jumpToday}
              />
            )}

            {legend.length > 0 ? (
              <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-[var(--color-hairline)] pt-3.5">
                <button
                  type="button"
                  onClick={() => setServiceFilter('all')}
                  className={cn(
                    'inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium transition-colors',
                    serviceFilter === 'all'
                      ? 'border-[var(--color-primary)]/40 bg-[var(--color-primary-muted)] text-[var(--color-primary)]'
                      : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
                  )}
                >
                  All sources
                </button>
                {legend.map((kind) => {
                  const active = serviceFilter === kind
                  const accent = serviceAccent(kind)
                  return (
                    <button
                      key={kind}
                      type="button"
                      onClick={() => setServiceFilter(active ? 'all' : kind)}
                      className={cn(
                        'inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-full border px-2.5 text-xs font-medium capitalize transition-colors',
                        active
                          ? 'border-[var(--color-border-strong)] bg-[var(--color-card-elevated)] text-[var(--color-foreground)]'
                          : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
                      )}
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: accent }}
                      />
                      {kind}
                    </button>
                  )
                })}
              </div>
            ) : null}
          </section>

          <CalendarAgenda
            selectedKey={cal.selectedKey}
            todayKey={cal.todayKey}
            isOnToday={cal.isOnToday}
            dayEvents={cal.dayEvents}
            isDemo={isDemo}
            loading={!isDemo && live.status === 'loading'}
            onJumpToday={cal.jumpToday}
            onToggle={handleToggle}
            onSearch={(id) => void handleSearch(id)}
          />
        </div>
      )}
    </div>
  )
}
