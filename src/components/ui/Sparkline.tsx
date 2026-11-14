import { useMemo } from 'react'

import { cn } from '@/lib/cn'

interface SparklineProps {
  values: number[]
  color?: string
  className?: string
}

export function Sparkline({ values, color = '#38BDF8', className }: SparklineProps) {
  const path = useMemo(() => {
    if (values.length < 2) return ''
    const max = Math.max(...values, 0.01)
    const min = Math.min(...values, 0)
    const range = Math.max(max - min, 0.01)
    return values
      .map((value, index) => {
        const x = (index / (values.length - 1)) * 64
        const y = 18 - ((value - min) / range) * 14
        return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`
      })
      .join(' ')
  }, [values])

  return (
    <svg
      viewBox="0 0 64 20"
      className={cn('h-5 w-16 overflow-visible', className)}
      aria-hidden
    >
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.9}
      />
    </svg>
  )
}
