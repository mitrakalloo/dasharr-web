import { motion } from 'motion/react'

import { snappySpring } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface SwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  description?: string
  ariaLabel?: string
  disabled?: boolean
  className?: string
  id?: string
}

export function Switch({
  checked,
  onCheckedChange,
  label,
  description,
  ariaLabel,
  disabled = false,
  className,
  id,
}: SwitchProps) {
  const control = (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? label}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-colors duration-[var(--duration-base)] ease-[var(--ease-out-expo)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-45',
        checked
          ? 'border-[var(--color-primary)] bg-[var(--color-primary)]'
          : 'border-[var(--color-border-strong)] bg-[var(--color-muted)]',
      )}
    >
      <motion.span
        layout
        transition={snappySpring}
        className={cn(
          'block size-5 rounded-full bg-white shadow-sm',
          checked ? 'ml-auto' : 'mr-auto',
        )}
      />
    </button>
  )

  if (!label && !description) return control

  return (
    <div
      className={cn(
        'flex min-h-[var(--tap)] items-center justify-between gap-4 rounded-[var(--radius-lg)] px-3 py-2.5 transition-colors hover:bg-[var(--color-hover)]',
        disabled && 'opacity-50',
        className,
      )}
    >
      <div
        className="min-w-0 flex-1 cursor-pointer select-none"
        onClick={() => {
          if (!disabled) onCheckedChange(!checked)
        }}
      >
        {label ? <p className="text-sm font-medium tracking-tight">{label}</p> : null}
        {description ? (
          <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">{description}</p>
        ) : null}
      </div>
      {control}
    </div>
  )
}
