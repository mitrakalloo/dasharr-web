import { AnimatePresence, motion, type PanInfo, useReducedMotion } from 'motion/react'
import { useEffect } from 'react'
import { X } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { spring } from '@/lib/motion'
import { useSheetStore } from '@/stores/sheetStore'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const DISMISS_OFFSET = 120
const DISMISS_VELOCITY = 800

export function BottomSheet({ open, onClose, title, children }: BottomSheetProps) {
  const reduced = useReducedMotion()
  const registerOpen = useSheetStore((state) => state.open)
  const registerClose = useSheetStore((state) => state.close)

  useEffect(() => {
    if (!open) return
    registerOpen()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      registerClose()
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, registerOpen, registerClose])

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center">
          <motion.button
            type="button"
            aria-label="Dismiss"
            className="absolute inset-0 bg-[var(--color-overlay)]"
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
            className="relative z-10 flex max-h-[88dvh] w-full max-w-[var(--shell-max)] flex-col rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-card)] md:rounded-3xl"
            initial={reduced ? { opacity: 0 } : { y: '100%' }}
            animate={reduced ? { opacity: 1 } : { y: 0 }}
            exit={reduced ? { opacity: 0 } : { y: '100%' }}
            transition={spring}
            drag={reduced ? false : 'y'}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.05, bottom: 0.55 }}
            onDragEnd={handleDragEnd}
          >
            <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-white/20 md:hidden" />
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-2">
              <h2 className="text-base font-semibold">{title}</h2>
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
