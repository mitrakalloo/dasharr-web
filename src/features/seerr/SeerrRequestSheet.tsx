import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { seerrStatusColor, seerrStatusLabel } from '@/features/seerr/seerr.helpers'
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
  const [busy, setBusy] = useState(false)

  async function run(action: 'approve' | 'decline') {
    if (!request) return
    setBusy(true)
    try {
      if (action === 'approve') {
        if (onApprove) await onApprove(request.id)
        else toast.success(`Approved ${request.title}`)
      } else if (onDecline) await onDecline(request.id)
      else toast.message(`Declined ${request.title}`)
      onClose()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Action failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <BottomSheet open={Boolean(request)} onClose={onClose} title={request?.title ?? 'Request'}>
      {request ? (
        <div className="space-y-4">
          <div className="flex gap-3">
            <PosterThumb
              src={request.poster}
              label={request.title}
              accent={accent}
              className="h-28 w-20 rounded-xl"
            />
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2">
                <Badge color={accent}>seerr</Badge>
                <Badge color={seerrStatusColor(request.status)}>
                  {seerrStatusLabel(request.status)}
                </Badge>
                <Badge>{request.type === 'tv' ? 'Series' : 'Movie'}</Badge>
              </div>
              <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                {request.year} · {request.quality}
              </p>
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                Requested by {request.requestedBy} · {request.requestedAt}
              </p>
            </div>
          </div>

          <p className="text-sm leading-relaxed text-[var(--color-muted-foreground)]">
            {request.overview}
          </p>

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
              Open title
            </Button>
          ) : null}

          {request.status === 'pending' ? (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                className="gap-1.5"
                disabled={busy}
                onClick={() => void run('approve')}
              >
                <Check className="size-4" />
                Approve
              </Button>
              <Button
                variant="danger"
                className="gap-1.5"
                disabled={busy}
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
