import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex min-h-[var(--tap)] cursor-pointer items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--color-foreground)] text-[var(--color-on-primary)]',
        secondary: 'bg-[var(--color-card-elevated)] text-[var(--color-foreground)] border border-[var(--color-border)]',
        ghost: 'bg-transparent text-[var(--color-foreground)] hover:bg-white/5',
        danger: 'bg-[var(--color-destructive)] text-white',
        soft: 'bg-white/5 text-[var(--color-foreground)]',
      },
    },
    defaultVariants: { variant: 'primary' },
  },
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonVariants({ variant }), className)} {...props} />
}
