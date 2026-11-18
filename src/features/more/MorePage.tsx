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
import { motion } from 'motion/react'

import { PageHeader } from '@/components/ui/PageHeader'
import { ArrOpsCard } from '@/features/more/ArrOpsCard'
import { MoreServicesList } from '@/features/more/MoreServicesList'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useSeerrRequests } from '@/hooks/useSeerrRequests'
import { staggerContainer, staggerItem } from '@/lib/motion'

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
    hint: 'Account, services, invites',
    icon: Settings,
    need: null,
  },
]

export function MorePage() {
  const { isDemo, has } = useConfiguredStack()
  const seerr = useSeerrRequests(has('seerr'))
  const pending =
    seerr.status === 'success'
      ? seerr.data.filter((item) => item.status === 'pending').length
      : 0
  const visible = links.filter((link) => link.need == null || isDemo || has(link.need))

  return (
    <motion.div
      className="page-pad space-y-4"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <PageHeader title="More" description="Services, library tools, and settings" />
      </motion.div>

      <motion.div variants={staggerItem}>
        <ArrOpsCard />
      </motion.div>
      <motion.div variants={staggerItem}>
        <MoreServicesList />
      </motion.div>

      <motion.div variants={staggerItem} className="panel overflow-hidden rounded-[var(--radius-2xl)]">
        {visible.map((link, index) => {
          const Icon = link.icon
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`surface-interactive flex min-h-[var(--tap)] items-center gap-3 px-4 py-3 hover:bg-white/[0.04] ${
                index < visible.length - 1 ? 'border-b border-[var(--color-hairline)]' : ''
              }`}
            >
              <span className="inline-flex size-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold tracking-tight">
                  {link.label}
                  {link.to === '/requests' && pending > 0 ? ` (${pending})` : ''}
                </span>
                <span className="block text-xs text-[var(--color-muted-foreground)]">
                  {link.hint}
                </span>
              </span>
              <ChevronRight className="size-4 text-[var(--color-muted-foreground)]" aria-hidden />
            </Link>
          )
        })}
      </motion.div>
    </motion.div>
  )
}
