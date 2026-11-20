import { useEffect, useState } from 'react'

import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'

interface ConfirmDialogProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'primary' | 'danger'
  optionLabel?: string
  optionDescription?: string
  optionDefaultChecked?: boolean
  onClose: () => void
  onConfirm: (optionChecked: boolean) => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  optionLabel,
  optionDescription,
  optionDefaultChecked = false,
  onClose,
  onConfirm,
}: ConfirmDialogProps) {
  const [checked, setChecked] = useState(optionDefaultChecked)

  useEffect(() => {
    if (open) setChecked(optionDefaultChecked)
  }, [open, optionDefaultChecked])

  return (
    <BottomSheet open={open} onClose={onClose} title={title} size="md">
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
          {description}
        </p>

        {optionLabel ? (
          <div className="rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-1">
            <Switch
              checked={checked}
              onCheckedChange={setChecked}
              label={optionLabel}
              description={optionDescription}
            />
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={() => {
              onConfirm(checked)
              onClose()
            }}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </BottomSheet>
  )
}
