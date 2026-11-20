import { useState } from 'react'
import { Check, ChevronRight, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { seerrStatusLabel, seerrStatusTone } from '@/features/seerr/seerr.helpers'
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
  const [busyAction, setBusyAction] = useState<'approve' | 'decline' | null>(null)
  const canModerate = request.status === 'pending' && Boolean(onApprove || onDecline)

  async function runAction(kind: 'approve' | 'decline') {
    const handler = kind === 'approve' ? onApprove : onDecline
    if (!handler || busyAction) return
    setBusyAction(kind)
    try {
      await handler(request.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Request action failed')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <article className="panel magnetic flex h-full flex-col justify-between rounded-[var(--radius-2xl)] p-3.5">
      <button
        type="button"
        onClick={onOpen}
        className="group flex w-full cursor-pointer items-start gap-3 text-left transition active:scale-[0.99]"
      >
        <PosterThumb
          src={request.poster}
          label={request.title}
          accent={accent}
          className="h-[76px] w-[52px] rounded-xl"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge tone={seerrStatusTone(request.status)} dot>
              {seerrStatusLabel(request.status)}
            </Badge>
            <Badge>{request.type === 'tv' ? 'Series' : 'Movie'}</Badge>
          </div>
          <h3 className="mt-1.5 truncate text-sm font-semibold text-[var(--color-foreground)] transition-colors group-hover:text-[var(--color-primary)]">
            {request.title}{' '}
            <span className="font-normal text-[var(--color-muted-foreground)]">
              ({request.year})
            </span>
          </h3>
          <p className="mt-0.5 truncate text-xs text-[var(--color-muted-foreground)]">
            {request.requestedBy} · {request.requestedAt}
            {!compact && request.quality ? ` · ${request.quality}` : ''}
          </p>
        </div>
        <ChevronRight
          className="mt-1 size-4 shrink-0 text-[var(--color-muted-foreground)]/60 transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-foreground)]"
          aria-hidden="true"
        />
      </button>

      {canModerate ? (
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-[var(--color-hairline)] pt-3">
          {onApprove ? (
            <Button
              size="sm"
              variant="soft"
              loading={busyAction === 'approve'}
              disabled={busyAction !== null}
              onClick={() => void runAction('approve')}
            >
              <Check className="size-3.5" />
              Approve
            </Button>
          ) : null}
          {onDecline ? (
            <Button
              size="sm"
              variant="danger"
              loading={busyAction === 'decline'}
              disabled={busyAction !== null}
              onClick={() => void runAction('decline')}
            >
              <X className="size-3.5" />
              Decline
            </Button>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}
