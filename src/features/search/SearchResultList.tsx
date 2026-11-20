import { useNavigate } from 'react-router-dom'
import { motion } from 'motion/react'
import { ExternalLink, Plus, Star } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { titlePath } from '@/data/demoTitles'
import type { MediaSearchItem } from '@/hooks/useMediaSearch'
import { serviceAccent } from '@/lib/serviceColors'
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
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {items.map((item, index) => {
        const accent = serviceAccent(item.source)
        const clickable = Boolean(item.titleId || (onAdd && !item.alreadyAdded))

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: Math.min(index, 8) * 0.025,
              duration: 0.28,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="magnetic panel flex items-center gap-3 rounded-[var(--radius-2xl)] p-3 hover:bg-[var(--color-card-elevated)]"
            style={{ ['--glow' as string]: accent }}
          >
            <button
              type="button"
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
                'flex min-w-0 flex-1 items-center gap-3 text-left transition active:scale-[0.99]',
                clickable ? 'cursor-pointer' : 'cursor-default',
              )}
            >
              <PosterThumb
                src={item.poster}
                label={item.title}
                accent={accent}
                className="h-[72px] w-12"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <Badge color={accent}>{item.source}</Badge>
                  <Badge>{item.type}</Badge>
                  {item.titleId ? <Badge tone="success">In library</Badge> : null}
                </div>
                <p className="mt-1.5 truncate text-sm font-semibold tracking-tight">
                  {item.title}{' '}
                  <span className="font-normal text-[var(--color-muted-foreground)]">
                    ({item.year || '—'})
                  </span>
                </p>
                {item.rating > 0 ? (
                  <p className="mt-0.5 inline-flex items-center gap-1 tabular text-xs text-[var(--color-muted-foreground)]">
                    <Star className="size-3 fill-[var(--color-warning)] text-[var(--color-warning)]" aria-hidden />
                    <span>{item.rating.toFixed(1)}</span>
                  </p>
                ) : null}
              </div>
            </button>

            {!item.alreadyAdded && onAdd ? (
              <Button variant="soft" size="sm" className="shrink-0" onClick={() => onAdd(item)}>
                <Plus className="size-3.5" aria-hidden />
                {item.source === 'seerr' ? 'Request' : 'Add'}
              </Button>
            ) : item.titleId ? (
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={() => navigate(titlePath(item.titleId!))}
              >
                <ExternalLink className="size-3.5" aria-hidden />
                Open
              </Button>
            ) : null}
          </motion.div>
        )
      })}
    </div>
  )
}
