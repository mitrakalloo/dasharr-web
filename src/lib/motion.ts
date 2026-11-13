export const spring = {
  type: 'spring' as const,
  stiffness: 380,
  damping: 36,
  mass: 0.9,
}

export const softSpring = {
  type: 'spring' as const,
  stiffness: 280,
  damping: 28,
}

/** Custom easing from the mobile UX brief — cubic-bezier(0.22, 1, 0.36, 1) */
export const easeOutExpo = [0.22, 1, 0.36, 1] as const

export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.04, delayChildren: 0.04 },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easeOutExpo },
  },
}
