import { motion, useReducedMotion } from 'motion/react'

import { DasharrWordmark } from '@/components/brand/DasharrMark'
import { scaleIn } from '@/lib/motion'

interface AuthShellProps {
  title: string
  description: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthShell({ title, description, children, footer }: AuthShellProps) {
  const reduced = useReducedMotion()

  return (
    <div className="auth-canvas flex min-h-dvh items-center justify-center px-4 py-10">
      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={reduced ? false : scaleIn.initial}
        animate={scaleIn.animate}
      >
        <div className="mb-10 flex justify-center">
          <DasharrWordmark />
        </div>
        <div className="panel-elevated rounded-[var(--radius-2xl)] p-7 sm:p-8">
          <h1 className="font-display text-[1.75rem] font-semibold tracking-tight">{title}</h1>
          <p className="mt-2.5 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            {description}
          </p>
          <div className="mt-7">{children}</div>
        </div>
        {footer ? <div className="mt-6 text-center">{footer}</div> : null}
      </motion.div>
    </div>
  )
}
