import { useEffect, useState } from 'react'

import { apiJson } from '@/lib/api/server'
import { authClient } from '@/lib/auth/client'

type AuditRow = {
  id: string
  action: string
  targetType: string | null
  targetId: string | null
  createdAt: string
}

export function AuditCard() {
  const session = authClient.useSession()
  const isAdmin = (session.data?.user as { role?: string } | undefined)?.role === 'admin'
  const [events, setEvents] = useState<AuditRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) return
    let active = true
    void apiJson<{ events: AuditRow[] }>('/api/account/audit')
      .then((payload) => {
        if (active) setEvents(payload.events)
      })
      .catch(() => {
        if (active) setEvents([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [isAdmin])

  if (!isAdmin) return null

  return (
    <section className="panel space-y-3.5 rounded-[var(--radius-2xl)] p-5">
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight text-[var(--color-foreground)]">
          Audit log
        </h2>
        <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
          Recent admin and household security events
        </p>
      </div>
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-[var(--radius-xl)] border border-[var(--color-hairline)] p-3">
              <div className="skeleton h-3.5 w-36" />
              <div className="skeleton mt-1.5 h-3 w-48" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">No events recorded yet.</p>
      ) : (
        <ul className="custom-scrollbar max-h-64 space-y-2 overflow-y-auto pr-1 text-xs">
          {events.map((event) => (
            <li
              key={event.id}
              className="rounded-[var(--radius-xl)] border border-[var(--color-hairline)] bg-[var(--color-surface-subtle)] px-3 py-2.5 text-[var(--color-muted-foreground)]"
            >
              <p className="font-medium text-[var(--color-foreground)]">{event.action}</p>
              <p className="mt-0.5 tabular">
                {event.targetType ? `${event.targetType} ${event.targetId ?? ''}` : '—'} ·{' '}
                {new Date(event.createdAt).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
