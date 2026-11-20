import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export function HomeQuickSearch() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate('/search')}
      className="panel group flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-[var(--radius-xl)] px-4 text-left transition-all duration-200 hover:border-[var(--color-border-strong)] hover:bg-[var(--color-card-elevated)] active:scale-[0.99]"
    >
      <Search
        className="size-4.5 shrink-0 text-[var(--color-muted-foreground)] transition-colors group-hover:text-[var(--color-primary)]"
        aria-hidden
      />
      <span className="min-w-0 flex-1 truncate text-sm text-[var(--color-placeholder)] sm:text-[15px]">
        Search your library, discover shelves, or request a title…
      </span>
      <kbd className="hidden rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-kbd-bg)] px-2 py-0.5 font-mono text-[11px] text-[var(--color-muted-foreground)] sm:inline">
        /search
      </kbd>
    </button>
  )
}
