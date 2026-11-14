import { motion } from 'motion/react'

import type { DiscoverCard } from '@/lib/services/seerr.discover'

interface DiscoverShelfRowProps {
  title: string
  items: DiscoverCard[]
  onSelect: (item: DiscoverCard) => void
}

export function DiscoverShelfRow({ title, items, onSelect }: DiscoverShelfRowProps) {
  return (
    <section className="space-y-2">
      <h2 className="text-sm font-semibold tracking-wide text-[var(--color-muted-foreground)]">
        {title}
      </h2>
      <div className="no-scrollbar -mx-4 flex gap-2.5 overflow-x-auto px-4 pb-1">
        {items.map((item, index) => (
          <motion.button
            key={item.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.02, duration: 0.28 }}
            onClick={() => onSelect(item)}
            className="w-[108px] shrink-0 cursor-pointer text-left transition active:scale-95"
          >
            <div className="aspect-[2/3] overflow-hidden rounded-xl bg-[var(--color-card)] ring-1 ring-[var(--color-border)]">
              {item.poster ? (
                <img
                  src={item.poster}
                  alt=""
                  className="size-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex size-full items-center justify-center px-2 text-center text-[10px] text-[var(--color-muted-foreground)]">
                  {item.title}
                </div>
              )}
            </div>
            <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-snug">{item.title}</p>
            <p className="text-[10px] text-[var(--color-muted-foreground)]">
              {item.year ?? '—'}
              {item.rating ? ` · ★ ${item.rating.toFixed(1)}` : ''}
            </p>
          </motion.button>
        ))}
      </div>
    </section>
  )
}
