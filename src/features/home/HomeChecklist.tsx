import { Link } from 'react-router-dom'
import { CheckCircle2, Circle, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { usePrefsStore } from '@/stores/prefsStore'
import type { ServiceType } from '@/types/config'

const tips: Array<{
  id: string
  label: string
  done: (has: (type: ServiceType) => boolean) => boolean
  optional?: boolean
}> = [
  {
    id: 'arr',
    label: 'Add Sonarr or Radarr',
    done: (has) => has('sonarr') || has('radarr'),
  },
  {
    id: 'download',
    label: 'Connect a download client',
    done: (has) =>
      has('sabnzbd') ||
      has('qbittorrent') ||
      has('transmission') ||
      has('nzbget') ||
      has('deluge'),
  },
  {
    id: 'seerr',
    label: 'Optional: Seerr for requests',
    done: (has) => has('seerr'),
    optional: true,
  },
]

export function HomeChecklist() {
  const { needsSetup, has } = useConfiguredStack()
  const dismissed = usePrefsStore((state) => state.experience.checklistDismissed)
  const setExperience = usePrefsStore((state) => state.setExperience)

  if (needsSetup || dismissed) return null

  const requiredDone = tips.filter((tip) => !tip.optional).every((tip) => tip.done(has))
  if (requiredDone) return null

  return (
    <div className="panel space-y-3.5 rounded-[var(--radius-2xl)] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-sm font-semibold tracking-tight">Finish setup</h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
            Complete these steps to unlock your full home desk.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExperience({ checklistDismissed: true })}
        >
          Dismiss
        </Button>
      </div>
      <ul className="space-y-2">
        {tips.map((tip) => {
          const done = tip.done(has)
          return (
            <li
              key={tip.id}
              className="flex items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] px-3 py-2 text-sm"
            >
              {done ? (
                <CheckCircle2 className="size-4 shrink-0 text-[var(--color-success)]" aria-hidden />
              ) : (
                <Circle className="size-4 shrink-0 text-[var(--color-muted-foreground)]" aria-hidden />
              )}
              <span
                className={
                  done
                    ? 'text-[var(--color-muted-foreground)] line-through opacity-70'
                    : 'font-medium text-[var(--color-foreground)]'
                }
              >
                {tip.label}
              </span>
            </li>
          )
        })}
      </ul>
      <Link
        to="/settings?focus=services"
        className="group inline-flex min-h-9 items-center gap-1 text-xs font-semibold text-[var(--color-primary)]"
      >
        <span>Open Settings</span>
        <ChevronRight
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
    </div>
  )
}
