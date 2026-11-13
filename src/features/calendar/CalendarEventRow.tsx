import { Link } from 'react-router-dom'
import { Bell, BellOff } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { formatEventTime } from '@/features/calendar/calendar.helpers'
import type { DemoRelease } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { serviceAccent } from '@/lib/serviceColors'

interface CalendarEventRowProps {
  event: DemoRelease
  onToggle?: () => void
}

function availability(event: DemoRelease): { label: string; color: string } {
  if (event.hasFile) return { label: 'On disk', color: '#34d399' }
  if (event.monitored) return { label: 'Missing', color: '#f59e0b' }
  return { label: 'Unmonitored', color: '#a1a1aa' }
}

export function CalendarEventRow({ event, onToggle }: CalendarEventRowProps) {
  const accent = serviceAccent(event.service)
  const status = availability(event)
  const body = (
    <>
      <div className="w-14 shrink-0 pt-1 text-right">
        <p className="tabular text-xs font-medium" style={{ color: accent }}>
          {formatEventTime(event.airDate)}
        </p>
      </div>
      <div
        className="my-1 w-1 shrink-0 self-stretch rounded-full"
        style={{ backgroundColor: accent }}
      />
      <PosterThumb
        src={event.poster}
        label={event.title}
        accent={accent}
        className="h-[60px] w-10"
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{event.title}</p>
        {event.subtitle ? (
          <p className="truncate text-xs text-[var(--color-muted-foreground)]">{event.subtitle}</p>
        ) : null}
        <span
          className="mt-1 inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ color: status.color, backgroundColor: `${status.color}22` }}
        >
          {status.label} · {event.service}
        </span>
      </div>
    </>
  )

  return (
    <article className="flex min-h-16 items-stretch gap-3 py-2">
      {event.titleId ? (
        <Link
          to={titlePath(event.titleId)}
          className="flex min-w-0 flex-1 cursor-pointer items-stretch gap-3 text-left transition active:scale-[0.99]"
        >
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-stretch gap-3">{body}</div>
      )}
      <IconButton
        label={event.monitored ? 'Unmonitor' : 'Monitor'}
        tone={event.monitored ? 'accent' : 'default'}
        onClick={onToggle}
      >
        {event.monitored ? <Bell className="size-4" /> : <BellOff className="size-4" />}
      </IconButton>
    </article>
  )
}
