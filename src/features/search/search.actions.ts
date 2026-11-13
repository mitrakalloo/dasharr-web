import { toast } from 'sonner'

import type { MediaSearchItem } from '@/hooks/useMediaSearch'
import {
  addRadarrMovie,
  getRadarrQualityProfiles,
  getRadarrRootFolders,
} from '@/lib/services/radarr'
import { createSeerrRequest } from '@/lib/services/seerr'
import {
  addSonarrSeries,
  getSonarrQualityProfiles,
  getSonarrRootFolders,
} from '@/lib/services/sonarr'
import type { AppSettings, ServiceConfig } from '@/types/config'

interface AddContext {
  settings: AppSettings
  seerr?: ServiceConfig
  sonarr?: ServiceConfig
  radarr?: ServiceConfig
}

export async function addMediaSearchItem(
  item: MediaSearchItem,
  ctx: AddContext,
): Promise<void> {
  try {
    if (item.source === 'seerr' && ctx.seerr && item.tmdbId) {
      await createSeerrRequest(ctx.settings, ctx.seerr, {
        mediaType: item.type === 'series' ? 'tv' : 'movie',
        mediaId: item.tmdbId,
      })
      toast.success(`Requested ${item.title}`)
      return
    }

    if (item.source === 'sonarr' && ctx.sonarr && item.raw) {
      const [roots, profiles] = await Promise.all([
        getSonarrRootFolders(ctx.settings, ctx.sonarr),
        getSonarrQualityProfiles(ctx.settings, ctx.sonarr),
      ])
      if (!roots[0] || !profiles[0]) {
        throw new Error('Sonarr needs a root folder and quality profile')
      }
      await addSonarrSeries(ctx.settings, ctx.sonarr, {
        ...(item.raw as object),
        rootFolderPath: roots[0].path,
        qualityProfileId: profiles[0].id,
        monitored: true,
        seasonFolder: true,
        addOptions: { searchForMissingEpisodes: true },
      })
      toast.success(`Added ${item.title} to Sonarr`)
      return
    }

    if (item.source === 'radarr' && ctx.radarr && item.raw) {
      const [roots, profiles] = await Promise.all([
        getRadarrRootFolders(ctx.settings, ctx.radarr),
        getRadarrQualityProfiles(ctx.settings, ctx.radarr),
      ])
      if (!roots[0] || !profiles[0]) {
        throw new Error('Radarr needs a root folder and quality profile')
      }
      await addRadarrMovie(ctx.settings, ctx.radarr, {
        ...(item.raw as object),
        rootFolderPath: roots[0].path,
        qualityProfileId: profiles[0].id,
        monitored: true,
        addOptions: { searchForMovie: true },
      })
      toast.success(`Added ${item.title} to Radarr`)
      return
    }

    toast.message('Nothing to add for this result')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Add failed')
  }
}
