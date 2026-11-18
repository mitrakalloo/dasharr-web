import { Outlet, useLocation } from 'react-router-dom'
import { motion, useReducedMotion } from 'motion/react'

import { easeOutExpo } from '@/lib/motion'

export function PageTransition() {
  const location = useLocation()
  const reduced = useReducedMotion()

  return (
    <motion.div
      key={location.pathname}
      className="min-h-full"
      initial={reduced ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: easeOutExpo }}
    >
      <Outlet />
    </motion.div>
  )
}
