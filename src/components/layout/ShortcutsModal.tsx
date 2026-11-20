import { useEffect } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { Keyboard, X } from 'lucide-react'

import { G_CHORDS } from '@/components/layout/nav.constants'
import { spring } from '@/lib/motion'

interface ShortcutsModalProps {
  open: boolean
  onClose: () => void
}

const GLOBAL_SHORTCUTS = [
  { keys: ['⌘', 'K'], label: 'Open command palette & live search' },
  { keys: ['?'], label: 'Show keyboard shortcuts' },
  { keys: ['1', '–', '9'], label: 'Jump directly to numbered navigation items' },
  { keys: ['ESC'], label: 'Close open modal, drawer, or sheet' },
]

export function ShortcutsModal({ open, onClose }: ShortcutsModalProps) {
  const reduced = useReducedMotion()

  useEffect(() => {
    if (!open) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Keyboard shortcuts"
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        >
          <motion.button
            type="button"
            aria-label="Close shortcuts"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.16 }}
            className="absolute inset-0 cursor-default bg-[var(--color-overlay)] backdrop-blur-[5px]"
          />

          <motion.div
            initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 6 }}
            transition={spring}
            className="panel-elevated relative z-10 flex max-h-[82dvh] w-full max-w-xl flex-col overflow-hidden rounded-[var(--radius-2xl)] shadow-[var(--panel-highlight),var(--elevation-float)]"
          >
            <div className="flex items-center justify-between gap-3 border-b border-[var(--color-hairline)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex size-8 items-center justify-center rounded-[var(--radius-md)] border border-[var(--color-primary)]/25 bg-[var(--color-primary-muted)] text-[var(--color-primary)]">
                  <Keyboard className="size-4" aria-hidden />
                </span>
                <div>
                  <h2 className="font-display text-base font-semibold tracking-tight">
                    Keyboard shortcuts
                  </h2>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    Navigate Dasharr without leaving the keyboard
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-[var(--radius-md)] text-[var(--color-muted-foreground)] transition-colors hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="custom-scrollbar space-y-5 overflow-y-auto p-5">
              <section className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                  Global
                </h3>
                <div className="divide-y divide-[var(--color-hairline)] rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)]">
                  {GLOBAL_SHORTCUTS.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 px-3.5 py-2.5 text-sm"
                    >
                      <span className="text-[var(--color-foreground)]">{item.label}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        {item.keys.map((key, idx) => (
                          <kbd
                            key={`${key}-${idx}`}
                            className="rounded border border-[var(--color-border)] bg-[var(--color-kbd-bg)] px-1.5 py-0.5 font-mono text-[11px] font-medium text-[var(--color-muted-foreground)]"
                          >
                            {key}
                          </kbd>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                  Go to (press G then key)
                </h3>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                  {G_CHORDS.map((chord) => (
                    <div
                      key={chord.to}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-[var(--color-foreground)]">
                        {chord.label}
                      </span>
                      <span className="flex items-center gap-1">
                        <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-kbd-bg)] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[var(--color-muted-foreground)]">
                          G
                        </kbd>
                        <kbd className="rounded border border-[var(--color-border)] bg-[var(--color-kbd-bg)] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[var(--color-muted-foreground)]">
                          {chord.key}
                        </kbd>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )
}
