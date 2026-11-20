import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Command } from 'cmdk'
import {
  Activity,
  Film,
  Gauge,
  HeartPulse,
  Inbox,
  Keyboard,
  LayoutDashboard,
  Moon,
  Pause,
  Play,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings,
  Sun,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { PRIMARY_NAV } from '@/components/layout/nav.constants'
import { useLibraryBrowse } from '@/hooks/useLibraryBrowse'
import { spring } from '@/lib/motion'
import { serviceAccent } from '@/lib/serviceColors'
import { rssSyncArr, searchMissingArr } from '@/lib/services/arr.commands'
import {
  qbitPauseAll,
  qbitResumeAll,
  toggleQbitAltSpeed,
} from '@/lib/services/qbittorrent'
import { sabPause, sabResume } from '@/lib/services/sabnzbd'
import { titlePath } from '@/data/demoTitles'
import { useConfigStore } from '@/stores/configStore'
import { useDashboardStore } from '@/stores/dashboardStore'
import { usePrefsStore } from '@/stores/prefsStore'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMedia: () => void
  onOpenHealth?: () => void
  onOpenShortcuts?: () => void
}

type PaletteGroup = 'Library' | 'Actions' | 'Desks' | 'Navigate' | 'Services'

interface PaletteEntry {
  id: string
  group: PaletteGroup
  label: string
  hint?: string
  icon: LucideIcon
  accent?: string
  run: () => void
}

export function CommandPalette({
  open,
  onOpenChange,
  onAddMedia,
  onOpenHealth,
  onOpenShortcuts,
}: CommandPaletteProps) {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const dashboards = useDashboardStore((state) => state.dashboards)
  const activeDashboardId = useDashboardStore((state) => state.activeDashboardId)
  const setActiveDashboard = useDashboardStore((state) => state.setActiveDashboard)
  const themePreference = usePrefsStore((state) => state.experience.themePreference)
  const setExperience = usePrefsStore((state) => state.setExperience)

  const library = useLibraryBrowse(open)
  const [query, setQuery] = useState('')

  const isLight =
    themePreference === 'light' ||
    (themePreference === 'system' &&
      typeof document !== 'undefined' &&
      document.documentElement.dataset.theme === 'light')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onOpenChange])

  const enabledServices = useMemo(
    () => services.filter((service) => service.enabled),
    [services],
  )

  const matchingLibrary = useMemo(() => {
    const trimmed = query.trim().toLowerCase()
    if (trimmed.length < 2) return []
    return library.items
      .filter((item) => item.title.toLowerCase().includes(trimmed))
      .slice(0, 8)
  }, [library.items, query])

  const items = useMemo<PaletteEntry[]>(() => {
    const arrServices = enabledServices.filter(
      (s) => s.type === 'sonarr' || s.type === 'radarr' || s.type === 'lidarr',
    )
    const qbitServices = enabledServices.filter((s) => s.type === 'qbittorrent')
    const sabServices = enabledServices.filter((s) => s.type === 'sabnzbd')

    const actions: PaletteEntry[] = [
      {
        id: 'add',
        group: 'Actions',
        label: 'Search & add media',
        icon: Plus,
        run: () => onAddMedia(),
      },
      {
        id: 'toggle-theme',
        group: 'Actions',
        label: isLight ? 'Switch to Obsidian Dark theme' : 'Switch to Ceramic Light theme',
        icon: isLight ? Moon : Sun,
        run: () => setExperience({ themePreference: isLight ? 'dark' : 'light' }),
      },
    ]

    if (onOpenHealth) {
      actions.push({
        id: 'open-health',
        group: 'Actions',
        label: 'Open system health & alerts',
        icon: HeartPulse,
        run: () => onOpenHealth(),
      })
    }

    if (onOpenShortcuts) {
      actions.push({
        id: 'open-shortcuts',
        group: 'Actions',
        label: 'View keyboard shortcuts',
        hint: '?',
        icon: Keyboard,
        run: () => onOpenShortcuts(),
      })
    }

    if (arrServices.length > 0) {
      actions.push(
        {
          id: 'run-rss-sync',
          group: 'Actions',
          label: 'Run RSS sync across *arr stack',
          hint: `${arrServices.length} svc`,
          icon: RefreshCw,
          run: () => {
            void Promise.allSettled(
              arrServices.map((service) => rssSyncArr(settings, service)),
            ).then(() => toast.success('Triggered RSS sync across *arr services'))
          },
        },
        {
          id: 'run-missing-search',
          group: 'Actions',
          label: 'Search missing monitored media',
          hint: `${arrServices.length} svc`,
          icon: Search,
          run: () => {
            void Promise.allSettled(
              arrServices.map((service) => searchMissingArr(settings, service)),
            ).then(() => toast.success('Triggered missing media search'))
          },
        },
      )
    }

    if (qbitServices.length > 0 || sabServices.length > 0) {
      actions.push(
        {
          id: 'pause-all',
          group: 'Actions',
          label: 'Pause all downloads',
          icon: Pause,
          run: () => {
            void Promise.allSettled([
              ...qbitServices.map((s) => qbitPauseAll(settings, s)),
              ...sabServices.map((s) => sabPause(settings, s)),
            ]).then(() => toast.success('Paused all download clients'))
          },
        },
        {
          id: 'resume-all',
          group: 'Actions',
          label: 'Resume all downloads',
          icon: Play,
          run: () => {
            void Promise.allSettled([
              ...qbitServices.map((s) => qbitResumeAll(settings, s)),
              ...sabServices.map((s) => sabResume(settings, s)),
            ]).then(() => toast.success('Resumed all download clients'))
          },
        },
      )
    }

    if (qbitServices.length > 0) {
      actions.push({
        id: 'toggle-turtle',
        group: 'Actions',
        label: 'Toggle alt speed limit (Turtle mode)',
        icon: Gauge,
        run: () => {
          void Promise.allSettled(
            qbitServices.map((s) => toggleQbitAltSpeed(settings, s)),
          ).then(() => toast.success('Toggled qBittorrent alternative speed mode'))
        },
      })
    }

    actions.push(
      {
        id: 'queue-requests',
        group: 'Actions',
        label: 'Open waiting approvals',
        icon: Inbox,
        run: () => navigate('/queue?filter=requests'),
      },
      {
        id: 'queue-watching',
        group: 'Actions',
        label: 'Open now playing streams',
        icon: Activity,
        run: () => navigate('/queue?filter=watching'),
      },
    )

    const deskItems: PaletteEntry[] =
      dashboards.length > 1
        ? dashboards.map((desk) => ({
            id: `desk-${desk.id}`,
            group: 'Desks',
            label: `Switch desk: ${desk.name}`,
            hint: desk.id === activeDashboardId ? 'active' : undefined,
            icon: LayoutDashboard,
            run: () => {
              setActiveDashboard(desk.id)
              navigate('/')
            },
          }))
        : []

    const navItems: PaletteEntry[] = [
      ...PRIMARY_NAV.filter((item) => item.to !== '/more').map((item) => ({
        id: item.to,
        group: 'Navigate' as const,
        label: item.label,
        hint: item.shortcut,
        icon: item.icon,
        run: () => navigate(item.to),
      })),
      {
        id: 'edit-home',
        group: 'Navigate',
        label: 'Edit home desks',
        icon: LayoutDashboard,
        run: () => navigate('/edit-home'),
      },
      {
        id: 'settings',
        group: 'Navigate',
        label: 'Settings',
        icon: Settings,
        run: () => navigate('/settings'),
      },
    ]

    const serviceItems: PaletteEntry[] = enabledServices.map((service) => ({
      id: `svc-${service.id}`,
      group: 'Services',
      label: service.name || service.type,
      hint: service.type,
      icon: Server,
      accent: serviceAccent(service.type),
      run: () => navigate(`/service/${service.id}`),
    }))

    const libraryItems: PaletteEntry[] = matchingLibrary.map((item) => ({
      id: `lib-${item.id}`,
      group: 'Library',
      label: item.year ? `${item.title} (${item.year})` : item.title,
      hint: item.service,
      icon: Film,
      accent: serviceAccent(item.service),
      run: () => navigate(titlePath(item.titleId)),
    }))

    return [...libraryItems, ...actions, ...deskItems, ...navItems, ...serviceItems]
  }, [
    activeDashboardId,
    dashboards,
    enabledServices,
    isLight,
    matchingLibrary,
    navigate,
    onAddMedia,
    onOpenHealth,
    onOpenShortcuts,
    setActiveDashboard,
    setExperience,
    settings,
  ])

  const groups: PaletteGroup[] = ['Library', 'Actions', 'Desks', 'Navigate', 'Services']

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]">
          <motion.button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 cursor-default bg-[var(--color-overlay)] backdrop-blur-[5px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.97 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -6, scale: 0.98 }}
            transition={spring}
            className="relative z-10 w-full max-w-lg"
          >
            <Command
              className="panel-elevated overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--panel-highlight),var(--elevation-float)]"
              label="Command menu"
            >
              <div className="flex items-center gap-3 border-b border-[var(--color-hairline)] px-4">
                <Search className="size-4 shrink-0 text-[var(--color-muted-foreground)]" aria-hidden />
                <Command.Input
                  value={query}
                  onValueChange={setQuery}
                  placeholder="Jump to a title, page, service, or action…"
                  className="h-13 w-full bg-transparent text-base text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-placeholder)]"
                  autoFocus
                />
                <kbd className="hidden rounded border border-[var(--color-border)] bg-[var(--color-kbd-bg)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-muted-foreground)] sm:inline">
                  ESC
                </kbd>
              </div>
              <Command.List className="custom-scrollbar max-h-96 overflow-y-auto p-2">
                <Command.Empty className="px-4 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
                  No matching commands or titles
                </Command.Empty>
                {groups.map((group) => {
                  const groupItems = items.filter((item) => item.group === group)
                  if (groupItems.length === 0) return null
                  return (
                    <Command.Group
                      key={group}
                      heading={group}
                      className="px-1 py-1.5 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:font-semibold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-[var(--color-muted-foreground)]"
                    >
                      {groupItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Command.Item
                            key={item.id}
                            value={`${group} ${item.label} ${item.hint ?? ''}`}
                            onSelect={() => {
                              item.run()
                              onOpenChange(false)
                            }}
                            className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-md)] px-2.5 py-2.5 text-sm font-medium text-[var(--color-foreground)] transition-colors aria-selected:bg-[var(--color-primary-muted)] aria-selected:text-[var(--color-primary)]"
                          >
                            <span
                              className="inline-flex size-7 shrink-0 items-center justify-center rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)]"
                              style={item.accent ? { color: item.accent } : undefined}
                            >
                              <Icon className="size-3.5" aria-hidden />
                            </span>
                            <span className="min-w-0 flex-1 truncate">{item.label}</span>
                            {item.hint ? (
                              <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-kbd-bg)] px-1.5 py-0.5 font-mono text-[10px] capitalize text-[var(--color-muted-foreground)]">
                                {item.hint}
                              </kbd>
                            ) : null}
                          </Command.Item>
                        )
                      })}
                    </Command.Group>
                  )
                })}
              </Command.List>
              <div className="flex items-center justify-between border-t border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] px-4 py-2 text-[11px] text-[var(--color-muted-foreground)]">
                <span>Type 2+ chars to search library · ↑↓ navigate</span>
                <span>↵ to run</span>
              </div>
            </Command>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
