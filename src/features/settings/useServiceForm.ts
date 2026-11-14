import { useState } from 'react'
import { toast } from 'sonner'

import { probeService } from '@/lib/services/probe'
import { useConfigStore } from '@/stores/configStore'
import {
  SERVICE_META,
  type ServiceConfig,
  type ServiceType,
  type ServiceUrlMode,
} from '@/types/config'

export type TestState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; version: string }
  | { status: 'error'; message: string }

export function useServiceForm() {
  const settings = useConfigStore((s) => s.settings)
  const addService = useConfigStore((s) => s.addService)
  const [type, setType] = useState<ServiceType>('sonarr')
  const [name, setName] = useState('Sonarr')
  const [baseUrl, setBaseUrl] = useState('http://127.0.0.1:8989')
  const [localUrl, setLocalUrl] = useState('')
  const [remoteUrl, setRemoteUrl] = useState('')
  const [urlMode, setUrlMode] = useState<ServiceUrlMode>('auto')
  const [apiKey, setApiKey] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [test, setTest] = useState<TestState>({ status: 'idle' })

  const meta = SERVICE_META[type]

  function buildDraft(): ServiceConfig | null {
    if (!baseUrl.trim()) {
      toast.error('Base URL is required')
      return null
    }
    if (meta.needsApiKey && !apiKey.trim()) {
      toast.error('API key is required')
      return null
    }
    if (meta.needsBasicAuth && (!username.trim() || !password)) {
      toast.error('Username and password are required')
      return null
    }

    return {
      id: 'draft',
      type,
      name: name.trim() || meta.label,
      baseUrl: baseUrl.trim().replace(/\/+$/, ''),
      localUrl: localUrl.trim().replace(/\/+$/, '') || undefined,
      remoteUrl: remoteUrl.trim().replace(/\/+$/, '') || undefined,
      urlMode,
      apiKey: apiKey.trim(),
      username: username.trim() || undefined,
      password: password || undefined,
      enabled: true,
    }
  }

  function handleTypeChange(next: ServiceType) {
    setType(next)
    const nextMeta = SERVICE_META[next]
    setName(nextMeta.label)
    setBaseUrl(`http://127.0.0.1:${nextMeta.defaultPort}`)
    setTest({ status: 'idle' })
  }

  async function handleTest() {
    const draft = buildDraft()
    if (!draft) return

    setTest({ status: 'loading' })
    try {
      const version = await probeService(settings, draft)
      setTest({ status: 'success', version })
      toast.success(`Connected · v${version}`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unreachable'
      setTest({ status: 'error', message })
      toast.error(message)
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const draft = buildDraft()
    if (!draft) return

    const { id: _id, ...input } = draft
    addService(input)
    toast.success(`${meta.label} saved locally`)
    setApiKey('')
    setPassword('')
    setTest({ status: 'idle' })
  }

  function touchField<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value)
      setTest({ status: 'idle' })
    }
  }

  return {
    meta,
    type,
    name,
    baseUrl,
    localUrl,
    remoteUrl,
    urlMode,
    apiKey,
    username,
    password,
    test,
    setName,
    setBaseUrl: touchField(setBaseUrl),
    setLocalUrl: touchField(setLocalUrl),
    setRemoteUrl: touchField(setRemoteUrl),
    setUrlMode: touchField(setUrlMode),
    setApiKey: touchField(setApiKey),
    setUsername: touchField(setUsername),
    setPassword: touchField(setPassword),
    handleTypeChange,
    handleTest,
    handleSubmit,
  }
}
