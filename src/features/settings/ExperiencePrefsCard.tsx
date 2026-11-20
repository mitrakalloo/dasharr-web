import { Monitor, Moon, Sun } from 'lucide-react'

import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { cn } from '@/lib/cn'
import { usePrefsStore } from '@/stores/prefsStore'

const THEME_OPTIONS = [
  { value: 'dark' as const, label: 'Dark', icon: Moon },
  { value: 'system' as const, label: 'System', icon: Monitor },
  { value: 'light' as const, label: 'Light', icon: Sun },
]

export function ExperiencePrefsCard() {
  const experience = usePrefsStore((state) => state.experience)
  const setExperience = usePrefsStore((state) => state.setExperience)
  const defaultAdd = usePrefsStore((state) => state.defaultAdd)
  const setDefaultAdd = usePrefsStore((state) => state.setDefaultAdd)

  return (
    <section className="panel space-y-5 rounded-[var(--radius-2xl)] p-5">
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-foreground)]">
          Experience
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Per-user preferences · automatically synced across your signed-in devices
        </p>
      </div>

      {/* Visual theme selector */}
      <div className="space-y-2">
        <span className="block text-xs font-medium text-[var(--color-muted-foreground)]">
          Appearance
        </span>
        <div className="grid grid-cols-3 gap-2">
          {THEME_OPTIONS.map((option) => {
            const Icon = option.icon
            const active = experience.themePreference === option.value
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={active}
                onClick={() => setExperience({ themePreference: option.value })}
                className={cn(
                  'flex min-h-[var(--tap)] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[var(--radius-xl)] border px-3 py-3 text-xs font-medium transition active:scale-[0.98]',
                  active
                    ? 'border-[var(--color-primary)]/50 bg-[var(--color-primary-muted)] text-[var(--color-primary)] shadow-[var(--elevation-xs)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-subtle)] text-[var(--color-muted-foreground)] hover:bg-[var(--color-hover)] hover:text-[var(--color-foreground)]',
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                <span>{option.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Density segmented control */}
      <div className="space-y-2">
        <span className="block text-xs font-medium text-[var(--color-muted-foreground)]">
          Interface density
        </span>
        <SegmentedControl
          ariaLabel="Interface density"
          variant="segmented"
          value={experience.uiDensity}
          onChange={(value) => setExperience({ uiDensity: value })}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
        />
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2">
        <Select
          label="Watch region"
          value={experience.watchRegion}
          options={[
            { value: 'US', label: 'United States' },
            { value: 'GB', label: 'United Kingdom' },
            { value: 'CA', label: 'Canada' },
            { value: 'AU', label: 'Australia' },
            { value: 'DE', label: 'Germany' },
          ]}
          onChange={(event) => setExperience({ watchRegion: event.target.value })}
        />
        <Select
          label="Default calendar view"
          value={experience.calendarView}
          options={[
            { value: 'strip', label: 'Day strip' },
            { value: 'month', label: 'Month grid' },
            { value: 'agenda', label: 'Agenda' },
          ]}
          onChange={(event) =>
            setExperience({
              calendarView: event.target.value as 'strip' | 'month' | 'agenda',
            })
          }
        />
      </div>

      <div className="divide-y divide-[var(--color-hairline)] rounded-[var(--radius-xl)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] p-1">
        <Switch
          checked={experience.showAdvancedActions}
          onCheckedChange={(checked) => setExperience({ showAdvancedActions: checked })}
          label="Show advanced actions"
          description="Expose extra power-user controls on title and queue views"
        />
        <Switch
          checked={experience.notificationsEnabled}
          onCheckedChange={(checked) => setExperience({ notificationsEnabled: checked })}
          label="Queue completion notifications"
          description="Toast alerts when active downloads finish importing"
        />
        <Switch
          checked={defaultAdd.monitored}
          onCheckedChange={(checked) => setDefaultAdd({ monitored: checked })}
          label="Monitor new titles by default"
          description="Automatically watch newly added movies and shows"
        />
        <Switch
          checked={defaultAdd.searchNow}
          onCheckedChange={(checked) => setDefaultAdd({ searchNow: checked })}
          label="Search immediately on add"
          description="Trigger an indexer search right after adding a title"
        />
      </div>
    </section>
  )
}
