import { Link } from 'react-router-dom'
import { motion } from 'motion/react'

import { Button } from '@/components/ui/Button'
import { staggerContainer, staggerItem } from '@/lib/motion'

const steps = [
  { label: 'Add Sonarr or Radarr', hint: 'Library & calendar' },
  { label: 'Connect a download client', hint: 'SABnzbd, qBittorrent, …' },
  { label: 'Optional: Seerr', hint: 'Household requests' },
]

export function OnboardingHome() {
  return (
    <motion.section
      className="panel-elevated space-y-6 rounded-[var(--radius-2xl)] p-6"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      <motion.div variants={staggerItem}>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-primary)]">
          Getting started
        </p>
        <h1 className="font-display mt-2 text-2xl font-semibold tracking-tight">
          Connect your stack
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
          Dasharr stays empty until you add services. API keys are stored on the server — never in
          this browser.
        </p>
      </motion.div>
      <motion.ol className="space-y-3" variants={staggerItem}>
        {steps.map((step, index) => (
          <li
            key={step.label}
            className="flex gap-3 rounded-[var(--radius-lg)] border border-[var(--color-hairline)] bg-[var(--color-muted)]/50 px-3.5 py-3 text-sm"
          >
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-muted)] text-xs font-bold text-[var(--color-secondary)]">
              {index + 1}
            </span>
            <div>
              <p className="font-medium tracking-tight">{step.label}</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">{step.hint}</p>
            </div>
          </li>
        ))}
      </motion.ol>
      <motion.div variants={staggerItem}>
        <Link to="/settings?focus=services">
          <Button className="w-full">Add your first service</Button>
        </Link>
      </motion.div>
    </motion.section>
  )
}
