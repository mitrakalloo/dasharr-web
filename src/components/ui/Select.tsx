import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/cn'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  hint?: string
  options: SelectOption[]
  wrapperClassName?: string
}

export function Select({
  className,
  wrapperClassName,
  label,
  hint,
  options,
  id,
  ...props
}: SelectProps) {
  const selectId = id ?? props.name

  return (
    <label className={cn('flex flex-col gap-1.5 text-sm', wrapperClassName)}>
      {label ? (
        <span className="text-xs font-semibold tracking-tight text-[var(--color-muted-foreground)]">
          {label}
        </span>
      ) : null}
      <span className="relative flex items-center">
        <select
          id={selectId}
          className={cn(
            'min-h-[var(--tap)] w-full cursor-pointer appearance-none rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-muted)] py-2 pl-3.5 pr-10 text-base text-[var(--color-foreground)] outline-none transition-[border-color,box-shadow,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]',
            'hover:border-[var(--color-border-strong)] focus:border-[var(--color-ring)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary-muted)]',
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 size-4 text-[var(--color-muted-foreground)]"
          aria-hidden
        />
      </span>
      {hint ? <span className="text-xs text-[var(--color-muted-foreground)]">{hint}</span> : null}
    </label>
  )
}
