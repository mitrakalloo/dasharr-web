import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'

interface TitleDetailActionsProps {
  kind: 'movie' | 'series'
  liveSearch: boolean
  isDemo: boolean
  canManage: boolean
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
  onManualSearch,
  onAutoSearch,
  onRefresh,
  onDelete,
}: TitleDetailActionsProps) {
  function requireLive(action: () => void) {
    if (!liveSearch) {
      toast.message(isDemo ? 'Demo mode' : 'Configure Sonarr/Radarr/Lidarr first')
      return
    }
    action()
  }

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            requireLive(() => {
              if (kind === 'series') {
                toast.message('Tap the search icon on an episode for manual search')
                return
              }
              onManualSearch()
            })
          }
        >
          Search
        </Button>
        <Button onClick={() => requireLive(onAutoSearch)}>Auto-search</Button>
      </div>
      {canManage ? (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={onRefresh}>
            Refresh metadata
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              if (
                window.confirm(
                  'Remove this title from the library? You can choose whether to delete files next.',
                )
              ) {
                const deleteFiles = window.confirm('Also delete media files from disk?')
                onDelete(deleteFiles)
              }
            }}
          >
            Delete
          </Button>
        </div>
      ) : null}
    </div>
  )
}
