import { Link } from 'react-router-dom'
import { Bell, BellOff } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { relativeWhenLabel, toDateKey } from '@/features/calendar/calendar.helpers'
import type { DemoRelease } from '@/data/demoDashboard'
import { titlePath } from '@/data/demoTitles'
import { serviceAccent } from '@/lib/serviceColors'
import { cn } from '@/lib/cn'

interface UpcomingReleaseRowProps {
  release: DemoRelease
  bordered?: boolean
  onToggle?: () => void
}

export function UpcomingReleaseRow({
  release,
  bordered = false,
  onToggle,
}: UpcomingReleaseRowProps) {
  const accent = serviceAccent(release.service)
  const todayKey = toDateKey(new Date())
  const content = (
    <>
      <span className="mt-0.5 size-2.5 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {release.title}
          {release.subtitle ? ` · ${release.subtitle}` : ''}
        </p>
        <p className="truncate text-xs text-[var(--color-muted-foreground)]">
          {relativeWhenLabel(release.airDate, todayKey)} · {release.meta}
        </p>
      </div>
    </>
  )

  return (
    <div
      className={cn(
        'flex min-h-[64px] items-center gap-3 px-3 py-2',
        bordered && 'border-b border-[var(--color-border)]',
      )}
    >
      {release.titleId ? (
        <Link
          to={titlePath(release.titleId)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left transition active:scale-[0.99]"
        >
          {content}
        </Link>
      ) : (
        <div className="flex min-w-0 flex-1 items-center gap-3">{content}</div>
      )}
      <IconButton
        label={release.monitored ? 'Unmonitor' : 'Monitor'}
        tone={release.monitored ? 'accent' : 'default'}
        onClick={onToggle}
      >
        {release.monitored ? <Bell className="size-4" /> : <BellOff className="size-4" />}
      </IconButton>
    </div>
  )
}
