import { useEffect, useState } from 'react'

/** Subtle jitter around a base MB/s value for demo telemetry. */
export function useLiveSpeed(base: number | null, live = true): number | null {
  const [value, setValue] = useState(base)

  useEffect(() => {
    setValue(base)
    if (base === null || !live) return

    const id = window.setInterval(() => {
      const jitter = (Math.random() - 0.5) * 2.6
      setValue(Math.max(0.1, Number((base + jitter).toFixed(1))))
    }, 1600)

    return () => window.clearInterval(id)
  }, [base, live])

  return value
}
