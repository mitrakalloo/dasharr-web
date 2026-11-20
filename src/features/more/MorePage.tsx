import { Link } from 'react-router-dom'
import {
  Activity,
  Captions,
  ChevronRight,
  Clapperboard,
  Compass,
  FileInput,
  HardDrive,
  History,
  Inbox,
  LayoutDashboard,
  Library,
  Radar,
  Settings,
} from 'lucide-react'
import { motion } from 'motion/react'

import { Badge } from '@/components/ui/Badge'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { ArrOpsCard } from '@/features/more/ArrOpsCard'
import { MoreServicesList } from '@/features/more/MoreServicesList'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useSeerrRequests } from '@/hooks/useSeerrRequests'
import { staggerContainer, staggerItem } from '@/lib/motion'

const links = [
  {
    to: '/edit-home',
    label: 'Edit desks',
    hint: 'Dashboards, drag-and-drop widgets, presets',
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
  {
    to: '/requests',
    label: 'Requests',
    hint: 'Seerr approvals and issues',
    icon: Inbox,
    need: 'seerr' as const,
  },
  {
    to: '/indexers',
    label: 'Indexers',
    hint: 'Prowlarr browse and grab releases',
    icon: Radar,
    need: 'prowlarr' as const,
  },
  {
    to: '/subtitles',
    label: 'Subtitles',
    hint: 'Bazarr wanted subtitles & search',
    icon: Captions,
    need: 'bazarr' as const,
  },
  {
    to: '/activity',
    label: 'Activity & stats',
    hint: 'Tautulli live streams, history & 30-day stats',
    icon: Activity,
    need: 'tautulli' as const,
  },
  {
    to: '/storage',
    label: 'Storage & cleanup',
    hint: 'Mounted volumes & largest media',
    icon: HardDrive,
    need: null,
  },
  { to: '/library', label: 'Library', hint: 'Browse, sort & filter *arr titles', icon: Library, need: null },
  {
    to: '/wanted',
    label: 'Wanted',
    hint: 'Missing & cutoff unmet media',
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
    hint: 'Account, services, theme, invites',
    icon: Settings,
    need: null,
  },
]

export function MorePage() {
  const { isDemo, has, hydrated } = useConfiguredStack()
  const seerr = useSeerrRequests(!isDemo && has('seerr'))
  const pending =
    seerr.status === 'success'
      ? seerr.data.filter((item) => item.status === 'pending').length
      : 0
  const visible = links.filter((link) => link.need == null || isDemo || has(link.need))

  if (!hydrated) {
    return <PageSkeleton variant="list" />
  }

  return (
    <motion.div
      className="page-pad space-y-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <PageHeader
          eyebrow="Workspace"
          title="More"
          description="Services, library tools, operations, and settings"
        />
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div variants={staggerItem} className="space-y-5 lg:col-span-6">
          <ArrOpsCard />
          <MoreServicesList />
        </motion.div>

        <motion.div variants={staggerItem} className="space-y-3 lg:col-span-6">
          <SectionHeader title="Tools & destinations" />
          <div className="panel divide-y divide-[var(--color-hairline)] overflow-hidden rounded-[var(--radius-2xl)]">
            {visible.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className="group flex min-h-[var(--tap)] items-center gap-3 px-4 py-3 transition hover:bg-[var(--color-hover)]"
                >
                  <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold tracking-tight text-[var(--color-foreground)]">
                      {link.label}
                      {link.to === '/requests' && pending > 0 ? (
                        <Badge tone="primary" className="tabular">
                          {pending}
                        </Badge>
                      ) : null}
                    </span>
                    <span className="block text-xs text-[var(--color-muted-foreground)]">
                      {link.hint}
                    </span>
                  </span>
                  <ChevronRight
                    className="size-4 shrink-0 text-[var(--color-muted-foreground)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]"
                    aria-hidden="true"
                  />
                </Link>
              )
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
