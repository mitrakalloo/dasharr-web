import { motion } from 'motion/react'

import { Sparkline } from '@/components/ui/Sparkline'
import { SpeedValue } from '@/components/ui/SpeedValue'
import { Tooltip } from '@/components/ui/Tooltip'
import { useLiveSpeed } from '@/hooks/useLiveSpeed'
import { useSparkSeries } from '@/hooks/useSparkSeries'
import type { DemoServiceStatus } from '@/data/demoDashboard'
import { parseSpeedMBps } from '@/lib/parseSpeed'
import { serviceAccent } from '@/lib/serviceColors'
import { cn } from '@/lib/cn'

interface ServiceStatusCardProps {
  service: DemoServiceStatus
  selected: boolean
  index: number
  onSelect?: (id: string) => void
}

export function ServiceStatusCard({
  service,
  selected,
  index,
  onSelect,
}: ServiceStatusCardProps) {
  const accent = serviceAccent(service.type)
  const base = parseSpeedMBps(service.speedLabel)
  const speed = useLiveSpeed(base, service.online && base !== null)
  const sparkValue =
    speed ?? (service.online ? Math.max(1, service.queueCount) * 2.4 : 0)
  const spark = useSparkSeries(sparkValue)

  return (
    <Tooltip
      label={`${service.name} · ${service.detail}`}
      className="block w-full min-w-[164px] lg:min-w-0"
    >
      <motion.button
        type="button"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index, 8) * 0.03, duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => onSelect?.(service.id)}
        className={cn(
          'magnetic panel group relative w-full shrink-0 cursor-pointer overflow-hidden rounded-[var(--radius-xl)] p-3.5 text-left transition hover:bg-[var(--color-card-elevated)] active:scale-[0.98]',
          selected && 'border-[var(--color-border-strong)] bg-[var(--color-card-elevated)]',
        )}
        style={{
          boxShadow: selected
            ? `var(--panel-highlight), 0 0 28px -10px ${accent}`
            : undefined,
          ['--glow' as string]: accent,
        }}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full opacity-20 blur-2xl transition-opacity group-hover:opacity-35"
          style={{ backgroundColor: accent }}
        />
        <div className="relative flex items-center justify-between gap-2">
          <span className="truncate text-sm font-semibold tracking-tight" style={{ color: accent }}>
            {service.name}
          </span>
          <span
            className={cn(
              'size-2 shrink-0 rounded-full',
              service.online
                ? 'bg-[var(--color-success)] beacon-pulse'
                : 'bg-[var(--color-destructive)]',
            )}
          />
        </div>
        <div className="relative mt-3 flex items-end justify-between gap-2">
          <p className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]">
            {speed !== null ? (
              <SpeedValue value={speed} />
            ) : service.queueCount > 0 ? (
              <span className="tabular text-base">
                {service.type === 'seerr'
                  ? `${service.queueCount} pending`
                  : `${service.queueCount} active`}
              </span>
            ) : (
              <span className="text-base">{service.online ? 'Online' : 'Offline'}</span>
            )}
          </p>
          {service.online ? <Sparkline values={spark} color={accent} /> : null}
        </div>
        <p className="relative mt-1.5 truncate text-xs text-[var(--color-muted-foreground)]">
          {service.online ? service.detail : service.detail || 'Unreachable'}
          {service.online && service.queueCount > 0 ? ` · ${service.queueCount} queued` : ''}
        </p>
      </motion.button>
    </Tooltip>
  )
}
