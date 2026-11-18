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
    const message = payload.errors[0].message
    if (/csrf/i.test(message)) {
      throw new Error(
        'Unraid rejected the request (Invalid CSRF token). Re-create the API key under Settings → Management Access → API Keys and ensure the service base URL points at the GraphQL root (…/graphql).',
      )
    }
    throw new Error(message)
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
