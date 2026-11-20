import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Switch } from '@/components/ui/Switch'
import { parseLiveTitleId } from '@/lib/liveTitleId'
import {
  getRadarrMovieById,
  getRadarrQualityProfiles,
  getRadarrRootFolders,
  updateRadarrMovie,
} from '@/lib/services/radarr'
import {
  getSonarrQualityProfiles,
  getSonarrRootFolders,
  getSonarrSeriesById,
  updateSonarrSeries,
  type ArrQualityProfile,
  type ArrRootFolder,
} from '@/lib/services/sonarr'
import { useConfigStore } from '@/stores/configStore'

interface TitleEditSheetProps {
  open: boolean
  titleId: string
  titleName: string
  onClose: () => void
  onSaved: () => void
}

export function TitleEditSheet({
  open,
  titleId,
  titleName,
  onClose,
  onSaved,
}: TitleEditSheetProps) {
  const settings = useConfigStore((state) => state.settings)
  const services = useConfigStore((state) => state.services)
  const parsed = parseLiveTitleId(titleId)
  const service = parsed
    ? services.find((entry) => entry.enabled && entry.type === parsed.service)
    : undefined

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [profiles, setProfiles] = useState<ArrQualityProfile[]>([])
  const [roots, setRoots] = useState<ArrRootFolder[]>([])
  const [qualityProfileId, setQualityProfileId] = useState<string>('')
  const [rootFolderPath, setRootFolderPath] = useState<string>('')
  const [monitored, setMonitored] = useState(true)

  useEffect(() => {
    if (!open || !parsed || !service) return
    if (parsed.service !== 'sonarr' && parsed.service !== 'radarr') return
    let cancelled = false

    async function load() {
      setLoading(true)
      try {
        if (parsed!.service === 'sonarr') {
          const [prof, rf, series] = await Promise.all([
            getSonarrQualityProfiles(settings, service!),
            getSonarrRootFolders(settings, service!),
            getSonarrSeriesById(settings, service!, parsed!.numericId),
          ])
          if (cancelled) return
          setProfiles(prof)
          setRoots(rf)
          setQualityProfileId(String(series.qualityProfileId ?? prof[0]?.id ?? ''))
          setRootFolderPath(series.rootFolderPath ?? rf[0]?.path ?? '')
          setMonitored(series.monitored)
        } else {
          const [prof, rf, movie] = await Promise.all([
            getRadarrQualityProfiles(settings, service!),
            getRadarrRootFolders(settings, service!),
            getRadarrMovieById(settings, service!, parsed!.numericId),
          ])
          if (cancelled) return
          setProfiles(prof)
          setRoots(rf)
          setQualityProfileId(String(movie.qualityProfileId ?? prof[0]?.id ?? ''))
          setRootFolderPath(movie.rootFolderPath ?? rf[0]?.path ?? '')
          setMonitored(movie.monitored)
        }
      } catch (err) {
        if (!cancelled) {
          toast.error(err instanceof Error ? err.message : 'Could not load title settings')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [open, parsed, service, settings])

  async function handleSave() {
    if (!parsed || !service) return
    setSaving(true)
    try {
      const nextProfileId = Number(qualityProfileId)
      if (parsed.service === 'sonarr') {
        const current = await getSonarrSeriesById(settings, service, parsed.numericId)
        await updateSonarrSeries(settings, service, {
          ...current,
          monitored,
          qualityProfileId: Number.isFinite(nextProfileId) ? nextProfileId : current.qualityProfileId,
          rootFolderPath: rootFolderPath || current.rootFolderPath,
        })
      } else if (parsed.service === 'radarr') {
        const current = await getRadarrMovieById(settings, service, parsed.numericId)
        await updateRadarrMovie(settings, service, {
          ...current,
          monitored,
          qualityProfileId: Number.isFinite(nextProfileId) ? nextProfileId : current.qualityProfileId,
          rootFolderPath: rootFolderPath || current.rootFolderPath,
        })
      }
      toast.success(`Updated ${titleName}`)
      onSaved()
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Edit title"
      subtitle={titleName}
      desktop="drawer"
    >
      {loading ? (
        <div className="space-y-3 py-2">
          <div className="skeleton h-11 rounded-[var(--radius-md)]" />
          <div className="skeleton h-11 rounded-[var(--radius-md)]" />
          <div className="skeleton h-11 rounded-[var(--radius-md)]" />
        </div>
      ) : (
        <div className="space-y-4">
          <Select
            label="Quality profile"
            value={qualityProfileId}
            onChange={(event) => setQualityProfileId(event.target.value)}
            options={profiles.map((p) => ({ value: String(p.id), label: p.name }))}
          />
          <Select
            label="Root folder"
            value={rootFolderPath}
            onChange={(event) => setRootFolderPath(event.target.value)}
            options={roots.map((r) => ({ value: r.path, label: r.path }))}
          />
          <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-3.5 py-3">
            <Switch
              checked={monitored}
              onCheckedChange={setMonitored}
              label="Monitored"
              description="Automatically grab missing releases and upgrades"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button loading={saving} onClick={() => void handleSave()}>
              Save changes
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
