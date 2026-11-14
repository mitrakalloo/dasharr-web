import { Check, X } from 'lucide-react'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { seerrStatusColor, seerrStatusLabel } from '@/features/seerr/seerr.helpers'
import type { DemoSeerrRequest } from '@/data/demoDashboard'
import { serviceAccent } from '@/lib/serviceColors'

interface SeerrRequestCardProps {
  request: DemoSeerrRequest
  onOpen?: () => void
  onApprove?: (id: string) => void | Promise<void>
  onDecline?: (id: string) => void | Promise<void>
  compact?: boolean
}

export function SeerrRequestCard({
  request,
  onOpen,
  onApprove,
  onDecline,
  compact = false,
}: SeerrRequestCardProps) {
  const accent = serviceAccent('seerr')
  const statusColor = seerrStatusColor(request.status)
  const canModerate = request.status === 'pending' && (onApprove || onDecline)

  return (
    <article className="panel rounded-2xl p-3">
      <button
        type="button"
        onClick={onOpen}
        className="flex w-full cursor-pointer gap-3 text-left transition active:scale-[0.99]"
      >
        <PosterThumb
          src={request.poster}
          label={request.title}
          accent={accent}
          className="h-[72px] w-12 rounded-lg"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={accent}>seerr</Badge>
            <Badge color={statusColor}>{seerrStatusLabel(request.status)}</Badge>
            <Badge>{request.type === 'tv' ? 'Series' : 'Movie'}</Badge>
          </div>
          <h3 className="mt-1.5 truncate text-sm font-semibold">
            {request.title}{' '}
            <span className="font-normal text-[var(--color-muted-foreground)]">
              ({request.year})
            </span>
          </h3>
          <p className="truncate text-xs text-[var(--color-muted-foreground)]">
            {request.requestedBy} · {request.requestedAt}
            {!compact ? ` · ${request.quality}` : ''}
          </p>
        </div>
      </button>

      {canModerate ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          {onApprove ? (
            <Button
              variant="secondary"
              className="gap-1.5 text-xs"
              onClick={() => void onApprove(request.id)}
            >
              <Check className="size-4" />
              Approve
            </Button>
          ) : null}
          {onDecline ? (
            <Button
              variant="danger"
              className="gap-1.5 text-xs"
              onClick={() => void onDecline(request.id)}
            >
              <X className="size-4" />
              Decline
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
