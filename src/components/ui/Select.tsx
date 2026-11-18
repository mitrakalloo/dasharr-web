import { cn } from '@/lib/cn'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
}

export function Select({ className, label, options, id, ...props }: SelectProps) {
  const selectId = id ?? props.name

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? (
        <span className="font-medium tracking-tight text-[var(--color-muted-foreground)]">
          {label}
        </span>
      ) : null}
      <select
        id={selectId}
        className={cn(
          'min-h-[var(--tap)] cursor-pointer rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-muted)] px-3.5 text-base text-[var(--color-foreground)] outline-none transition-[border-color,box-shadow,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)]',
          'focus:border-[var(--color-ring)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary-muted)]',
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
    </label>
  )
}
