import { RefreshCw } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { useRefreshStore } from '@/stores/refreshStore'

interface FreshnessLabelProps {
  updatedAt?: number
}

function formatAgo(updatedAt: number) {
  const seconds = Math.max(0, Math.round((Date.now() - updatedAt) / 1000))
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.round(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  return `${Math.round(minutes / 60)}h ago`
}

export function FreshnessLabel({ updatedAt }: FreshnessLabelProps) {
  const bump = useRefreshStore((state) => state.bump)

  return (
    <div className="flex items-center justify-between gap-3">
      <p className="text-xs text-[var(--color-muted-foreground)]">
        {updatedAt ? `Updated ${formatAgo(updatedAt)}` : 'Waiting for data…'}
      </p>
      <IconButton label="Refresh all" onClick={bump} className="size-9">
        <RefreshCw className="size-4" />
      </IconButton>
    </div>
  )
}
