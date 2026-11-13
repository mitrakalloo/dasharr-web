import { useEffect, useRef, useState } from 'react'
import { useScroll, type MotionValue } from 'motion/react'

export function useTitleScroll(): {
  rootRef: React.RefObject<HTMLDivElement | null>
  scrollY: MotionValue<number>
} {
  const rootRef = useRef<HTMLDivElement>(null)
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    let current = rootRef.current?.parentElement ?? null
    while (current) {
      const { overflowY } = getComputedStyle(current)
      if (overflowY === 'auto' || overflowY === 'scroll') {
        setContainer(current)
        return
      }
      current = current.parentElement
    }
    setContainer(null)
  }, [])

  const { scrollY } = useScroll({
    container: container ? { current: container } : undefined,
  })

  return { rootRef, scrollY }
}
