import { ArrowDown, ArrowUp, ChevronsUp } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { DASHBOARD_WIDGET_META } from '@/lib/dashboard/dashboard.meta'
import type { DashboardWidgetConfig, DashboardWidgetId } from '@/lib/dashboard/dashboard.types'
import { cn } from '@/lib/cn'

interface EditHomeWidgetRowProps {
  widget: DashboardWidgetConfig
  onToggle: (id: DashboardWidgetId) => void
  onMove: (id: DashboardWidgetId, direction: 'up' | 'down') => void
  onMoveToTop: (id: DashboardWidgetId) => void
}

export function EditHomeWidgetRow({
  widget,
  onToggle,
  onMove,
  onMoveToTop,
}: EditHomeWidgetRowProps) {
  const meta = DASHBOARD_WIDGET_META.find((item) => item.id === widget.id)

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-3',
        !widget.enabled && 'opacity-55',
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{meta?.label ?? widget.id}</p>
        <p className="text-xs text-[var(--color-muted-foreground)]">{meta?.description}</p>
      </div>
      <button
        type="button"
        onClick={() => onToggle(widget.id)}
        className={cn(
          'min-h-10 shrink-0 cursor-pointer rounded-full border px-3 text-xs font-semibold transition active:scale-95',
          widget.enabled
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-secondary)]'
            : 'border-[var(--color-border-strong)] bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
        )}
      >
        {widget.enabled ? 'On' : 'Off'}
      </button>
      <div className="flex shrink-0 gap-0.5">
        <IconButton label="Move to top" onClick={() => onMoveToTop(widget.id)}>
          <ChevronsUp className="size-4" />
        </IconButton>
        <IconButton label="Move up" onClick={() => onMove(widget.id, 'up')}>
          <ArrowUp className="size-4" />
        </IconButton>
        <IconButton label="Move down" onClick={() => onMove(widget.id, 'down')}>
          <ArrowDown className="size-4" />
        </IconButton>
      </div>
    </div>
  )
}
