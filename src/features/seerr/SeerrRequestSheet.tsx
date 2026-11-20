import { useState } from 'react'
import { Check, ExternalLink, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { seerrStatusLabel, seerrStatusTone } from '@/features/seerr/seerr.helpers'
import type { DemoSeerrRequest } from '@/data/demoDashboard'
import { serviceAccent } from '@/lib/serviceColors'

interface SeerrRequestSheetProps {
  request: DemoSeerrRequest | null
  onClose: () => void
  onOpenTitle?: (titleId: string) => void
  onApprove?: (id: string) => Promise<void>
  onDecline?: (id: string) => Promise<void>
}

export function SeerrRequestSheet({
  request,
  onClose,
  onOpenTitle,
  onApprove,
  onDecline,
}: SeerrRequestSheetProps) {
  const accent = serviceAccent('seerr')
  const [busyAction, setBusyAction] = useState<'approve' | 'decline' | null>(null)

  async function run(action: 'approve' | 'decline') {
    if (!request || busyAction) return
    setBusyAction(action)
    try {
      if (action === 'approve') {
        if (onApprove) await onApprove(request.id)
        else toast.success(`Approved ${request.title}`)
      } else if (onDecline) {
        await onDecline(request.id)
      } else {
        toast.message(`Declined ${request.title}`)
      }
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setBusyAction(null)
    }
  }

  return (
    <BottomSheet
      open={Boolean(request)}
      onClose={onClose}
      title={request?.title ?? 'Request'}
      subtitle={
        request ? `Requested by ${request.requestedBy} · ${request.requestedAt}` : undefined
      }
    >
      {request ? (
        <div className="space-y-4">
          <div className="flex gap-3.5">
            <PosterThumb
              src={request.poster}
              label={request.title}
              accent={accent}
              className="h-28 w-20 rounded-xl"
            />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex flex-wrap gap-1.5">
                <Badge color={accent}>seerr</Badge>
                <Badge tone={seerrStatusTone(request.status)} dot>
                  {seerrStatusLabel(request.status)}
                </Badge>
                <Badge>{request.type === 'tv' ? 'Series' : 'Movie'}</Badge>
              </div>
              <p className="text-sm font-medium text-[var(--color-foreground)]">
                {request.year}
                {request.quality ? (
                  <span className="text-[var(--color-muted-foreground)]"> · {request.quality}</span>
                ) : null}
              </p>
              <p className="text-xs text-[var(--color-muted-foreground)]">
                Requested by {request.requestedBy} · {request.requestedAt}
              </p>
            </div>
          </div>

          {request.overview ? (
            <p className="rounded-[var(--radius-xl)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] p-3 text-sm leading-relaxed text-[var(--color-muted-foreground)]">
              {request.overview}
            </p>
          ) : null}

          {request.titleId ? (
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                const titleId = request.titleId
                if (!titleId) return
                onClose()
                onOpenTitle?.(titleId)
              }}
            >
              <ExternalLink className="size-4" />
              Open title details
            </Button>
          ) : null}

          {request.status === 'pending' ? (
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="primary"
                loading={busyAction === 'approve'}
                disabled={busyAction !== null}
                onClick={() => void run('approve')}
              >
                <Check className="size-4" />
                Approve
              </Button>
              <Button
                variant="danger"
                loading={busyAction === 'decline'}
                disabled={busyAction !== null}
                onClick={() => void run('decline')}
              >
                <X className="size-4" />
                Decline
              </Button>
            </div>
          ) : null}
        </div>
      ) : null}
    </BottomSheet>
  )
}
