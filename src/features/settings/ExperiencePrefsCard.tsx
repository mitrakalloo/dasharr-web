import { Select } from '@/components/ui/Select'
import { usePrefsStore } from '@/stores/prefsStore'

export function ExperiencePrefsCard() {
  const experience = usePrefsStore((state) => state.experience)
  const setExperience = usePrefsStore((state) => state.setExperience)
  const defaultAdd = usePrefsStore((state) => state.defaultAdd)
  const setDefaultAdd = usePrefsStore((state) => state.setDefaultAdd)

  return (
    <section className="panel space-y-4 rounded-[var(--radius-2xl)] p-4">
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight">Experience</h2>
        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
          Per-user · synced to your other devices
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Select
          label="UI density"
          value={experience.uiDensity}
          options={[
            { value: 'comfortable', label: 'Comfortable' },
            { value: 'compact', label: 'Compact' },
          ]}
          onChange={(event) =>
            setExperience({ uiDensity: event.target.value as 'comfortable' | 'compact' })
          }
        />
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
          label="Theme"
          value={experience.themePreference}
          options={[
            { value: 'dark', label: 'Dark' },
            { value: 'system', label: 'System' },
            { value: 'light', label: 'Light' },
          ]}
          onChange={(event) =>
            setExperience({
              themePreference: event.target.value as 'dark' | 'light' | 'system',
            })
          }
        />
        <Select
          label="Calendar default"
          value={experience.calendarView}
          options={[
            { value: 'strip', label: 'Day strip' },
            { value: 'month', label: 'Month' },
            { value: 'agenda', label: 'Agenda' },
          ]}
          onChange={(event) =>
            setExperience({
              calendarView: event.target.value as 'strip' | 'month' | 'agenda',
            })
          }
        />
      </div>
      <label className="flex min-h-[var(--tap)] items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={experience.showAdvancedActions}
          onChange={(event) => setExperience({ showAdvancedActions: event.target.checked })}
        />
        Show advanced actions
      </label>
      <label className="flex min-h-[var(--tap)] items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={experience.notificationsEnabled}
          onChange={(event) => setExperience({ notificationsEnabled: event.target.checked })}
        />
        Queue completion notifications
      </label>
      <label className="flex min-h-[var(--tap)] items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={defaultAdd.monitored}
          onChange={(event) => setDefaultAdd({ monitored: event.target.checked })}
        />
        Default: monitored on add
      </label>
      <label className="flex min-h-[var(--tap)] items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={defaultAdd.searchNow}
          onChange={(event) => setDefaultAdd({ searchNow: event.target.checked })}
        />
        Default: search on add
      </label>
    </section>
  )
}
