import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  ArrowDown,
  ChevronRight,
  Gauge,
  Pause,
  Play,
  SlidersHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { SpeedValue } from '@/components/ui/SpeedValue'
import { cn } from '@/lib/cn'
import { spring } from '@/lib/motion'
import {
  getQbitSpeedMode,
  qbitPauseAll,
  qbitResumeAll,
  toggleQbitAltSpeed,
} from '@/lib/services/qbittorrent'
import { sabPause, sabResume, sabSetSpeedLimit } from '@/lib/services/sabnzbd'
import { useConfigStore } from '@/stores/configStore'

interface BandwidthPopoverProps {
  downloadSpeed: number
}

export function BandwidthPopover({ downloadSpeed }: BandwidthPopoverProps) {
  const reduced = useReducedMotion()
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)

  const qbitServices = useMemo(
    () => services.filter((s) => s.enabled && s.type === 'qbittorrent'),
    [services],
  )
  const sabServices = useMemo(
    () => services.filter((s) => s.enabled && s.type === 'sabnzbd'),
    [services],
  )
  const hasClients = qbitServices.length > 0 || sabServices.length > 0

  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [altSpeedOn, setAltSpeedOn] = useState<boolean | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    function onPointer(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  useEffect(() => {
    if (!open || qbitServices.length === 0) return
    let cancelled = false
    getQbitSpeedMode(settings, qbitServices[0])
      .then((enabled) => {
        if (!cancelled) setAltSpeedOn(enabled)
      })
      .catch(() => {
        if (!cancelled) setAltSpeedOn(null)
      })
    return () => {
      cancelled = true
    }
  }, [open, qbitServices, settings])

  if (!hasClients && downloadSpeed <= 0) return null

  async function pauseAll() {
    setBusy('pause')
    try {
      await Promise.all([
        ...qbitServices.map((s) => qbitPauseAll(settings, s)),
        ...sabServices.map((s) => sabPause(settings, s)),
      ])
      toast.success('Paused all download queues')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not pause downloads')
    } finally {
      setBusy(null)
    }
  }

  async function resumeAll() {
    setBusy('resume')
    try {
      await Promise.all([
        ...qbitServices.map((s) => qbitResumeAll(settings, s)),
        ...sabServices.map((s) => sabResume(settings, s)),
      ])
      toast.success('Resumed all download queues')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not resume downloads')
    } finally {
      setBusy(null)
    }
  }

  async function toggleTurtle() {
    setBusy('turtle')
    try {
      if (qbitServices.length > 0) {
        await Promise.all(qbitServices.map((s) => toggleQbitAltSpeed(settings, s)))
        const next = altSpeedOn === null ? true : !altSpeedOn
        setAltSpeedOn(next)
        toast.success(next ? 'Alternative speed limit enabled' : 'Alternative speed limit disabled')
      } else if (sabServices.length > 0) {
        const next = altSpeedOn === true ? 100 : 25
        await Promise.all(sabServices.map((s) => sabSetSpeedLimit(settings, s, next)))
        setAltSpeedOn(next < 100)
        toast.success(next < 100 ? 'SABnzbd throttled to 25%' : 'SABnzbd speed restored to 100%')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not toggle speed limit')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div ref={containerRef} className="relative hidden sm:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Transfer speed & bandwidth controls"
        className={cn(
          'inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-medium tabular transition-[transform,border-color,background-color] duration-[var(--duration-fast)] active:scale-95',
          downloadSpeed > 0
            ? 'border-[var(--color-success)]/30 bg-[var(--color-success-muted)] text-[var(--color-success)] hover:border-[var(--color-success)]/55'
            : altSpeedOn
              ? 'border-[var(--color-warning)]/35 bg-[var(--color-warning-muted)] text-[var(--color-warning)] hover:border-[var(--color-warning)]/60'
              : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)] hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]',
        )}
      >
        {downloadSpeed > 0 ? (
          <>
            <ArrowDown className="size-3" aria-hidden />
            <SpeedValue value={downloadSpeed} />
          </>
        ) : (
          <>
            <SlidersHorizontal className="size-3.5" aria-hidden />
            <span>{altSpeedOn ? 'Throttled' : 'Transfers'}</span>
          </>
        )}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-label="Bandwidth controls"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, scale: 0.97 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 4, scale: 0.98 }}
            transition={spring}
            className="panel-elevated absolute right-0 top-[calc(100%+8px)] z-50 w-72 rounded-[var(--radius-xl)] p-3.5 shadow-[var(--panel-highlight),var(--elevation-float)]"
          >
            <div className="flex items-center justify-between gap-2 pb-2.5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-muted-foreground)]">
                  Transfer controls
                </p>
                <p className="mt-0.5 text-sm font-semibold tabular text-[var(--color-foreground)]">
                  {downloadSpeed > 0 ? <SpeedValue value={downloadSpeed} /> : 'Idle · 0 B/s'}
                </p>
              </div>
              <Link
                to="/queue"
                onClick={() => setOpen(false)}
                className="inline-flex items-center gap-0.5 rounded-[var(--radius-sm)] px-2 py-1 text-xs font-medium text-[var(--color-primary)] transition-colors hover:bg-[var(--color-primary-muted)]"
              >
                Queue
                <ChevronRight className="size-3.5" aria-hidden />
              </Link>
            </div>

            {hasClients ? (
              <div className="space-y-2 border-t border-[var(--color-hairline)] pt-2.5">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busy === 'pause'}
                    onClick={pauseAll}
                  >
                    <Pause className="size-3.5" aria-hidden />
                    Pause all
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    loading={busy === 'resume'}
                    onClick={resumeAll}
                  >
                    <Play className="size-3.5" aria-hidden />
                    Resume all
                  </Button>
                </div>
                <Button
                  variant={altSpeedOn ? 'primary' : 'soft'}
                  size="sm"
                  className="w-full"
                  loading={busy === 'turtle'}
                  onClick={toggleTurtle}
                >
                  <Gauge className="size-3.5" aria-hidden />
                  {altSpeedOn
                    ? 'Disable alt speed (Turtle)'
                    : 'Enable alt speed (Turtle)'}
                </Button>
              </div>
            ) : (
              <p className="border-t border-[var(--color-hairline)] pt-2.5 text-xs text-[var(--color-muted-foreground)]">
                Connect qBittorrent or SABnzbd in Settings to control global speed and pause states.
              </p>
            )}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
