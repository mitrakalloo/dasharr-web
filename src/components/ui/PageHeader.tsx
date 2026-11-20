import { cn } from '@/lib/cn'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  description,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-end justify-between gap-3', className)}>
      <div className="min-w-0 flex-1">
        {eyebrow ? (
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="font-display truncate text-2xl font-semibold tracking-tight lg:text-[1.8rem]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}
