import NumberFlow from '@number-flow/react'

import { cn } from '@/lib/cn'

interface SpeedValueProps {
  value: number
  className?: string
  suffix?: string
}

export function SpeedValue({ value, className, suffix = ' MB/s' }: SpeedValueProps) {
  return (
    <span className={cn('tabular inline-flex items-baseline', className)}>
      <NumberFlow
        value={value}
        format={{ minimumFractionDigits: 1, maximumFractionDigits: 1 }}
        transformTiming={{ duration: 450, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }}
      />
      <span>{suffix}</span>
    </span>
  )
}
