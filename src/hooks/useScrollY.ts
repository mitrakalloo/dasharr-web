import { useEffect, useState } from 'react'

/** Tracks scroll offset for `window` or a specific scroll container. */
export function useScrollY(threshold = 0, target: HTMLElement | null = null): number {
  const [y, setY] = useState(0)

  useEffect(() => {
    let frame = 0
    const read = () => (target ? target.scrollTop : window.scrollY)
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setY(read()))
    }
    onScroll()

    if (target) {
      target.addEventListener('scroll', onScroll, { passive: true })
      return () => {
        cancelAnimationFrame(frame)
        target.removeEventListener('scroll', onScroll)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [target])

  if (threshold <= 0) return y
  return y > threshold ? y : 0
}
