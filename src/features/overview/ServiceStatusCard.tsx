import { motion } from 'motion/react'

import { SpeedValue } from '@/components/ui/SpeedValue'
import { useLiveSpeed } from '@/hooks/useLiveSpeed'
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

  return (
    <motion.button
      type="button"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onSelect?.(service.id)}
      className={cn(
        'relative min-w-[148px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3 text-left transition active:scale-95',
        selected && 'border-[var(--color-border-strong)] bg-[var(--color-card-elevated)]',
      )}
      style={{
        boxShadow: selected ? `0 0 28px -10px ${accent}` : undefined,
      }}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-8 size-24 rounded-full opacity-30 blur-2xl"
        style={{ backgroundColor: accent }}
      />
      <div className="relative flex items-center justify-between gap-2">
        <span className="text-sm font-semibold" style={{ color: accent }}>
          {service.name}
        </span>
        <span
          className={cn(
            'size-2.5 rounded-full',
            service.online ? 'bg-emerald-400 beacon-pulse' : 'bg-rose-400',
          )}
        />
      </div>
      <p className="relative mt-3 text-lg font-semibold tracking-tight">
        {speed !== null ? (
          <SpeedValue value={speed} />
        ) : service.queueCount > 0 ? (
          <span className="tabular">
            {service.type === 'seerr'
              ? `${service.queueCount} pending`
              : `${service.queueCount} queue`}
          </span>
        ) : (
          <span className="text-base">{service.online ? 'Online' : 'Down'}</span>
        )}
      </p>
      <p className="relative mt-1 text-xs text-[var(--color-muted-foreground)]">
        {service.online ? service.detail : service.detail || 'Offline'}
        {service.online && service.queueCount > 0 ? ` · ${service.queueCount} active` : ''}
      </p>
    </motion.button>
  )
}
