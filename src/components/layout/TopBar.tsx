import { Link } from 'react-router-dom'
import { Plus, Settings } from 'lucide-react'

import { DasharrWordmark } from '@/components/brand/DasharrMark'
import { IconButton } from '@/components/ui/IconButton'
import { SpeedValue } from '@/components/ui/SpeedValue'
import { Tooltip } from '@/components/ui/Tooltip'
import { useScrollY } from '@/hooks/useScrollY'
import { cn } from '@/lib/cn'

interface TopBarProps {
  healthLabel: string
  healthTone: 'ok' | 'warning'
  downloadSpeed?: number
  onHealthClick: () => void
  onAddMedia: () => void
  onCommand: () => void
  scrollTarget?: HTMLElement | null
}

export function TopBar({
  healthLabel,
  healthTone,
  downloadSpeed = 0,
  onHealthClick,
  onAddMedia,
  onCommand,
  scrollTarget = null,
}: TopBarProps) {
  const scrolled = useScrollY(24, scrollTarget) > 0

  return (
    <header
      className={cn(
        'z-30 shrink-0 border-b px-4 pt-[env(safe-area-inset-top,0px)] transition-[border-color,background-color,backdrop-filter] duration-300 ease-[var(--ease-out-expo)]',
        scrolled
          ? 'border-[var(--color-hairline)] bg-[var(--color-background)]/85 backdrop-blur-2xl'
          : 'border-transparent bg-transparent',
      )}
    >
      <div
        className={cn(
          'flex items-center gap-2 transition-[height] duration-300 ease-[var(--ease-out-expo)]',
          scrolled ? 'h-12' : 'h-14',
        )}
      >
        <div className="min-w-0 flex-1 lg:hidden">
          <DasharrWordmark compact className={scrolled ? 'scale-95' : undefined} />
        </div>
        <div className="hidden min-w-0 flex-1 lg:block">
          <p className="truncate text-sm font-medium text-[var(--color-muted-foreground)]">
            Media command center
          </p>
        </div>

        {downloadSpeed > 0 ? (
          <Tooltip label="Aggregate download throughput">
            <span className="hidden tabular items-center rounded-full border border-[var(--color-success)]/25 bg-[var(--color-success)]/10 px-3 py-1.5 text-xs font-medium text-[var(--color-success)] sm:inline-flex">
              ↓ <SpeedValue value={downloadSpeed} className="ml-1" />
            </span>
          </Tooltip>
        ) : null}

        <button
          type="button"
          onClick={onHealthClick}
          title="Open system health"
          className={cn(
            'inline-flex min-h-9 max-w-[46%] cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-medium transition-[transform,background-color,border-color] duration-[var(--duration-fast)] active:scale-95 lg:max-w-none',
            healthTone === 'ok'
              ? 'border-[var(--color-success)]/30 bg-[var(--color-success)]/10 text-[var(--color-success)]'
              : 'border-[var(--color-destructive)]/30 bg-[var(--color-destructive)]/10 text-[var(--color-destructive)]',
          )}
        >
          <span
            className={cn(
              'size-2 shrink-0 rounded-full beacon-pulse',
              healthTone === 'ok' ? 'bg-[var(--color-success)]' : 'bg-[var(--color-destructive)]',
            )}
          />
          <span className="truncate">{healthLabel}</span>
        </button>

        <button
          type="button"
          onClick={onCommand}
          className="hidden min-h-9 cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-white/[0.03] px-3 text-xs font-medium text-[var(--color-muted-foreground)] transition hover:border-[var(--color-border-strong)] hover:bg-white/[0.06] hover:text-[var(--color-foreground)] active:scale-95 md:inline-flex"
          aria-label="Open command palette"
        >
          <span>Jump to</span>
          <kbd className="rounded border border-[var(--color-border)] bg-black/20 px-1.5 py-0.5 text-[10px]">
            ⌘K
          </kbd>
        </button>

        <IconButton label="Add media" tone="primary" onClick={onAddMedia}>
          <Plus className="size-5" />
        </IconButton>
        <Link
          to="/settings"
          aria-label="Settings"
          className="inline-flex size-[var(--tap)] items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted-foreground)] transition hover:bg-white/5 hover:text-[var(--color-foreground)] active:scale-95 lg:hidden"
        >
          <Settings className="size-5" />
        </Link>
      </div>
    </header>
  )
}
