import { Link } from 'react-router-dom'
import {
  Clapperboard,
  Compass,
  FileInput,
  History,
  Inbox,
  LayoutDashboard,
  Library,
  Radar,
  Settings,
  ChevronRight,
} from 'lucide-react'

import { ArrOpsCard } from '@/features/more/ArrOpsCard'
import { MoreServicesList } from '@/features/more/MoreServicesList'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'

const links = [
  {
    to: '/edit-home',
    label: 'Edit home',
    hint: 'Dashboards, widgets, presets',
    icon: LayoutDashboard,
    need: null,
  },
  {
    to: '/discover',
    label: 'Discover',
    hint: 'Browse trending and popular',
    icon: Compass,
    need: 'seerr' as const,
  },
  { to: '/requests', label: 'Requests', hint: 'Seerr approvals', icon: Inbox, need: 'seerr' as const },
  {
    to: '/indexers',
    label: 'Prowlarr',
    hint: 'Browse and grab releases',
    icon: Radar,
    need: 'prowlarr' as const,
  },
  { to: '/library', label: 'Library', hint: 'Browse *arr titles', icon: Library, need: null },
  {
    to: '/wanted',
    label: 'Wanted',
    hint: 'Missing monitored media',
    icon: Clapperboard,
    need: null,
  },
  { to: '/history', label: 'History', hint: 'Grabs and imports', icon: History, need: null },
  {
    to: '/manual-import',
    label: 'Manual import',
    hint: 'Import completed downloads',
    icon: FileInput,
    need: null,
  },
  {
    to: '/settings',
    label: 'Settings',
    hint: 'Services, vault, connection',
    icon: Settings,
    need: null,
  },
]

export function MorePage() {
  const { isDemo, has } = useConfiguredStack()
  const visible = links.filter(
    (link) => link.need == null || isDemo || has(link.need),
  )

  return (
    <div className="space-y-4 px-4 pt-4 lg:px-6">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">More</h1>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Services, library tools, and settings
        </p>
      </div>

      <ArrOpsCard />
      <MoreServicesList />

      <div className="panel overflow-hidden rounded-2xl">
        {visible.map((link, index) => {
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex min-h-[var(--tap)] items-center gap-3 px-4 py-3 transition hover:bg-white/5 active:scale-[0.99] ${
                index < visible.length - 1 ? 'border-b border-[var(--color-border)]' : ''
              }`}
            >
              <span className="inline-flex size-10 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">{link.label}</span>
                <span className="block text-xs text-[var(--color-muted-foreground)]">
                  {link.hint}
                </span>
              </span>
              <ChevronRight className="size-4 text-[var(--color-muted-foreground)]" aria-hidden />
            </Link>
          )
        })}
      </div>
    </div>
  )
}
