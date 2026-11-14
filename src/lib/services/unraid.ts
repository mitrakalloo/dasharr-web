import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

interface UnraidGraphqlPayload {
  data?: {
    array?: {
      state?: string
      capacity?: { kilobytes?: { free?: string; used?: string; total?: string } }
      disks?: Array<{ name?: string; temp?: number; fsSize?: string; fsUsed?: string }>
    }
    docker?: { containers?: Array<{ names?: string[]; state?: string }> }
    vars?: { version?: string }
  }
  errors?: Array<{ message: string }>
}

async function unraidGraphql(
  settings: AppSettings,
  service: ServiceConfig,
  query: string,
) {
  const payload = await serviceJson<UnraidGraphqlPayload>(settings, service, '/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (payload.errors?.length && !payload.data) {
    throw new Error(payload.errors[0].message)
  }
  return payload.data
}

export async function getUnraidVersion(settings: AppSettings, service: ServiceConfig) {
  const data = await unraidGraphql(settings, service, '{ array { state } vars { version } }')
  return data?.vars?.version ?? data?.array?.state ?? 'ok'
}

export async function getUnraidSnapshot(settings: AppSettings, service: ServiceConfig) {
  const data = await unraidGraphql(
    settings,
    service,
    `{
      array { state capacity { kilobytes { free used total } } disks { name temp fsSize fsUsed } }
      docker { containers { names state } }
      vars { version }
    }`,
  )
  return {
    version: data?.vars?.version,
    state: data?.array?.state ?? 'unknown',
    capacity: data?.array?.capacity?.kilobytes,
    disks: data?.array?.disks ?? [],
    containers: data?.docker?.containers ?? [],
  }
}
