import { cn } from '@/lib/cn'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  tone?: 'default' | 'danger' | 'accent'
}

const toneClass = {
  default: 'text-[var(--color-muted-foreground)] hover:bg-white/5 hover:text-[var(--color-foreground)]',
  danger: 'text-[var(--color-destructive)] hover:bg-rose-500/10',
  accent: 'text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]',
}

export function IconButton({
  label,
  tone = 'default',
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        'inline-flex size-[var(--tap)] shrink-0 cursor-pointer items-center justify-center rounded-xl transition active:scale-95',
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
