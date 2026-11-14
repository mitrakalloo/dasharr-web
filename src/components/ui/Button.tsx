import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex min-h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[14px] px-6 text-sm font-semibold transition active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-ring)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--color-primary)] text-[var(--color-on-primary)] shadow-[var(--elevation-glow)]',
        secondary:
          'border border-[var(--color-border)] bg-[var(--color-card-elevated)] text-[var(--color-foreground)] shadow-[var(--elevation-md)]',
        ghost: 'bg-transparent text-[var(--color-foreground)] hover:bg-white/5',
        danger: 'bg-[var(--color-destructive)] text-white',
        soft: 'bg-[var(--color-primary-muted)] text-[var(--color-secondary)]',
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
