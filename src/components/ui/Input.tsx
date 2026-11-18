import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
}

export function Input({ className, label, hint, error, id, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? (
        <span className="font-medium tracking-tight text-[var(--color-muted-foreground)]">
          {label}
        </span>
      ) : null}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={cn(
          'min-h-[var(--tap)] rounded-[var(--radius-lg)] border bg-[var(--color-muted)] px-3.5 text-base text-[var(--color-foreground)] outline-none transition-[border-color,box-shadow,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] placeholder:text-[var(--color-placeholder)]',
          'focus:border-[var(--color-ring)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary-muted)]',
          error
            ? 'border-[var(--color-destructive)]/60 focus:border-[var(--color-destructive)] focus:ring-[var(--color-destructive)]/20'
            : 'border-[var(--color-border)]',
          className,
        )}
        {...props}
      />
      {error ? (
        <span className="text-xs text-[var(--color-destructive)]">{error}</span>
      ) : hint ? (
        <span className="text-xs text-[var(--color-muted-foreground)]">{hint}</span>
      ) : null}
    </label>
  )
}
