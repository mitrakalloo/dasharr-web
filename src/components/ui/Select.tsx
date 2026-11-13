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
      {label ? <span className="font-medium text-[var(--color-muted-foreground)]">{label}</span> : null}
      <select
        id={selectId}
        className={cn(
          'min-h-[var(--tap)] cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 text-base text-[var(--color-foreground)] outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)]',
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
