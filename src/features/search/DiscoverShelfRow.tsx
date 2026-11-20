import { motion } from 'motion/react'
import { Star } from 'lucide-react'

import { SectionHeader } from '@/components/ui/SectionHeader'
import type { DiscoverCard } from '@/lib/services/seerr.discover'

interface DiscoverShelfRowProps {
  title: string
  items: DiscoverCard[]
  onSelect: (item: DiscoverCard) => void
}

export function DiscoverShelfRow({ title, items, onSelect }: DiscoverShelfRowProps) {
  return (
    <section className="space-y-3">
      <SectionHeader title={title} count={items.length} />
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index, 10) * 0.02, duration: 0.28 }}
            onClick={() => onSelect(item)}
            className="group w-[118px] shrink-0 cursor-pointer text-left transition active:scale-[0.97] sm:w-[136px] lg:w-[148px]"
          >
            <div className="relative aspect-[2/3] overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--elevation-sm)] transition-all duration-300 group-hover:border-[var(--color-border-strong)] group-hover:shadow-[var(--elevation-md)]">
              {item.poster ? (
                <img
                  src={item.poster}
                  alt=""
                  className="size-full object-cover transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
                  loading="lazy"
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-[var(--color-muted)] px-2 text-center font-display text-xs font-semibold text-[var(--color-muted-foreground)]">
                  {item.title}
                </div>
              )}
              {item.rating ? (
                <span className="tabular absolute right-1.5 top-1.5 inline-flex items-center gap-0.5 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
                  <Star className="size-2.5 fill-amber-400 text-amber-400" aria-hidden />
                  {item.rating.toFixed(1)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug tracking-tight text-[var(--color-foreground)]">
              {item.title}
            </p>
            <p className="mt-0.5 tabular text-[11px] text-[var(--color-muted-foreground)]">
              {item.year ?? '—'} · {item.type === 'tv' ? 'Series' : 'Movie'}
            </p>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
