import { Link } from 'react-router-dom'
import { Bell, BellOff, Search } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { IconButton } from '@/components/ui/IconButton'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { formatEventTime } from '@/features/calendar/calendar.helpers'
import type { DemoRelease } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { serviceAccent } from '@/lib/serviceColors'

interface CalendarEventRowProps {
  event: DemoRelease
  onToggle?: () => void
  onSearch?: () => void
}

function availability(
  event: DemoRelease,
): { label: string; tone: 'success' | 'warning' | 'neutral' } {
  if (event.hasFile) return { label: 'On disk', tone: 'success' }
  if (event.monitored) return { label: 'Missing', tone: 'warning' }
  return { label: 'Unmonitored', tone: 'neutral' }
}

export function CalendarEventRow({ event, onToggle, onSearch }: CalendarEventRowProps) {
  const accent = serviceAccent(event.service)
  const status = availability(event)
  const timeLabel = formatEventTime(event.airDate)

  const body = (
    <>
      <div
        className="my-1 w-1 shrink-0 self-stretch rounded-full"
        style={{ backgroundColor: accent }}
      />
      <PosterThumb
        src={event.poster}
        label={event.title}
        accent={accent}
        className="h-14 w-10"
      />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold tracking-tight">{event.title}</p>
        </div>
        {event.subtitle ? (
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
            {event.subtitle}
          </p>
        ) : null}
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          <span className="tabular text-[11px] font-medium" style={{ color: accent }}>
            {timeLabel}
          </span>
          <Badge tone={status.tone} dot>
            {status.label}
          </Badge>
          <span className="text-[11px] capitalize text-[var(--color-muted-foreground)]">
            {event.service}
          </span>
        </div>
      </div>
    </>
  )

  return (
    <article className="flex min-h-[76px] items-center gap-2 px-3.5 py-3 transition-colors hover:bg-[var(--color-hover)]">
      {event.titleId ? (
        <Link
          to={titlePath(event.titleId)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left transition active:scale-[0.99]"
        >
          {body}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>
      )}
      <div className="flex shrink-0 items-center gap-0.5">
        {!event.hasFile && onSearch ? (
          <IconButton label="Search releases" size="sm" onClick={onSearch}>
            <Search className="size-4" />
          </IconButton>
        ) : null}
        <IconButton
          label={event.monitored ? 'Unmonitor' : 'Monitor'}
          tone={event.monitored ? 'accent' : 'default'}
          size="sm"
          onClick={onToggle}
        >
          {event.monitored ? <Bell className="size-4" /> : <BellOff className="size-4" />}
        </IconButton>
      </div>
    </article>
  )
}
