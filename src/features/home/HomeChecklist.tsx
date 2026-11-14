import { Link } from 'react-router-dom'

import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import type { ServiceType } from '@/types/config'

const tips: Array<{
  id: string
  label: string
  done: (has: (type: ServiceType) => boolean) => boolean
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
  },
]

export function HomeChecklist() {
  const { isDemo, has, services } = useConfiguredStack()
  if (isDemo || services.length >= 2) return null

  return (
    <div className="panel space-y-3 rounded-2xl p-4">
      <div>
        <h2 className="text-sm font-semibold">Get set up</h2>
        <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
          A few services unlock the full home desk.
        </p>
      </div>
      <ul className="space-y-2">
        {tips.map((tip) => {
          const done = tip.done(has)
          return (
            <li
              key={tip.id}
              className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]"
            >
              <span
                className={`size-2 shrink-0 rounded-full ${done ? 'bg-emerald-400' : 'bg-[var(--color-border-strong)]'}`}
              />
              <span className={done ? 'line-through opacity-60' : ''}>{tip.label}</span>
            </li>
          )
        })}
      </ul>
      <Link
        to="/settings"
        className="inline-flex min-h-[var(--tap)] items-center text-sm font-medium text-[var(--color-accent)]"
      >
        Open Settings
      </Link>
    </div>
  )
}
