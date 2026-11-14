import { toast } from 'sonner'

import type { AddOptions } from '@/features/search/addOptions.types'
import type { MediaSearchItem } from '@/hooks/useMediaSearch'
import { addLidarrAlbum } from '@/lib/services/lidarr'
import { addRadarrMovie } from '@/lib/services/radarr'
import { addReadarrBook } from '@/lib/services/readarr'
import { createSeerrRequest } from '@/lib/services/seerr'
import { addSonarrSeries } from '@/lib/services/sonarr'
import { addWhisparrMovie } from '@/lib/services/whisparr'
import type { AppSettings, ServiceConfig } from '@/types/config'

interface AddContext {
  settings: AppSettings
  service?: ServiceConfig
  seerr?: ServiceConfig
  sonarr?: ServiceConfig
  radarr?: ServiceConfig
  lidarr?: ServiceConfig
  readarr?: ServiceConfig
  whisparr?: ServiceConfig
}

export async function addMediaSearchItem(
  item: MediaSearchItem,
  ctx: AddContext,
  options: AddOptions,
): Promise<void> {
  try {
    if (item.source === 'seerr' && ctx.seerr && item.tmdbId) {
      await createSeerrRequest(ctx.settings, ctx.seerr, {
        mediaType: item.type === 'series' ? 'tv' : 'movie',
        mediaId: item.tmdbId,
        serverId: options.serverId,
        profileId: options.qualityProfileId || undefined,
        rootFolder: options.rootFolderPath || undefined,
        is4k: options.is4k,
        seasons: options.seasons,
      })
      toast.success(`Requested ${item.title}`)
      return
    }

    if (item.source === 'sonarr' && ctx.sonarr && item.raw) {
      await addSonarrSeries(ctx.settings, ctx.sonarr, {
        ...(item.raw as object),
        rootFolderPath: options.rootFolderPath,
        qualityProfileId: options.qualityProfileId,
        monitored: options.monitored,
        seasonFolder: true,
        addOptions: { searchForMissingEpisodes: options.searchNow },
      })
      toast.success(`Added ${item.title} to Sonarr`)
      return
    }

    if (item.source === 'radarr' && ctx.radarr && item.raw) {
      await addRadarrMovie(ctx.settings, ctx.radarr, {
        ...(item.raw as object),
        rootFolderPath: options.rootFolderPath,
        qualityProfileId: options.qualityProfileId,
        monitored: options.monitored,
        addOptions: { searchForMovie: options.searchNow },
      })
      toast.success(`Added ${item.title} to Radarr`)
      return
    }

    if (item.source === 'lidarr' && ctx.lidarr && item.raw) {
      await addLidarrAlbum(ctx.settings, ctx.lidarr, {
        ...(item.raw as object),
        rootFolderPath: options.rootFolderPath,
        qualityProfileId: options.qualityProfileId,
        monitored: options.monitored,
        addOptions: { searchForNewAlbum: options.searchNow },
      })
      toast.success(`Added ${item.title} to Lidarr`)
      return
    }

    if (item.source === 'readarr' && ctx.readarr && item.raw) {
      await addReadarrBook(ctx.settings, ctx.readarr, {
        ...(item.raw as object),
        rootFolderPath: options.rootFolderPath,
        qualityProfileId: options.qualityProfileId,
        monitored: options.monitored,
        addOptions: { searchForNewBook: options.searchNow },
      })
      toast.success(`Added ${item.title} to Readarr`)
      return
    }

    if (item.source === 'whisparr' && ctx.whisparr && item.raw) {
      await addWhisparrMovie(ctx.settings, ctx.whisparr, {
        ...(item.raw as object),
        rootFolderPath: options.rootFolderPath,
        qualityProfileId: options.qualityProfileId,
        monitored: options.monitored,
        addOptions: { searchForMovie: options.searchNow },
      })
      toast.success(`Added ${item.title} to Whisparr`)
      return
    }

    toast.message('Nothing to add for this result')
  } catch (error) {
    toast.error(error instanceof Error ? error.message : 'Add failed')
  }
}
