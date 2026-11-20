import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronRight } from 'lucide-react'

export interface BreadcrumbItem {
  label: string
  to?: string
}

interface SubpageHeaderProps {
  title: string
  subtitle?: string
  backTo?: string
  onBack?: () => void
  breadcrumbs?: BreadcrumbItem[]
  trailing?: React.ReactNode
}

/** Fixed chrome for secondary screens — stays pinned while page content scrolls. */
export function SubpageHeader({
  title,
  subtitle,
  backTo = '/',
  onBack,
  breadcrumbs,
  trailing,
}: SubpageHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--color-hairline)] bg-[var(--color-surface-header)] px-4 pt-[max(6px,env(safe-area-inset-top,0px))] backdrop-blur-2xl sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-14 max-w-[var(--content-max)] items-center gap-2.5 py-2">
        {onBack ? (
          <button
            type="button"
            aria-label="Back"
            onClick={onBack}
            className="inline-flex size-[var(--tap)] shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] active:scale-95"
          >
            <ArrowLeft className="size-5" />
          </button>
        ) : (
          <Link
            to={backTo}
            aria-label="Back"
            className="inline-flex size-[var(--tap)] shrink-0 items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)] active:scale-95"
          >
            <ArrowLeft className="size-5" />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          {breadcrumbs && breadcrumbs.length > 0 ? (
            <nav
              aria-label="Breadcrumb"
              className="mb-0.5 flex items-center gap-1 overflow-x-auto text-[11px] font-medium text-[var(--color-muted-foreground)] no-scrollbar"
            >
              {breadcrumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="inline-flex shrink-0 items-center gap-1">
                  {index > 0 ? <ChevronRight className="size-3 opacity-60" aria-hidden /> : null}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="rounded px-1 py-0.5 transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="px-1 text-[var(--color-foreground)]">{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          ) : null}
          <h1 className="font-display truncate text-lg font-semibold tracking-tight sm:text-xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-xs text-[var(--color-muted-foreground)] sm:text-sm">
              {subtitle}
            </p>
          ) : null}
        </div>
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
      </div>
    </header>
  )
}
