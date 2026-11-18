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

  const sizeClass = size === 'lg' ? 'md:max-w-2xl' : 'md:max-w-xl'

  return (
    <AnimatePresence>
      {open ? (
        <div
          className={cn(
            'fixed inset-0 z-50 flex justify-center',
            asDrawer ? 'items-stretch justify-end' : 'items-end md:items-center',
          )}
        >
          <motion.button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal
            aria-label={title}
            className={cn(
              'relative z-10 flex max-h-[88dvh] w-full flex-col border border-[var(--color-border)] bg-[var(--color-card)] shadow-[var(--panel-highlight),var(--elevation-float)]',
              asDrawer
                ? 'h-full max-h-none w-full max-w-[var(--queue-rail)] rounded-none border-y-0 border-r-0'
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
                    ? { opacity: 0, y: 24, scale: 0.98 }
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
                    ? { opacity: 0, y: 16, scale: 0.98 }
                    : { y: '100%' }
            }
            transition={spring}
            drag={!reduced && !isDesktop ? 'y' : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.55 }}
            onDragEnd={handleDragEnd}
          >
            <div className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-white/20 md:hidden" />
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline)] px-4 py-2.5">
              <h2 className="font-display text-base font-semibold tracking-tight">{title}</h2>
              <IconButton label="Close" onClick={onClose}>
                <X className="size-5" />
              </IconButton>
            </div>
            <div className="overflow-y-auto px-4 pb-[calc(16px+env(safe-area-inset-bottom,0px))] pt-3">
              {children}
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
