import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EditHomeWidgetRow } from '@/features/home/EditHomeWidgetRow'
import { useDashboardEditor } from '@/features/home/useDashboardEditor'
import { cn } from '@/lib/cn'

export function EditHomePage() {
  const editor = useDashboardEditor()

  if (!editor.hydrated || !editor.active) {
    return <div className="px-4 pt-8 text-sm text-[var(--color-muted-foreground)]">Loading…</div>
  }

  return (
    <div>
      <SubpageHeader
        title="Edit home"
        subtitle="Build desks and reorder the blocks that matter"
        backTo="/"
      />

      <div className="space-y-5 px-4 pb-8 pt-4 lg:px-6">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:-mx-6 lg:px-6">
          {editor.dashboards.map((dashboard) => {
            const selected = dashboard.id === editor.active!.id
            return (
              <button
                key={dashboard.id}
                type="button"
                onClick={() => editor.selectDashboard(dashboard.id)}
                className={cn(
                  'min-h-[var(--tap)] shrink-0 cursor-pointer rounded-full border px-4 text-sm font-medium transition active:scale-95',
                  selected
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-muted)] text-[var(--color-secondary)]'
                    : 'border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted-foreground)]',
                )}
              >
                {dashboard.name}
              </button>
            )
          })}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Name"
            value={editor.draftName}
            onChange={(event) => editor.setDraftName(event.target.value)}
            onBlur={editor.saveName}
          />
          <Input
            label="Tagline"
            value={editor.draftTagline}
            onChange={(event) => editor.setDraftTagline(event.target.value)}
            onBlur={editor.saveTagline}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={editor.addDashboard}>
            Add dashboard
          </Button>
          <Button variant="secondary" onClick={editor.onReset}>
            Reset presets
          </Button>
          {editor.canDelete ? (
            <Button variant="secondary" onClick={editor.onDelete}>
              Delete desk
            </Button>
          ) : null}
        </div>

        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Widgets</h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Toggle blocks or use Top / Up / Down to reorder.
          </p>
          <div className="space-y-2">
            {editor.active.widgets.map((widget) => (
              <EditHomeWidgetRow
                key={widget.id}
                widget={widget}
                onToggle={editor.toggleWidget}
                onMove={editor.moveWidget}
                onMoveToTop={editor.moveWidgetToTop}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
