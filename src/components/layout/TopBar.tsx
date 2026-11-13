import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { Plus, Settings } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { useScrollY } from '@/hooks/useScrollY'
import { cn } from '@/lib/cn'

interface TopBarProps {
  healthLabel: string
  healthTone: 'ok' | 'warning'
  onHealthClick: () => void
  onAddClick: () => void
  scrollTarget?: HTMLElement | null
}

export function TopBar({
  healthLabel,
  healthTone,
  onHealthClick,
  onAddClick,
  scrollTarget = null,
}: TopBarProps) {
  const scrolled = useScrollY(24, scrollTarget) > 0

  return (
    <motion.header
      className={cn(
        'z-30 shrink-0 border-b px-4 pt-[env(safe-area-inset-top,0px)] transition-[border-color,background-color] duration-300 ease-[var(--ease-out-expo)]',
        scrolled
          ? 'border-[var(--color-border)]/80 bg-[var(--color-background)]/72 backdrop-blur-xl'
          : 'border-transparent bg-[var(--color-background)]/90 backdrop-blur-md',
      )}
      animate={{ height: scrolled ? 52 : 56 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className={cn(
          'flex items-center gap-2 transition-[height] duration-300 ease-[var(--ease-out-expo)]',
          scrolled ? 'h-10' : 'h-14',
        )}
      >
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'truncate font-semibold tracking-tight transition-[font-size] duration-300 ease-[var(--ease-out-expo)]',
              scrolled ? 'text-base' : 'text-lg',
            )}
          >
            Dasharr
          </p>
        </div>

        <button
          type="button"
          onClick={onHealthClick}
          className={cn(
            'inline-flex min-h-[var(--tap)] max-w-[46%] cursor-pointer items-center gap-2 rounded-full border px-3 text-xs font-medium transition active:scale-95',
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

        <IconButton label="Add media" tone="accent" onClick={onAddClick}>
          <Plus className="size-5" />
        </IconButton>
        <Link
          to="/settings"
          aria-label="Settings"
          className="inline-flex size-[var(--tap)] items-center justify-center rounded-xl text-[var(--color-muted-foreground)] transition hover:bg-white/5 hover:text-[var(--color-foreground)] active:scale-95"
        >
          <Settings className="size-5" />
        </Link>
      </div>
    </motion.header>
  )
}
