import { SpeedValue } from '@/components/ui/SpeedValue'
import { useAggregateDownloadSpeed } from '@/hooks/useAggregateDownloadSpeed'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'

export function HomeTransferSpeeds() {
  const { isDemo, hasAny } = useConfiguredStack()
  const speed = useAggregateDownloadSpeed()
  const show =
    isDemo ||
    hasAny('sabnzbd', 'qbittorrent', 'transmission', 'nzbget', 'deluge', 'sonarr', 'radarr')

  if (!show) return null

  return (
    <div className="panel flex items-center justify-between rounded-2xl px-4 py-3">
      <div>
        <h2 className="text-sm font-semibold">Transfer speeds</h2>
        <p className="text-xs text-[var(--color-muted-foreground)]">Aggregate download throughput</p>
      </div>
      <p className="tabular text-sm font-medium text-emerald-300">
        {speed > 0 ? (
          <>
            ↓ <SpeedValue value={speed} />
          </>
        ) : (
          'Idle'
        )}
      </p>
    </div>
  )
}
