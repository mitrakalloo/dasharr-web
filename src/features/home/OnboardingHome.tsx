import { Link } from 'react-router-dom'

import { Button } from '@/components/ui/Button'

const steps = [
  { label: 'Add Sonarr or Radarr', hint: 'Library & calendar' },
  { label: 'Connect a download client', hint: 'SABnzbd, qBittorrent, …' },
  { label: 'Optional: Seerr', hint: 'Household requests' },
]

export function OnboardingHome() {
  return (
    <section className="panel space-y-5 rounded-2xl p-5">
      <div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Connect your stack</h1>
        <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
          Dasharr stays empty until you add services. API keys are stored on the server — never in
          this browser.
        </p>
      </div>
      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step.label} className="flex gap-3 text-sm">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-muted)] text-xs font-bold text-[var(--color-secondary)]">
              {index + 1}
            </span>
            <div>
              <p className="font-medium">{step.label}</p>
              <p className="text-xs text-[var(--color-muted-foreground)]">{step.hint}</p>
            </div>
          </li>
        ))}
      </ol>
      <Link to="/settings?focus=services">
        <Button className="w-full">Add your first service</Button>
      </Link>
    </section>
  )
}
