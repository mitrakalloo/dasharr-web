import { randomUUID } from 'node:crypto'

import { db } from '../db/client'
import { auditEvent } from '../db/schema'

export async function writeAudit(input: {
  userId?: string | null
  action: string
  targetType?: string
  targetId?: string
  meta?: Record<string, unknown>
  ipAddress?: string | null
}) {
  await db.insert(auditEvent).values({
    id: randomUUID(),
    userId: input.userId ?? null,
    action: input.action,
    targetType: input.targetType,
    targetId: input.targetId,
    meta: input.meta ? JSON.stringify(input.meta) : null,
    ipAddress: input.ipAddress ?? null,
  })
}
