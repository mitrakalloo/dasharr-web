export interface SonarrSeries {
  id: number
  title: string
  year?: number
  added?: string
  status: string
  overview?: string
  network?: string
  path?: string
  rootFolderPath?: string
  qualityProfileId?: number
  imdbId?: string
  tvdbId?: number
  titleSlug?: string
  monitored: boolean
  runtime?: number
  genres?: string[]
  seasons?: Array<{
    seasonNumber: number
    monitored: boolean
    statistics?: {
      episodeFileCount: number
      episodeCount: number
      sizeOnDisk: number
    }
  }>
  statistics?: {
    episodeFileCount: number
    episodeCount: number
    percentOfEpisodes: number
    sizeOnDisk: number
  }
  ratings?: { value?: number }
  images?: Array<{ coverType: string; remoteUrl?: string; url?: string }>
}

export interface SonarrEpisode {
  id: number
  seriesId: number
  seasonNumber: number
  episodeNumber: number
  title?: string
  airDate?: string
  hasFile: boolean
  monitored: boolean
  episodeFile?: { size?: number; quality?: { quality?: { name?: string } } }
}

export interface ArrQueueItem {
  id: number
  title: string
  status: string
  seriesId?: number
  movieId?: number
  albumId?: number
  trackedDownloadStatus?: string
  trackedDownloadState?: string
  size: number
  sizeleft: number
  timeleft?: string
  estimatedCompletionTime?: string
  protocol?: string
}

export interface ArrRootFolder {
  id: number
  path: string
  freeSpace?: number
}

export interface ArrQualityProfile {
  id: number
  name: string
}

export interface ArrHealthWarning {
  source: string
  type: 'warning' | 'error' | 'notice' | string
  message: string
  wikiUrl?: string
}

export interface SonarrLookupSeries extends SonarrSeries {
  tvdbId?: number
  titleSlug?: string
}

export interface ArrStatus {
  version: string
  appName?: string
}
