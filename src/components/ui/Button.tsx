import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex min-h-[var(--tap)] cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-lg)] px-5 text-sm font-semibold tracking-tight transition-[transform,background-color,box-shadow,border-color,opacity,color] duration-[var(--duration-base)] ease-[var(--ease-out-expo)] active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)] disabled:pointer-events-none disabled:opacity-45',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--elevation-glow)] hover:brightness-110',
        secondary:
          'border border-[var(--color-border)] bg-[var(--color-card-elevated)] text-[var(--color-foreground)] shadow-[var(--elevation-sm)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-muted)]',
        ghost:
          'bg-transparent text-[var(--color-foreground)] hover:bg-white/5',
        danger:
          'bg-[var(--color-destructive)] text-white shadow-[0_8px_24px_rgba(255,107,122,0.28)] hover:brightness-110',
        soft:
          'bg-[var(--color-primary-muted)] text-[var(--color-secondary)] hover:bg-[var(--color-primary)]/20',
        accent:
          'bg-[var(--color-accent)] text-[var(--color-on-accent)] shadow-[0_8px_24px_rgba(245,185,66,0.28)] hover:brightness-105',
      },
      size: {
        default: 'min-h-[var(--tap)] px-5',
        sm: 'min-h-9 rounded-[var(--radius-md)] px-3.5 text-xs',
        lg: 'min-h-14 rounded-[var(--radius-xl)] px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  },
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

export function Button({
  className,
  variant,
  size,
  type = 'button',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? (
        <span
          className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  )
}
