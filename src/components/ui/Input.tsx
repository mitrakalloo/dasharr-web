import { useState } from 'react'
import { Eye, EyeOff, X } from 'lucide-react'

import { cn } from '@/lib/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
  error?: string
  leadingIcon?: React.ReactNode
  trailing?: React.ReactNode
  onClear?: () => void
  wrapperClassName?: string
}

export function Input({
  className,
  wrapperClassName,
  label,
  hint,
  error,
  leadingIcon,
  trailing,
  onClear,
  id,
  type,
  value,
  ...props
}: InputProps) {
  const inputId = id ?? props.name
  const [revealed, setRevealed] = useState(false)
  const isPassword = type === 'password'
  const effectiveType = isPassword ? (revealed ? 'text' : 'password') : type
  const hasValue = value != null && String(value).length > 0
  const showClear = Boolean(onClear && hasValue && !props.disabled)

  return (
    <label className={cn('flex flex-col gap-1.5 text-sm', wrapperClassName)}>
      {label ? (
        <span className="text-xs font-semibold tracking-tight text-[var(--color-muted-foreground)]">
          {label}
        </span>
      ) : null}
      <span className="relative flex items-center">
        {leadingIcon ? (
          <span
            className="pointer-events-none absolute left-3.5 flex items-center text-[var(--color-muted-foreground)]"
            aria-hidden
          >
            {leadingIcon}
          </span>
        ) : null}
        <input
          id={inputId}
          type={effectiveType}
          value={value}
          aria-invalid={error ? true : undefined}
          className={cn(
            'min-h-[var(--tap)] w-full rounded-[var(--radius-lg)] border bg-[var(--color-muted)] px-3.5 text-base text-[var(--color-foreground)] outline-none transition-[border-color,box-shadow,background-color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] placeholder:text-[var(--color-placeholder)]',
            'focus:border-[var(--color-ring)] focus:bg-[var(--color-card)] focus:ring-2 focus:ring-[var(--color-primary-muted)]',
            leadingIcon && 'pl-10',
            (showClear || isPassword || trailing) && 'pr-10',
            error
              ? 'border-[var(--color-destructive)]/60 focus:border-[var(--color-destructive)] focus:ring-[var(--color-destructive-muted)]'
              : 'border-[var(--color-border)] hover:border-[var(--color-border-strong)]',
            className,
          )}
          {...props}
        />
        {showClear ? (
          <button
            type="button"
            aria-label="Clear input"
            onClick={(event) => {
              event.preventDefault()
              onClear?.()
            }}
            className="absolute right-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]"
          >
            <X className="size-4" />
          </button>
        ) : isPassword ? (
          <button
            type="button"
            aria-label={revealed ? 'Hide password' : 'Show password'}
            onClick={(event) => {
              event.preventDefault()
              setRevealed((prev) => !prev)
            }}
            className="absolute right-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]"
          >
            {revealed ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        ) : trailing ? (
          <span className="absolute right-3 flex items-center">{trailing}</span>
        ) : null}
      </span>
      {error ? (
        <span className="text-xs font-medium text-[var(--color-destructive)]">{error}</span>
      ) : hint ? (
        <span className="text-xs text-[var(--color-muted-foreground)]">{hint}</span>
      ) : null}
    </label>
  )
}
