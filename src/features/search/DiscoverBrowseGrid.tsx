import type { DiscoverCard } from '@/lib/services/seerr.discover'

interface DiscoverBrowseGridProps {
  items: DiscoverCard[]
  onSelect: (item: DiscoverCard) => void
}

export function DiscoverBrowseGrid({ items, onSelect }: DiscoverBrowseGridProps) {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(item)}
          className="cursor-pointer text-left transition active:scale-95"
        >
          <div className="aspect-[2/3] overflow-hidden rounded-xl bg-[var(--color-card)] ring-1 ring-[var(--color-border)]">
            {item.poster ? (
              <img src={item.poster} alt="" className="size-full object-cover" loading="lazy" />
            ) : null}
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs font-medium">{item.title}</p>
        </button>
      ))}
    </div>
  )
}
