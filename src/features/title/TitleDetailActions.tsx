import { useState } from 'react'
import { Pencil, RefreshCw, Search, Sparkles, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface TitleDetailActionsProps {
  kind: 'movie' | 'series'
  liveSearch: boolean
  isDemo: boolean
  canManage: boolean
  canEdit?: boolean
  onEdit?: () => void
  onManualSearch: () => void
  onAutoSearch: () => void
  onRefresh: () => void
  onDelete: (deleteFiles: boolean) => void
}

export function TitleDetailActions({
  kind,
  liveSearch,
  isDemo,
  canManage,
  canEdit = false,
  onEdit,
  onManualSearch,
  onAutoSearch,
  onRefresh,
  onDelete,
}: TitleDetailActionsProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)

  function requireLive(action: () => void) {
    if (!liveSearch) {
      toast.message(isDemo ? 'Demo mode' : 'Configure Sonarr/Radarr/Lidarr first')
      return
    }
    action()
  }

  return (
    <>
      <div className="space-y-2.5">
        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="secondary"
            onClick={() =>
              requireLive(() => {
                if (kind === 'series') {
                  toast.message('Tap the search icon on an episode for interactive search')
                  return
                }
                onManualSearch()
              })
            }
          >
            <Search className="size-4" />
            Search
          </Button>
          <Button onClick={() => requireLive(onAutoSearch)}>
            <Sparkles className="size-4" />
            Auto-search
          </Button>
        </div>

        {canManage ? (
          <div className={canEdit ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-2 gap-2.5'}>
            {canEdit && onEdit ? (
              <Button variant="secondary" onClick={onEdit}>
                <Pencil className="size-4" />
                Edit
              </Button>
            ) : null}
            <Button variant="secondary" onClick={onRefresh}>
              <RefreshCw className="size-4" />
              Refresh
            </Button>
            <Button variant="danger" onClick={() => setConfirmOpen(true)}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Remove from library?"
        description="This removes the title from your *arr database. Optionally delete the downloaded files from disk as well."
        confirmLabel="Remove title"
        tone="danger"
        optionLabel="Also delete media files from disk"
        optionDescription="Permanently deletes downloaded video files from storage."
        onConfirm={(deleteFiles) => {
          setConfirmOpen(false)
          onDelete(deleteFiles)
        }}
      />
    </>
  )
}
