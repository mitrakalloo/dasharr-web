import { useEffect, useState } from 'react'

/** Keeps a short rolling series for sparkline telemetry. */
export function useSparkSeries(value: number | null, points = 12): number[] {
  const [series, setSeries] = useState<number[]>(() =>
    Array.from({ length: points }, () => Math.max(0, value ?? 0)),
  )

  useEffect(() => {
    const next = Math.max(0, value ?? 0)
    setSeries((prev) => [...prev.slice(1), next])
  }, [value])

  return series
}
