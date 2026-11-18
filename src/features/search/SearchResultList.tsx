import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { titlePath } from '@/data/demoTitles'
import type { MediaSearchItem } from '@/hooks/useMediaSearch'
import { cn } from '@/lib/cn'

interface SearchResultListProps {
  items: MediaSearchItem[]
  emptyTitle: string
  emptyDescription: string
  emptyActionLabel?: string
  emptyActionTo?: string
  onAdd?: (item: MediaSearchItem) => void
}

export function SearchResultList({
  items,
  emptyTitle,
  emptyDescription,
  emptyActionLabel,
  emptyActionTo,
  onAdd,
}: SearchResultListProps) {
  const navigate = useNavigate()

  if (items.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={emptyActionLabel}
        actionTo={emptyActionTo}
      />
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={item.id}
          className="flex min-h-[64px] items-center gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-3"
        >
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => {
              if (item.titleId) {
                navigate(titlePath(item.titleId))
                return
              }
              if (onAdd && !item.alreadyAdded) {
                onAdd(item)
                return
              }
              toast.message('Add this title first to open details')
            }}
            className={cn(
              'min-w-0 flex-1 py-3 text-left transition active:scale-[0.99]',
              item.titleId || (onAdd && !item.alreadyAdded)
                ? 'cursor-pointer'
                : 'cursor-default',
            )}
          >
            <p className="text-sm font-semibold">
              {item.title}{' '}
              <span className="font-normal text-[var(--color-muted-foreground)]">
                ({item.year || '—'})
              </span>
            </p>
            <p className="text-xs capitalize text-[var(--color-muted-foreground)]">
              {item.type} · ★ {item.rating.toFixed(1)} · {item.source}
              {item.titleId ? ' · In library' : ''}
            </p>
          </motion.button>
          {!item.alreadyAdded && onAdd ? (
            <Button
              variant="soft"
              className="min-h-10 px-3 text-xs"
              onClick={() => onAdd(item)}
            >
              Add
            </Button>
          ) : item.titleId ? (
            <button
              type="button"
              className="pr-1 text-xs font-medium text-[var(--color-accent)]"
              onClick={() => navigate(titlePath(item.titleId!))}
            >
              Open
            </button>
          ) : null}
        </div>
      ))}
    </div>
  )
}
