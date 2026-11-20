import { AnimatePresence, motion, type PanInfo, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { X } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { useIsDesktop } from '@/hooks/useMediaQuery'
import { spring } from '@/lib/motion'
import { cn } from '@/lib/cn'
import { useSheetStore } from '@/stores/sheetStore'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  subtitle?: string
  children: React.ReactNode
  /** Desktop presentation: centered modal (default) or right slide-over inspector. */
  desktop?: 'modal' | 'drawer'
  size?: 'md' | 'lg'
}

const DISMISS_OFFSET = 120
const DISMISS_VELOCITY = 800

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  desktop = 'modal',
  size = 'md',
}: BottomSheetProps) {
  const reduced = useReducedMotion()
  const isDesktop = useIsDesktop()
  const registerOpen = useSheetStore((state) => state.open)
  const registerClose = useSheetStore((state) => state.close)
  const asDrawer = isDesktop && desktop === 'drawer'
  const asModal = isDesktop && desktop === 'modal'

  useEffect(() => {
    if (!open) return
    registerOpen()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      registerClose()
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, registerOpen, registerClose])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
      onClose()
    }
  }

  const sizeClass = size === 'lg' ? 'md:max-w-2xl' : 'md:max-w-lg'

  return (
    <AnimatePresence>
      {open ? (
        <div
          className={cn(
            'fixed inset-0 z-50 flex justify-center',
            asDrawer ? 'items-stretch justify-end' : 'items-end md:items-center md:p-4',
          )}
        >
          <motion.button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 cursor-default bg-[var(--color-overlay)] backdrop-blur-[4px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={title}
            className={cn(
              'relative z-10 flex max-h-[88dvh] w-full flex-col border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--panel-highlight),var(--elevation-float)]',
              asDrawer
                ? 'h-full max-h-none w-full max-w-[400px] rounded-none border-y-0 border-r-0'
                : cn(
                    'max-w-[var(--sheet-max)] rounded-t-[var(--radius-2xl)] md:rounded-[var(--radius-2xl)]',
                    sizeClass,
                  ),
            )}
            initial={
              reduced
                ? { opacity: 0 }
                : asDrawer
                  ? { x: '100%' }
                  : asModal
                    ? { opacity: 0, y: 18, scale: 0.97 }
                    : { y: '100%' }
            }
            animate={
              reduced
                ? { opacity: 1 }
                : asDrawer
                  ? { x: 0 }
                  : asModal
                    ? { opacity: 1, y: 0, scale: 1 }
                    : { y: 0 }
            }
            exit={
              reduced
                ? { opacity: 0 }
                : asDrawer
                  ? { x: '100%' }
                  : asModal
                    ? { opacity: 0, y: 12, scale: 0.97 }
                    : { y: '100%' }
            }
            transition={spring}
            drag={!reduced && !isDesktop ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.55 }}
            onDragEnd={handleDragEnd}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-[var(--color-handle)] md:hidden" />
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline)] px-5 py-3.5">
              <div className="min-w-0">
                <h2 className="font-display truncate text-base font-semibold tracking-tight">
                  {title}
                </h2>
                {subtitle ? (
                  <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
                    {subtitle}
                  </p>
                ) : null}
              </div>
              <IconButton label="Close" size="sm" onClick={onClose}>
                <X className="size-4" />
              </IconButton>
            </div>
            <div className="custom-scrollbar overflow-y-auto px-5 pb-[calc(20px+env(safe-area-inset-bottom,0px))] pt-4">
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
