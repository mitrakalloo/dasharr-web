import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'

interface TitleDetailActionsProps {
  kind: 'movie' | 'series'
  liveSearch: boolean
  isDemo: boolean
  onManualSearch: () => void
  onAutoSearch: () => void
}

export function TitleDetailActions({
  kind,
  liveSearch,
  isDemo,
  onManualSearch,
  onAutoSearch,
}: TitleDetailActionsProps) {
  function requireLive(action: () => void) {
    if (!liveSearch) {
      toast.message(isDemo ? 'Demo mode' : 'Configure Sonarr/Radarr first')
      return
    }
    action()
  }

  return (
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
  )
}
