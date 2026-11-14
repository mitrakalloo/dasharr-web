import { Link } from 'react-router-dom'
import { toast } from 'sonner'

import { EmptyState } from '@/components/ui/EmptyState'
import { CalendarAgenda } from '@/features/calendar/CalendarAgenda'
import { CalendarDayStrip } from '@/features/calendar/CalendarDayStrip'
import { CalendarMonthGrid } from '@/features/calendar/CalendarMonthGrid'
import { CalendarMonthHeader } from '@/features/calendar/CalendarMonthHeader'
import { CalendarViewToggle } from '@/features/calendar/CalendarViewToggle'
import { formatMonthLabel } from '@/features/calendar/calendar.helpers'
import { useCalendarState } from '@/features/calendar/useCalendarState'
import { DEMO_RELEASES } from '@/data/demoDashboard'
import { useCalendarReleases } from '@/hooks/useCalendarReleases'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { syncTitleMonitored } from '@/hooks/useMonitorTitle'
import { serviceAccent } from '@/lib/serviceColors'
import { useConfigStore } from '@/stores/configStore'

export function CalendarPage() {
  const { isDemo, hasAny, hydrated, has } = useConfiguredStack()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const canShow = isDemo || hasAny('sonarr', 'radarr', 'lidarr')
  const live = useCalendarReleases(!isDemo && canShow)
  const events =
    isDemo ? DEMO_RELEASES : live.status === 'success' ? live.data : []
  const cal = useCalendarState(events)

  function handleToggle(id: string) {
    const event = cal.events.find((entry) => entry.id === id)
    const next = !(event?.monitored ?? false)
    cal.toggleMonitored(id)
    if (isDemo || !event?.titleId) {
      toast.message(next ? 'Monitored (local)' : 'Unmonitored (local)')
      return
    }
    void syncTitleMonitored(settings, services, event.titleId, next).then((ok) => {
      if (!ok) cal.toggleMonitored(id)
    })
  }

  const legend = (['sonarr', 'radarr', 'lidarr'] as const).filter(
    (kind) => isDemo || has(kind),
  )

  if (!hydrated) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  if (!canShow) {
    return (
      <div className="space-y-4 px-4 pt-4 pb-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            Universal schedule across Sonarr, Radarr, and Lidarr
          </p>
        </div>
        <EmptyState
          title="No calendar sources"
          description="Add Sonarr, Radarr, or Lidarr in Settings to see upcoming releases."
        />
        <p className="text-center text-xs text-[var(--color-muted-foreground)]">
          <Link to="/settings" className="text-[var(--color-accent)]">
            Open Settings
          </Link>
        </p>
      </div>
    )
  }

  const subtitle = isDemo
    ? 'Universal schedule · demo'
    : live.status === 'loading'
      ? 'Loading from Sonarr / Radarr…'
      : live.status === 'error'
        ? live.error
        : `${events.length} release${events.length === 1 ? '' : 's'} in range`

  return (
    <div className="space-y-4 px-4 pt-4 pb-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{subtitle}</p>
        </div>
        <CalendarViewToggle value={cal.view} onChange={cal.setView} />
      </div>

      {!isDemo && live.status === 'error' ? (
        <EmptyState title="Couldn’t load calendar" description={live.error} />
      ) : (
        <>
          <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
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

            <div className="mt-3 flex flex-wrap gap-3 border-t border-[var(--color-border)] pt-3 text-[11px] text-[var(--color-muted-foreground)]">
              {legend.map((kind) => (
                <span key={kind} className="inline-flex items-center gap-1.5 capitalize">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: serviceAccent(kind) }}
                  />
                  {kind}
                </span>
              ))}
            </div>
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
          />
        </>
      )}
    </div>
  )
}
