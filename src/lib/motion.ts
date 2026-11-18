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

export const snappySpring = {
  type: 'spring' as const,
  stiffness: 460,
  damping: 34,
  mass: 0.75,
}

/** Custom easing — cubic-bezier(0.22, 1, 0.36, 1) */
export const easeOutExpo = [0.22, 1, 0.36, 1] as const

export const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 6 },
}

export const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: easeOutExpo },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: { duration: 0.16, ease: easeOutExpo },
  },
}

export const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.035, delayChildren: 0.04 },
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

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.28, ease: easeOutExpo },
  },
}
