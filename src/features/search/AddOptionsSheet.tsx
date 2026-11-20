import { useEffect, useState } from 'react'

import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { resolveAddOptions } from '@/features/search/addOptions.resolve'
import type { AddOptions, AddOptionsBundle } from '@/features/search/addOptions.types'
import type { DefaultAddPrefs } from '@/lib/prefs/prefs.types'

interface AddOptionsSheetProps {
  open: boolean
  title: string
  bundle: AddOptionsBundle | null
  defaults: DefaultAddPrefs
  onClose: () => void
  onConfirm: (options: AddOptions) => void
}

export function AddOptionsSheet({
  open,
  title,
  bundle,
  defaults,
  onClose,
  onConfirm,
}: AddOptionsSheetProps) {
  const [options, setOptions] = useState<AddOptions | null>(null)

  useEffect(() => {
    if (!bundle) {
      setOptions(null)
      return
    }
    setOptions(resolveAddOptions(bundle, defaults))
  }, [bundle, defaults])

  if (!bundle || !options) {
    return (
      <BottomSheet open={open} onClose={onClose} title={title}>
        <div className="space-y-3 pb-4">
          <div className="skeleton h-12 rounded-[var(--radius-lg)]" />
          <div className="skeleton h-12 rounded-[var(--radius-lg)]" />
          <div className="skeleton h-11 rounded-[var(--radius-lg)]" />
        </div>
      </BottomSheet>
    )
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={title}>
      <div className="space-y-4 pb-2">
        {bundle.qualityProfiles.length > 0 ? (
          <Select
            label="Quality profile"
            value={String(options.qualityProfileId)}
            options={bundle.qualityProfiles.map((profile) => ({
              value: String(profile.id),
              label: profile.name,
            }))}
            onChange={(event) =>
              setOptions((prev) =>
                prev
                  ? { ...prev, qualityProfileId: Number(event.target.value) }
                  : prev,
              )
            }
          />
        ) : null}

        {bundle.rootFolders.length > 0 ? (
          <Select
            label="Root folder"
            value={options.rootFolderPath}
            options={bundle.rootFolders.map((folder) => ({
              value: folder.path ?? folder.name,
              label: folder.path ?? folder.name,
            }))}
            onChange={(event) =>
              setOptions((prev) =>
                prev ? { ...prev, rootFolderPath: event.target.value } : prev,
              )
            }
          />
        ) : null}

        {bundle.servers && bundle.servers.length > 0 ? (
          <Select
            label="Server"
            value={String(options.serverId ?? '')}
            options={bundle.servers.map((server) => ({
              value: String(server.id),
              label: server.name,
            }))}
            onChange={(event) =>
              setOptions((prev) =>
                prev ? { ...prev, serverId: Number(event.target.value) } : prev,
              )
            }
          />
        ) : null}

        <div className="divide-y divide-[var(--color-hairline)] rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-1">
          <Switch
            checked={options.monitored}
            onCheckedChange={(checked) =>
              setOptions((prev) => (prev ? { ...prev, monitored: checked } : prev))
            }
            label="Monitored"
            description="Track future releases and upgrades automatically"
          />
          <Switch
            checked={options.searchNow}
            onCheckedChange={(checked) =>
              setOptions((prev) => (prev ? { ...prev, searchNow: checked } : prev))
            }
            label="Search immediately"
            description="Trigger an indexer search right after adding"
          />
        </div>

        <Button className="w-full" onClick={() => onConfirm(options)}>
          {bundle.mode === 'request' ? 'Submit request' : 'Add to library'}
        </Button>
      </div>
    </BottomSheet>
  )
}
