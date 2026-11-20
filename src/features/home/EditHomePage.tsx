import { useState } from 'react'
import { Reorder } from 'motion/react'
import { Plus, RotateCcw, Trash2 } from 'lucide-react'

import { SubpageHeader } from '@/components/layout/SubpageHeader'
import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Input } from '@/components/ui/Input'
import { PageSkeleton } from '@/components/ui/PageSkeleton'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { EditHomeWidgetRow } from '@/features/home/EditHomeWidgetRow'
import { useDashboardEditor } from '@/features/home/useDashboardEditor'

export function EditHomePage() {
  const editor = useDashboardEditor()
  const [confirmKind, setConfirmKind] = useState<'delete' | 'reset' | null>(null)

  if (!editor.hydrated || !editor.active) {
    return (
      <div>
        <SubpageHeader
          title="Edit home"
          backTo="/"
          breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Edit desks' }]}
        />
        <PageSkeleton rows={5} />
      </div>
    )
  }

  const enabledCount = editor.active.widgets.filter((w) => w.enabled).length

  return (
    <div>
      <SubpageHeader
        title="Edit home"
        subtitle="Build desks and arrange the telemetry blocks that matter"
        backTo="/"
        breadcrumbs={[{ label: 'Home', to: '/' }, { label: 'Edit desks' }]}
      />

      <div className="page-pad space-y-6">
        <SegmentedControl
          ariaLabel="Dashboards"
          value={editor.active.id}
          onChange={editor.selectDashboard}
          bleedMobile
          options={editor.dashboards.map((dashboard) => ({
            value: dashboard.id,
            label: dashboard.name,
          }))}
        />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <section className="panel h-fit space-y-4 rounded-[var(--radius-2xl)] p-5">
            <div>
              <h2 className="font-display text-base font-semibold tracking-tight">Desk details</h2>
              <p className="mt-0.5 text-xs text-[var(--color-muted-foreground)]">
                Changes save automatically and sync across your household.
              </p>
            </div>
            <div className="space-y-3">
              <Input
                label="Desk name"
                value={editor.draftName}
                onChange={(event) => editor.setDraftName(event.target.value)}
                onBlur={editor.saveName}
              />
              <Input
                label="Tagline"
                value={editor.draftTagline}
                onChange={(event) => editor.setDraftTagline(event.target.value)}
                onBlur={editor.saveTagline}
                placeholder="Optional short subtitle"
              />
            </div>

            <div className="flex flex-wrap gap-2 border-t border-[var(--color-hairline)] pt-4">
              <Button variant="soft" size="sm" onClick={editor.addDashboard}>
                <Plus className="size-3.5" aria-hidden />
                New desk
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setConfirmKind('reset')}>
                <RotateCcw className="size-3.5" aria-hidden />
                Reset presets
              </Button>
              {editor.canDelete ? (
                <Button variant="danger" size="sm" onClick={() => setConfirmKind('delete')}>
                  <Trash2 className="size-3.5" aria-hidden />
                  Delete
                </Button>
              ) : null}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold tracking-tight">Widgets</h2>
                <p className="text-xs text-[var(--color-muted-foreground)]">
                  Drag handles or use arrows to reorder blocks for this desk.
                </p>
              </div>
              <span className="tabular text-xs font-medium text-[var(--color-muted-foreground)]">
                {enabledCount}/{editor.active.widgets.length} active
              </span>
            </div>

            <Reorder.Group
              axis="y"
              values={editor.active.widgets}
              onReorder={editor.setWidgetsOrder}
              className="space-y-2"
            >
              {editor.active.widgets.map((widget, index) => (
                <EditHomeWidgetRow
                  key={widget.id}
                  widget={widget}
                  isFirst={index === 0}
                  isLast={index === editor.active!.widgets.length - 1}
                  onToggle={editor.toggleWidget}
                  onMove={editor.moveWidget}
                  onMoveToTop={editor.moveWidgetToTop}
                />
              ))}
            </Reorder.Group>
          </section>
        </div>
      </div>

      <ConfirmDialog
        open={confirmKind === 'delete'}
        onClose={() => setConfirmKind(null)}
        title={`Delete “${editor.active.name}”?`}
        description="This dashboard desk and its custom widget order will be removed for your household."
        confirmLabel="Delete desk"
        tone="danger"
        onConfirm={editor.onDelete}
      />

      <ConfirmDialog
        open={confirmKind === 'reset'}
        onClose={() => setConfirmKind(null)}
        title="Restore default presets?"
        description="This replaces your current desks with the default Tonight, Discover, and Ops layouts."
        confirmLabel="Restore presets"
        tone="danger"
        onConfirm={editor.onReset}
      />
    </div>
  )
}
