import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface SubpageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  onBack?: () => void
  trailing?: React.ReactNode
}

/** Fixed chrome for secondary screens — stays pinned while page content scrolls. */
export function SubpageHeader({
  title,
  subtitle,
  backTo = '/',
  onBack,
  trailing,
}: SubpageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-background)]/92 px-4 pt-[max(8px,env(safe-area-inset-top,0px))] backdrop-blur-xl">
      <div className="flex min-h-14 items-center gap-2 py-2">
        {onBack ? (
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="inline-flex size-[var(--tap)] shrink-0 cursor-pointer items-center justify-center rounded-xl text-[var(--color-muted-foreground)] transition hover:bg-white/5 active:scale-95"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <Link
            to={backTo}
            aria-label="Back"
            className="inline-flex size-[var(--tap)] shrink-0 items-center justify-center rounded-xl text-[var(--color-muted-foreground)] transition hover:bg-white/5 active:scale-95"
          >
            <ArrowLeft className="size-5" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-semibold tracking-tight">{title}</h1>
          {subtitle ? (
            <p className="truncate text-sm text-[var(--color-muted-foreground)]">{subtitle}</p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  )
}
