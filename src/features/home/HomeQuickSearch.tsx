import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'

export function HomeQuickSearch() {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate('/search')}
      className="flex min-h-[52px] w-full cursor-pointer items-center gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-muted)] px-3 text-left transition active:scale-[0.99]"
    >
      <Search className="size-5 text-[var(--color-muted-foreground)]" aria-hidden />
      <span className="text-base text-[var(--color-placeholder)]">Search library or discover…</span>
    </button>
  )
}
