import { useId } from 'react'
import { LayoutGroup, motion } from 'motion/react'

import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'

export interface SegmentedOption<T extends string = string> {
  value: T
  label: string
  count?: number
  icon?: React.ReactNode
}

interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[]
  value: T
  onChange: (value: T) => void
  ariaLabel?: string
  variant?: 'pills' | 'segmented'
  size?: 'sm' | 'default'
  className?: string
  bleedMobile?: boolean
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
  variant = 'pills',
  size = 'default',
  className,
  bleedMobile = false,
}: SegmentedControlProps<T>) {
  const id = useId()
  const pillId = `seg-${id}`

  if (variant === 'segmented') {
    return (
      <LayoutGroup id={id}>
        <div
          role="tablist"
          aria-label={ariaLabel}
          className={cn(
            'inline-flex items-center rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-muted)] p-1',
            className,
          )}
        >
          {options.map((option) => {
            const active = option.value === value
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(option.value)}
                className={cn(
                  'relative inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-[var(--radius-md)] font-medium tracking-tight transition-colors active:scale-[0.97]',
                  size === 'sm' ? 'min-h-8 px-3 text-xs' : 'min-h-9 px-3.5 text-sm',
                  active
                    ? 'text-[var(--color-foreground)]'
                    : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]',
                )}
              >
                {active ? (
                  <motion.span
                    layoutId={pillId}
                    transition={spring}
                    className="absolute inset-0 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--elevation-sm)]"
                  />
                ) : null}
                {option.icon ? <span className="relative z-10">{option.icon}</span> : null}
                <span className="relative z-10">{option.label}</span>
                {typeof option.count === 'number' && option.count > 0 ? (
                  <span className="relative z-10 tabular rounded-full bg-[var(--color-primary-muted)] px-1.5 py-0.5 text-[10px] font-semibold leading-none text-[var(--color-primary)]">
                    {option.count}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </LayoutGroup>
    )
  }

  return (
    <LayoutGroup id={id}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        className={cn(
          'no-scrollbar flex items-center gap-1.5 overflow-x-auto py-0.5',
          bleedMobile && '-mx-4 px-4 sm:mx-0 sm:px-0',
          className,
        )}
      >
        {options.map((option) => {
          const active = option.value === value
          return (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onChange(option.value)}
              className={cn(
                'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border font-medium tracking-tight transition-colors active:scale-[0.96]',
                size === 'sm' ? 'min-h-8 px-3 text-xs' : 'min-h-9 px-3.5 text-sm',
                active
                  ? 'border-transparent text-[var(--color-on-primary-container)]'
                  : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]',
              )}
            >
              {active ? (
                <motion.span
                  layoutId={pillId}
                  transition={spring}
                  className="absolute inset-0 rounded-full border border-[var(--color-primary)]/35 bg-[var(--color-primary-container)]"
                />
              ) : null}
              {option.icon ? <span className="relative z-10">{option.icon}</span> : null}
              <span className="relative z-10">{option.label}</span>
              {typeof option.count === 'number' ? (
                <span
                  className={cn(
                    'relative z-10 tabular rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none',
                    active
                      ? 'bg-[var(--color-primary)]/20 text-[var(--color-on-primary-container)]'
                      : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]',
                  )}
                >
                  {option.count}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>
    </LayoutGroup>
  )
}
