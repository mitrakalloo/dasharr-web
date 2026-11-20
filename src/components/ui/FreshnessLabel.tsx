import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/lib/cn'
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
  const [spinning, setSpinning] = useState(false)

  function handleRefresh() {
    bump()
    setSpinning(true)
    window.setTimeout(() => setSpinning(false), 600)
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
        <span className="size-1.5 rounded-full bg-[var(--color-success)] beacon-pulse" aria-hidden />
        <span className="tabular">
          {updatedAt ? `Updated ${formatAgo(updatedAt)}` : 'Live sync'}
        </span>
      </div>
      <IconButton label="Refresh data" size="sm" onClick={handleRefresh}>
        <RefreshCw className={cn('size-3.5 transition-transform', spinning && 'animate-spin')} />
      </IconButton>
    </div>
  )
}
