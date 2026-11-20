import { cn } from '@/lib/cn'

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label: string
  tone?: 'default' | 'danger' | 'accent' | 'primary' | 'success'
  size?: 'default' | 'sm'
}

const toneClass = {
  default:
    'text-[var(--color-muted-foreground)] hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]',
  danger: 'text-[var(--color-destructive)] hover:bg-[var(--color-destructive-muted)]',
  accent: 'text-[var(--color-accent)] hover:bg-[var(--color-warning-muted)]',
  primary: 'text-[var(--color-primary)] hover:bg-[var(--color-primary-muted)]',
  success: 'text-[var(--color-success)] hover:bg-[var(--color-success-muted)]',
}

export function IconButton({
  label,
  tone = 'default',
  size = 'default',
  className,
  children,
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={props.title ?? label}
      className={cn(
        'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-[var(--radius-md)] transition-[transform,background-color,color] duration-[var(--duration-fast)] ease-[var(--ease-out-expo)] active:scale-95 disabled:pointer-events-none disabled:opacity-40',
        size === 'sm' ? 'size-9' : 'size-[var(--tap)]',
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
