import { useId, useMemo } from 'react'

import { cn } from '@/lib/cn'

interface SparklineProps {
  values: number[]
  color?: string
  className?: string
}

export function Sparkline({ values, color = '#38BDF8', className }: SparklineProps) {
  const uid = useId()
  const gradId = `spark-fill-${uid}`

  const { linePath, areaPath, lastPoint } = useMemo(() => {
    if (values.length < 2) {
      return { linePath: '', areaPath: '', lastPoint: null as { x: number; y: number } | null }
    }
    const max = Math.max(...values, 0.01)
    const min = Math.min(...values, 0)
    const range = Math.max(max - min, 0.01)
    const points = values.map((value, index) => ({
      x: (index / (values.length - 1)) * 64,
      y: 18 - ((value - min) / range) * 14,
    }))
    const line = points
      .map((pt, index) => `${index === 0 ? 'M' : 'L'}${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`)
      .join(' ')
    const last = points[points.length - 1]
    const area = `${line} L64 20 L0 20 Z`
    return { linePath: line, areaPath: area, lastPoint: last }
  }, [values])

  return (
    <svg
      viewBox="0 0 64 20"
      className={cn('h-5 w-16 overflow-visible', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {areaPath ? <path d={areaPath} fill={`url(#${gradId})`} /> : null}
      {linePath ? (
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.95}
        />
      ) : null}
      {lastPoint ? (
        <circle cx={lastPoint.x} cy={lastPoint.y} r="2.2" fill={color} />
      ) : null}
    </svg>
  )
}
