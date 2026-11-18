import { cn } from '@/lib/cn'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  tone?: 'default' | 'danger' | 'accent' | 'primary'
}

const toneClass = {
  default:
    'text-[var(--color-muted-foreground)] hover:bg-white/6 hover:text-[var(--color-foreground)]',
  danger: 'text-[var(--color-destructive)] hover:bg-[var(--color-destructive)]/10',
  accent: 'text-[var(--color-accent)] hover:bg-[var(--color-accent)]/12',
  primary: 'text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]',
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
        'inline-flex size-[var(--tap)] shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] transition-[transform,background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] active:scale-95',
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
