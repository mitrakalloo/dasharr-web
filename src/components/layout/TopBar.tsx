import { Link } from 'react-router-dom'
import { AlertTriangle, Plus, Search, Settings } from 'lucide-react'

import { DasharrWordmark } from '@/components/brand/DasharrMark'
import { BandwidthPopover } from '@/components/layout/BandwidthPopover'
import { IconButton } from '@/components/ui/IconButton'
import { Tooltip } from '@/components/ui/Tooltip'
import { useScrollY } from '@/hooks/useScrollY'
import { cn } from '@/lib/cn'

interface TopBarProps {
  title: string
  subtitle: string
  healthLabel: string
  healthTone: 'ok' | 'warning'
  warningsCount?: number
  downloadSpeed?: number
  onHealthClick: () => void
  onAddMedia: () => void
  onCommand: () => void
  scrollTarget?: HTMLElement | null
}

export function TopBar({
  title,
  subtitle,
  healthLabel,
  healthTone,
  warningsCount = 0,
  downloadSpeed = 0,
  onHealthClick,
  onAddMedia,
  onCommand,
  scrollTarget = null,
}: TopBarProps) {
  const scrolled = useScrollY(20, scrollTarget) > 0
  const hasAlerts = healthTone === 'warning' || warningsCount > 0

  return (
    <header
      className={cn(
        'z-30 shrink-0 border-b px-4 pt-[env(safe-area-inset-top,0px)] transition-[border-color,background-color,backdrop-filter] duration-300 ease-[var(--ease-out-expo)] sm:px-6 lg:px-8',
        scrolled
          ? 'border-[var(--color-hairline)] bg-[var(--color-surface-header)] backdrop-blur-2xl'
          : 'border-transparent bg-transparent',
      )}
    >
      <div
        className={cn(
          'mx-auto flex max-w-[var(--content-max)] items-center gap-2.5 transition-[height] duration-300 ease-[var(--ease-out-expo)]',
          scrolled ? 'h-14' : 'h-16',
        )}
      >
        <div className="min-w-0 flex-1 lg:hidden">
          <Link to="/" aria-label="Dasharr Home" className="inline-flex">
            <DasharrWordmark
              compact
              className={cn('transition-transform', scrolled && 'scale-95 origin-left')}
            />
          </Link>
        </div>

        <div className="hidden min-w-0 flex-1 items-center gap-2.5 lg:flex">
          <span className="font-display truncate text-[15px] font-semibold tracking-tight text-[var(--color-foreground)]">
            {title}
          </span>
          <span className="text-[var(--color-border-strong)]" aria-hidden>
            /
          </span>
          <span className="truncate text-xs text-[var(--color-muted-foreground)]">{subtitle}</span>
        </div>

        <BandwidthPopover downloadSpeed={downloadSpeed} />

        <button
          type="button"
          onClick={onHealthClick}
          title="Open system health & alerts"
          className={cn(
            'inline-flex min-h-9 max-w-[44%] cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-medium transition-[transform,background-color,border-color] duration-[var(--duration-fast)] active:scale-95 sm:max-w-none',
            healthTone === 'warning'
              ? 'border-[var(--color-destructive)]/30 bg-[var(--color-destructive-muted)] text-[var(--color-destructive)] hover:border-[var(--color-destructive)]/50'
              : warningsCount > 0
                ? 'border-[var(--color-warning)]/35 bg-[var(--color-warning-muted)] text-[var(--color-warning)] hover:border-[var(--color-warning)]/60'
                : 'border-[var(--color-success)]/30 bg-[var(--color-success-muted)] text-[var(--color-success)] hover:border-[var(--color-success)]/50',
          )}
        >
          {warningsCount > 0 && healthTone === 'ok' ? (
            <AlertTriangle className="size-3.5 shrink-0" aria-hidden />
          ) : (
            <span
              className={cn(
                'size-2 shrink-0 rounded-full beacon-pulse',
                healthTone === 'ok'
                  ? 'bg-[var(--color-success)]'
                  : 'bg-[var(--color-destructive)]',
              )}
            />
          )}
          <span className="truncate">
            {hasAlerts && warningsCount > 0 && healthTone === 'ok'
              ? `${warningsCount} ${warningsCount === 1 ? 'alert' : 'alerts'}`
              : healthLabel}
          </span>
          {warningsCount > 0 && healthTone === 'warning' ? (
            <span className="rounded-full bg-[var(--color-destructive)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white tabular">
              +{warningsCount}
            </span>
          ) : null}
        </button>

        <button
          type="button"
          onClick={onCommand}
          className="hidden min-h-9 cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-xs font-medium text-[var(--color-muted-foreground)] shadow-[var(--elevation-sm)] transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-card-elevated)] hover:text-[var(--color-foreground)] active:scale-95 md:inline-flex"
          aria-label="Open command palette"
        >
          <Search className="size-3.5" aria-hidden />
          <span>Jump to…</span>
          <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-kbd-bg)] px-1.5 py-0.5 font-mono text-[10px]">
            ⌘K
          </kbd>
        </button>

        <Tooltip label="Search & add media" side="bottom">
          <IconButton
            label="Add media"
            tone="primary"
            onClick={onAddMedia}
            className="border border-[var(--color-primary)]/25 bg-[var(--color-primary-muted)] hover:bg-[var(--color-primary-container)]"
          >
            <Plus className="size-5" />
          </IconButton>
        </Tooltip>

        <Link
          to="/settings"
          aria-label="Settings"
          className="inline-flex size-[var(--tap)] items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] active:scale-95 lg:hidden"
        >
          <Settings className="size-5" />
        </Link>
      </div>
    </header>
  )
}
