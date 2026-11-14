import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export function Input({ className, label, hint, id, ...props }: InputProps) {
  const inputId = id ?? props.name

  return (
    <label className="flex flex-col gap-1.5 text-sm">
      {label ? <span className="font-medium text-[var(--color-muted-foreground)]">{label}</span> : null}
      <input
        id={inputId}
        className={cn(
          'min-h-[52px] rounded-[14px] border border-[var(--color-border)] bg-[var(--color-muted)] px-3 text-base text-[var(--color-foreground)] outline-none transition placeholder:text-[var(--color-placeholder)] focus:border-[var(--color-ring)] focus:ring-1 focus:ring-[var(--color-ring)]',
          className,
        )}
        {...props}
      />
      {hint ? <span className="text-xs text-[var(--color-muted-foreground)]">{hint}</span> : null}
    </label>
  )
}
