import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import { Search } from 'lucide-react'

import { PRIMARY_NAV } from '@/components/layout/nav.constants'

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddMedia: () => void
}

export function CommandPalette({ open, onOpenChange, onAddMedia }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  const items = useMemo(
    () =>
      [
        ...PRIMARY_NAV.map((item) => ({
          id: item.to,
          label: item.label,
          hint: item.shortcut ? item.shortcut : undefined,
          run: () => navigate(item.to),
        })),
        {
          id: 'add',
          label: 'Add media…',
          hint: '⌘K',
          run: () => onAddMedia(),
        },
        {
          id: 'edit-home',
          label: 'Edit home dashboards',
          hint: undefined as string | undefined,
          run: () => navigate('/edit-home'),
        },
        {
          id: 'requests',
          label: 'Seerr requests',
          hint: undefined as string | undefined,
          run: () => navigate('/requests'),
        },
        {
          id: 'indexers',
          label: 'Prowlarr browse',
          hint: undefined as string | undefined,
          run: () => navigate('/indexers'),
        },
        {
          id: 'settings',
          label: 'Settings',
          hint: undefined as string | undefined,
          run: () => navigate('/settings'),
        },
      ] as Array<{
        id: string
        label: string
        hint?: string
        run: () => void
      }>,
    [navigate, onAddMedia],
  )

  if (!open) return null

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
            placeholder="Jump to… or open Add media"
            className="h-12 w-full bg-transparent text-base outline-none placeholder:text-[var(--color-muted-foreground)]"
            autoFocus
          />
        </div>
        <Command.List className="max-h-80 overflow-y-auto p-2">
          <Command.Empty className="px-3 py-6 text-center text-sm text-[var(--color-muted-foreground)]">
            No matches
          </Command.Empty>
          {items.map((item) => (
            <Command.Item
              key={item.id}
              value={item.label}
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
        </Command.List>
      </Command>
    </div>
  )
}
