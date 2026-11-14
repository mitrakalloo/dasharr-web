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
  onAddClick: () => void
  scrollTarget?: HTMLElement | null
}

export function TopBar({
  healthLabel,
  healthTone,
  downloadSpeed = 0,
  onHealthClick,
  onAddClick,
  scrollTarget = null,
}: TopBarProps) {
  const scrolled = useScrollY(24, scrollTarget) > 0

  return (
    <header
      className={cn(
        'z-30 shrink-0 border-b px-4 pt-[env(safe-area-inset-top,0px)] transition-[border-color,background-color] duration-300 ease-[var(--ease-out-expo)]',
        scrolled
          ? 'border-[var(--color-border)] bg-[var(--color-background)]/92 backdrop-blur-xl'
          : 'border-transparent bg-[var(--color-background)]/95 backdrop-blur-md',
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
          <p className="truncate text-sm text-[var(--color-muted-foreground)]">
            Media command center
          </p>
        </div>

        {downloadSpeed > 0 ? (
          <Tooltip label="Aggregate download throughput">
            <span className="hidden tabular items-center rounded-full border border-[var(--color-border)] bg-white/5 px-3 py-1.5 text-xs font-medium text-emerald-300 sm:inline-flex">
              ↓ <SpeedValue value={downloadSpeed} className="ml-1" />
            </span>
          </Tooltip>
        ) : null}

        <button
          type="button"
          onClick={onHealthClick}
          title="Open system health"
          className={cn(
            'inline-flex min-h-[var(--tap)] max-w-[46%] cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-medium transition active:scale-95 lg:max-w-none',
            healthTone === 'ok'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-rose-500/30 bg-rose-500/10 text-rose-300',
          )}
        >
          <span
            className={cn(
              'size-2 shrink-0 rounded-full beacon-pulse',
              healthTone === 'ok' ? 'bg-emerald-400' : 'bg-rose-400',
            )}
          />
          <span className="truncate">{healthLabel}</span>
        </button>

        <button
          type="button"
          onClick={onAddClick}
          className="hidden min-h-[var(--tap)] cursor-pointer items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white/5 px-3 text-xs font-medium text-[var(--color-muted-foreground)] transition hover:bg-white/8 hover:text-[var(--color-foreground)] active:scale-95 md:inline-flex"
          aria-label="Open command palette"
        >
          <span>Command</span>
          <kbd className="rounded border border-[var(--color-border)] px-1.5 py-0.5 text-[10px]">
            ⌘K
          </kbd>
        </button>

        <IconButton
          label="Open command palette"
          tone="accent"
          onClick={onAddClick}
          className="md:hidden"
        >
          <Plus className="size-5" />
        </IconButton>
        <Link
          to="/settings"
          aria-label="Settings"
          className="inline-flex size-[var(--tap)] items-center justify-center rounded-xl text-[var(--color-muted-foreground)] transition hover:bg-white/5 hover:text-[var(--color-foreground)] active:scale-95 lg:hidden"
        >
          <Settings className="size-5" />
        </Link>
      </div>
    </header>
  )
}
