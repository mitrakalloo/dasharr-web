import { serviceJson } from '@/lib/http/client'
import type { AppSettings, ServiceConfig } from '@/types/config'

export interface UnraidDisk {
  name?: string
  temp?: number
  status?: string
  fsSize?: string
  fsUsed?: string
}

export interface UnraidContainer {
  id?: string
  names?: string[]
  image?: string
  state?: string
  status?: string
  autoStart?: boolean
}

export interface UnraidSnapshot {
  version?: string
  state: string
  capacity?: { free?: string; used?: string; total?: string }
  disks: UnraidDisk[]
  containers: UnraidContainer[]
}

interface UnraidGraphqlPayload {
  data?: {
    array?: {
      state?: string
      capacity?: { kilobytes?: { free?: string; used?: string; total?: string } }
      disks?: UnraidDisk[]
    }
    docker?: {
      containers?: UnraidContainer[]
      start?: { id?: string; state?: string }
      stop?: { id?: string; state?: string }
    }
    vars?: { version?: string }
  }
  errors?: Array<{ message: string }>
}

async function unraidGraphql(
  settings: AppSettings,
  service: ServiceConfig,
  query: string,
  variables?: Record<string, unknown>,
) {
  const payload = await serviceJson<UnraidGraphqlPayload>(settings, service, '/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(variables ? { query, variables } : { query }),
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

export async function getUnraidSnapshot(
  settings: AppSettings,
  service: ServiceConfig,
): Promise<UnraidSnapshot> {
  const data = await unraidGraphql(
    settings,
    service,
    `{
      array {
        state
        capacity { kilobytes { free used total } }
        disks { name temp status fsSize fsUsed }
      }
      docker {
        containers { id names image state status autoStart }
      }
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

export async function startUnraidContainer(
  settings: AppSettings,
  service: ServiceConfig,
  id: string,
) {
  return unraidGraphql(
    settings,
    service,
    `mutation StartContainer($id: PrefixedID!) {
      docker { start(id: $id) { id state } }
    }`,
    { id },
  )
}

export async function stopUnraidContainer(
  settings: AppSettings,
  service: ServiceConfig,
  id: string,
) {
  return unraidGraphql(
    settings,
    service,
    `mutation StopContainer($id: PrefixedID!) {
      docker { stop(id: $id) { id state } }
    }`,
    { id },
  )
}
