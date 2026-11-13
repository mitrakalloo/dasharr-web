import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { seerrStatusColor, seerrStatusLabel } from '@/features/seerr/seerr.helpers'
import type { DemoSeerrRequest } from '@/data/demoDashboard'
import { serviceAccent } from '@/lib/serviceColors'

interface SeerrRequestCardProps {
  request: DemoSeerrRequest
  onOpen?: () => void
  compact?: boolean
}

export function SeerrRequestCard({ request, onOpen, compact = false }: SeerrRequestCardProps) {
  const accent = serviceAccent('seerr')
  const statusColor = seerrStatusColor(request.status)

  return (
    <article className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
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

      {request.status === 'pending' ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <Button
            variant="secondary"
            className="gap-1.5 text-xs"
            onClick={() => toast.success(`Approved ${request.title}`)}
          >
            <Check className="size-4" />
            Approve
          </Button>
          <Button
            variant="danger"
            className="gap-1.5 text-xs"
            onClick={() => toast.message(`Declined ${request.title}`)}
          >
            <X className="size-4" />
            Decline
          </Button>
        </div>
      ) : null}
    </article>
  )
}
