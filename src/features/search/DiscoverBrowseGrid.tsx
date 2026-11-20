import { Star } from 'lucide-react'

import type { DiscoverCard } from '@/lib/services/seerr.discover'

interface DiscoverBrowseGridProps {
  items: DiscoverCard[]
  onSelect: (item: DiscoverCard) => void
}

export function DiscoverBrowseGrid({ items, onSelect }: DiscoverBrowseGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="group cursor-pointer text-left transition active:scale-[0.97]"
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
              <div className="flex size-full items-center justify-center bg-[var(--color-muted)] px-3 text-center font-display text-xs font-semibold text-[var(--color-muted-foreground)]">
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
          <p className="mt-2 line-clamp-2 text-xs font-semibold leading-snug tracking-tight">
            {item.title}
          </p>
          <p className="mt-0.5 tabular text-[11px] text-[var(--color-muted-foreground)]">
            {item.year ?? '—'} · {item.type === 'tv' ? 'Series' : 'Movie'}
          </p>
        </button>
      ))}
    </div>
  )
}
