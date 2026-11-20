import { Reorder, useDragControls } from 'motion/react'
import { ArrowDown, ArrowUp, ChevronsUp, GripVertical } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { DASHBOARD_WIDGET_META } from '@/lib/dashboard/dashboard.meta'
import type { DashboardWidgetConfig, DashboardWidgetId } from '@/lib/dashboard/dashboard.types'

interface EditHomeWidgetRowProps {
  widget: DashboardWidgetConfig
  isFirst?: boolean
  isLast?: boolean
  onToggle: (id: DashboardWidgetId) => void
  onMove: (id: DashboardWidgetId, direction: 'up' | 'down') => void
  onMoveToTop: (id: DashboardWidgetId) => void
}

export function EditHomeWidgetRow({
  widget,
  isFirst = false,
  isLast = false,
  onToggle,
  onMove,
  onMoveToTop,
}: EditHomeWidgetRowProps) {
  const dragControls = useDragControls()
  const meta = DASHBOARD_WIDGET_META.find((item) => item.id === widget.id)

  return (
    <Reorder.Item
      value={widget}
      dragListener={false}
      dragControls={dragControls}
      className={cn(
        'panel flex items-center gap-2.5 rounded-[var(--radius-xl)] px-3 py-3 transition-opacity select-none',
        !widget.enabled && 'opacity-60',
      )}
      whileDrag={{ scale: 1.015, zIndex: 20 }}
    >
      <button
        type="button"
        aria-label={`Drag ${meta?.label ?? widget.id}`}
        onPointerDown={(event) => dragControls.start(event)}
        className="inline-flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] active:cursor-grabbing"
      >
        <GripVertical className="size-4" aria-hidden />
      </button>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold tracking-tight">
          {meta?.label ?? widget.id}
        </p>
        {meta?.description ? (
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
            {meta.description}
          </p>
        ) : null}
      </div>

      <Switch
        checked={widget.enabled}
        onCheckedChange={() => onToggle(widget.id)}
      />

      <div className="flex shrink-0 items-center gap-0.5 border-l border-[var(--color-hairline)] pl-2">
        <IconButton
          label="Move to top"
          size="sm"
          disabled={isFirst}
          onClick={() => onMoveToTop(widget.id)}
        >
          <ChevronsUp className="size-4" />
        </IconButton>
        <IconButton
          label="Move up"
          size="sm"
          disabled={isFirst}
          onClick={() => onMove(widget.id, 'up')}
        >
          <ArrowUp className="size-4" />
        </IconButton>
        <IconButton
          label="Move down"
          size="sm"
          disabled={isLast}
          onClick={() => onMove(widget.id, 'down')}
        >
          <ArrowDown className="size-4" />
        </IconButton>
      </div>
    </Reorder.Item>
  )
}
