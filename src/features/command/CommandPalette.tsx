import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { Search } from 'lucide-react'

import { PRIMARY_NAV } from '@/components/layout/nav.constants'
import { useConfigStore } from '@/stores/configStore'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMedia: () => void
}

export function CommandPalette({ open, onOpenChange, onAddMedia }: CommandPaletteProps) {
  const navigate = useNavigate()
  const services = useConfigStore((state) => state.services)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const items = useMemo(() => {
    const jobs = [
      {
        id: 'add',
        group: 'Jobs',
        label: 'Search & add media',
        hint: undefined as string | undefined,
        run: () => onAddMedia(),
      },
      {
        id: 'queue-requests',
        group: 'Jobs',
        label: 'Open waiting approvals',
        run: () => navigate('/queue?filter=requests'),
      },
      {
        id: 'queue-watching',
        group: 'Jobs',
        label: 'Open now playing',
        run: () => navigate('/queue?filter=watching'),
      },
      ...PRIMARY_NAV.map((item) => ({
        id: item.to,
        group: 'Go to',
        label: item.label,
        hint: item.shortcut,
        run: () => navigate(item.to),
      })),
      {
        id: 'edit-home',
        group: 'Go to',
        label: 'Edit home dashboards',
        hint: undefined,
        run: () => navigate('/edit-home'),
      },
      {
        id: 'settings',
        group: 'Go to',
        label: 'Settings',
        hint: undefined,
        run: () => navigate('/settings'),
      },
      ...services
        .filter((service) => service.enabled)
        .map((service) => ({
          id: `svc-${service.id}`,
          group: 'Services',
          label: service.name || service.type,
          hint: service.type,
          run: () => navigate(`/service/${service.id}`),
        })),
    ]
    return jobs
  }, [navigate, onAddMedia, services])

  if (!open) return null

  const groups = ['Jobs', 'Go to', 'Services'] as const

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[var(--color-overlay)] px-4 pt-[12vh] backdrop-blur-[2px]">
      <button
        type="button"
        aria-label="Dismiss"
        className="absolute inset-0 cursor-pointer"
        onClick={() => onOpenChange(false)}
      />
      <Command
        className="panel relative z-10 w-full max-w-lg overflow-hidden rounded-2xl"
        label="Command menu"
      >
        <div className="flex items-center gap-2 border-b border-[var(--color-border)] px-3">
          <Search className="size-4 text-[var(--color-muted-foreground)]" aria-hidden />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Jump to a page, service, or job…"
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-[var(--color-muted-foreground)]"
            autoFocus
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-[var(--color-muted-foreground)]">
            No matches
          </Command.Empty>
          {groups.map((group) => {
            const groupItems = items.filter((item) => item.group === group)
            if (groupItems.length === 0) return null
            return (
              <Command.Group key={group} heading={group} className="px-1 py-1 text-xs">
                {groupItems.map((item) => (
                  <Command.Item
                    key={item.id}
                    value={`${group} ${item.label}`}
                    onSelect={() => {
                      item.run()
                      onOpenChange(false)
                    }}
                    className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm aria-selected:bg-white/8"
                  >
                    <span>{item.label}</span>
                    {item.hint ? (
                      <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px] text-[var(--color-muted-foreground)]">
                        {item.hint}
                      </kbd>
                    ) : null}
                  </Command.Item>
                ))}
              </Command.Group>
            )
          })}
        </Command.List>
      </Command>
    </div>
  )
}
