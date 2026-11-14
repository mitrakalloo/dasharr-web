export type DemoServiceStatus = {
  id: string
  type:
    | 'sonarr'
    | 'radarr'
    | 'lidarr'
    | 'prowlarr'
    | 'qbittorrent'
    | 'sabnzbd'
    | 'seerr'
    | 'tautulli'
    | 'transmission'
    | 'nzbget'
    | 'deluge'
  name: string
  online: boolean
  queueCount: number
  speedLabel?: string
  detail: string
}

export type DemoSeerrRequest = {
  id: string
  titleId?: string
  title: string
  year: number
  type: 'movie' | 'tv'
  status: 'pending' | 'approved' | 'declined'
  requestedBy: string
  requestedAt: string
  quality: string
  poster: string
  overview: string
}

export type DemoQueueItem = {
  id: string
  titleId?: string
  title: string
  subtitle: string
  quality: string
  releaseGroup?: string
  progress: number
  eta: string
  speed: string
  size: string
  status: 'downloading' | 'paused' | 'queued' | 'request' | 'watching'
  service:
    | 'sonarr'
    | 'radarr'
    | 'sabnzbd'
    | 'qbittorrent'
    | 'transmission'
    | 'nzbget'
    | 'deluge'
    | 'seerr'
    | 'tautulli'
  poster: string
  overview: string
  indexers: Array<{ name: string; seeders: number; size: string; score: number }>
  /** Configured service id used for pause/resume/remove */
  clientServiceId?: string
  /** qBittorrent hash, SABnzbd nzo_id, or *arr queue id */
  clientItemId?: string
  canPause?: boolean
  canRemove?: boolean
  canRetry?: boolean
}

export type DemoRelease = {
  id: string
  titleId?: string
  title: string
  subtitle?: string
  /** Absolute local date/time for calendar placement */
  airDate: string
  kind: 'episode' | 'movie' | 'album'
  service: 'sonarr' | 'radarr' | 'lidarr'
  monitored: boolean
  hasFile: boolean
  meta: string
  poster: string
}

export type DemoStorage = {
  id: string
  label: string
  path: string
  usedTb: number
  totalTb: number
}

export const DEMO_HEALTH = {
  status: 'warning' as const,
  label: '1 Warning',
  issues: [
    {
      id: 'prowlarr-1',
      service: 'prowlarr' as const,
      title: 'Prowlarr · NZBGeek',
      detail: 'Indexer timed out twice in the last hour.',
    },
  ],
}

export const DEMO_SERVICES: DemoServiceStatus[] = [
  {
    id: 'sonarr',
    type: 'sonarr',
    name: 'Sonarr',
    online: true,
    queueCount: 3,
    speedLabel: '28.4 MB/s',
    detail: '12 monitored',
  },
  {
    id: 'radarr',
    type: 'radarr',
    name: 'Radarr',
    online: true,
    queueCount: 2,
    speedLabel: '14.1 MB/s',
    detail: '486 movies',
  },
  {
    id: 'prowlarr',
    type: 'prowlarr',
    name: 'Prowlarr',
    online: true,
    queueCount: 0,
    detail: '18 indexers',
  },
  {
    id: 'seerr',
    type: 'seerr',
    name: 'Seerr',
    online: true,
    queueCount: 3,
    detail: '3 pending requests',
  },
  {
    id: 'qbit',
    type: 'qbittorrent',
    name: 'qBittorrent',
    online: true,
    queueCount: 4,
    speedLabel: '48.2 MB/s',
    detail: '↑ 3.9 MB/s',
  },
  {
    id: 'sab',
    type: 'sabnzbd',
    name: 'SABnzbd',
    online: true,
    queueCount: 2,
    speedLabel: '19.7 MB/s',
    detail: 'Usenet',
  },
  {
    id: 'lidarr',
    type: 'lidarr',
    name: 'Lidarr',
    online: false,
    queueCount: 0,
    detail: 'Offline',
  },
]

export const DEMO_STORAGE: DemoStorage[] = [
  { id: 'tv', label: 'TV', path: '/media/tv', usedTb: 8.4, totalTb: 12 },
  { id: 'movies', label: 'Movies', path: '/media/movies', usedTb: 6.1, totalTb: 10 },
  { id: 'downloads', label: 'Downloads', path: '/downloads', usedTb: 0.72, totalTb: 2 },
]

export const DEMO_SEERR_REQUESTS: DemoSeerrRequest[] = [
  {
    id: 'req-1',
    titleId: 'the-penguin',
    title: 'The Penguin',
    year: 2024,
    type: 'tv',
    status: 'pending',
    requestedBy: 'mitra',
    requestedAt: '2h ago',
    quality: 'Any / HD-1080p',
    poster: 'https://image.tmdb.org/t/p/w185/jDefGlOxxPRxJ8bNABC1VM8B4E.jpg',
    overview: 'Oz Cobb begins his rise in Gotham’s underworld in the wake of The Batman.',
  },
  {
    id: 'req-2',
    titleId: 'civil-war',
    title: 'Civil War',
    year: 2024,
    type: 'movie',
    status: 'pending',
    requestedBy: 'alex',
    requestedAt: '5h ago',
    quality: 'Ultra-HD / Remux',
    poster: 'https://image.tmdb.org/t/p/w185/sh7Rg8Er3tFcN9VB8JJXgCuyVqA.jpg',
    overview: 'A journey across a dystopian future America during a rapidly escalating civil war.',
  },
  {
    id: 'req-3',
    titleId: 'slow-horses',
    title: 'Slow Horses',
    year: 2022,
    type: 'tv',
    status: 'pending',
    requestedBy: 'jordan',
    requestedAt: 'Yesterday',
    quality: 'HD-1080p / WEB',
    poster: 'https://image.tmdb.org/t/p/w185/ovu8xJvJbQhLdJYqTlvmWSGOB6x.jpg',
    overview: 'Misfit spies at MI5’s Slough House dig into cases nobody else will touch.',
  },
  {
    id: 'req-4',
    titleId: 'challengers',
    title: 'Challengers',
    year: 2024,
    type: 'movie',
    status: 'approved',
    requestedBy: 'sam',
    requestedAt: '2d ago',
    quality: 'HD-1080p',
    poster: 'https://image.tmdb.org/t/p/w185/H6vke7zGiuLszrs3R5lAtSSeT.jpg',
    overview: 'Tashi’s coaching turns a marriage into a high-stakes tennis rivalry.',
  },
  {
    id: 'req-5',
    title: 'Fallout',
    year: 2024,
    type: 'tv',
    status: 'declined',
    requestedBy: 'casey',
    requestedAt: '3d ago',
    quality: 'Any',
    poster: 'https://image.tmdb.org/t/p/w185/eO0QV5qJaEngP1Ax9w3eV6bJG2f.jpg',
    overview: 'Survivors emerge from Vault 33 into a irradiated wasteland.',
  },
]

export const DEMO_QUEUE: DemoQueueItem[] = [
  {
    id: 'q1',
    titleId: 'severance',
    title: 'Severance',
    subtitle: 'S02E04 · Woe’s Hollow',
    quality: 'WEB-DL 1080p',
    releaseGroup: 'NTb',
    progress: 67,
    eta: '12m',
    speed: '28.4 MB/s',
    size: '1.8 / 2.7 GB',
    status: 'downloading',
    service: 'sonarr',
    poster: 'https://image.tmdb.org/t/p/w185/pPHzeujVDQjwQ9aQEm8rY8uLxua.jpg',
    overview:
      'Mark and Helly uncover a buried truth on the severed floor while the outside world closes in.',
    indexers: [
      { name: 'TorrentLeech', seeders: 214, size: '2.7 GB', score: 98 },
      { name: 'NZBGeek', seeders: 0, size: '2.6 GB', score: 91 },
    ],
    canRetry: true,
  },
  {
    id: 'q2',
    titleId: 'dune-part-two',
    title: 'Dune: Part Two',
    subtitle: 'Movies · Arrakis',
    quality: 'REMUX 2160p DV/HDR',
    releaseGroup: 'FraMeSToR',
    progress: 41,
    eta: '48m',
    speed: '19.7 MB/s',
    size: '18.4 / 45.2 GB',
    status: 'downloading',
    service: 'sabnzbd',
    poster: 'https://image.tmdb.org/t/p/w185/1pdfLvkbY9ohJlCjQH2CZzeYwsM.jpg',
    overview: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators.',
    indexers: [
      { name: 'Usenet-Crawler', seeders: 0, size: '45.2 GB', score: 100 },
      { name: 'SceneHD', seeders: 42, size: '44.8 GB', score: 88 },
    ],
    canPause: true,
    canRemove: true,
    canRetry: true,
  },
  {
    id: 'q3',
    titleId: 'shogun',
    title: 'Shogun',
    subtitle: 'S01E08 · The Abyss of Life',
    quality: 'Bluray-1080p',
    releaseGroup: 'CtrlHD',
    progress: 100,
    eta: '—',
    speed: '0 MB/s',
    size: '3.1 GB',
    status: 'paused',
    service: 'qbittorrent',
    poster: 'https://image.tmdb.org/t/p/w185/7O4iVfOMTuHJl0gPzH4vA9nAgcn.jpg',
    overview: 'Lord Toranaga’s plans reach a breaking point as Blackthorne’s loyalties are tested.',
    indexers: [{ name: 'BeyondHD', seeders: 88, size: '3.1 GB', score: 95 }],
    canPause: true,
    canRemove: true,
    canRetry: true,
  },
  {
    id: 'q4',
    titleId: 'the-bear',
    title: 'The Bear',
    subtitle: 'S03E01 · Tomorrow',
    quality: 'WEBRip-720p',
    releaseGroup: 'FLUX',
    progress: 12,
    eta: '1h 05m',
    speed: '6.2 MB/s',
    size: '0.2 / 1.4 GB',
    status: 'queued',
    service: 'sonarr',
    poster: 'https://image.tmdb.org/t/p/w185/sHFlbKS3WLqMnp9t2XFa2Vfc1OW.jpg',
    overview: 'Carmy returns from Copenhagen with a new vision that upends the entire kitchen.',
    indexers: [{ name: 'IPT', seeders: 56, size: '1.4 GB', score: 82 }],
    canRetry: true,
  },
]

function atLocalDay(offsetDays: number, hours: number, minutes = 0): string {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + offsetDays)
  date.setHours(hours, minutes, 0, 0)
  return date.toISOString()
}

export const DEMO_RELEASES: DemoRelease[] = [
  {
    id: 'r1',
    titleId: 'andor',
    title: 'Andor',
    subtitle: 'S02E03 · Harvest',
    airDate: atLocalDay(0, 21, 0),
    kind: 'episode',
    service: 'sonarr',
    monitored: true,
    hasFile: false,
    meta: 'WEB-DL · Episode',
    poster: 'https://image.tmdb.org/t/p/w185/59SVNwLfoMnZCSPE6DdVTwLWAr0.jpg',
  },
  {
    id: 'r2',
    titleId: 'severance',
    title: 'Severance',
    subtitle: 'S02E05 · Trojan’s Horse',
    airDate: atLocalDay(0, 22, 0),
    kind: 'episode',
    service: 'sonarr',
    monitored: true,
    hasFile: true,
    meta: 'WEB-DL 1080p',
    poster: 'https://image.tmdb.org/t/p/w185/pPHzeujVDQjwQ9aQEm8rY8uLxua.jpg',
  },
  {
    id: 'r3',
    titleId: 'furiosa',
    title: 'Furiosa: A Mad Max Saga',
    subtitle: 'Digital release',
    airDate: atLocalDay(1, 0, 1),
    kind: 'movie',
    service: 'radarr',
    monitored: true,
    hasFile: false,
    meta: 'Ultra-HD · Cinema',
    poster: 'https://image.tmdb.org/t/p/w185/iADOJ8Zymht2JPMoy3R7xceZssk.jpg',
  },
  {
    id: 'r4',
    title: 'The Midnight Ferns',
    subtitle: 'Neon Harbor',
    airDate: atLocalDay(2, 0, 0),
    kind: 'album',
    service: 'lidarr',
    monitored: false,
    hasFile: false,
    meta: 'FLAC · Music',
    poster: 'https://image.tmdb.org/t/p/w185/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  },
  {
    id: 'r5',
    titleId: 'fallout',
    title: 'Fallout',
    subtitle: 'S02E01 · The Ghouls',
    airDate: atLocalDay(3, 0, 1),
    kind: 'episode',
    service: 'sonarr',
    monitored: true,
    hasFile: false,
    meta: 'Season premiere',
    poster: 'https://image.tmdb.org/t/p/w185/AsdB9D6I7s8bkLb2AzPYTHaqKRN.jpg',
  },
  {
    id: 'r6',
    titleId: 'dune-part-two',
    title: 'Dune: Part Two',
    subtitle: 'Theatrical catch-up',
    airDate: atLocalDay(5, 18, 30),
    kind: 'movie',
    service: 'radarr',
    monitored: true,
    hasFile: false,
    meta: 'REMUX 2160p',
    poster: 'https://image.tmdb.org/t/p/w185/1pdfLvkbY9ohJlCjQH2CZzeYwsM.jpg',
  },
  {
    id: 'r7',
    titleId: 'shogun',
    title: 'Shogun',
    subtitle: 'S01E09 · Crimson Sky',
    airDate: atLocalDay(7, 21, 0),
    kind: 'episode',
    service: 'sonarr',
    monitored: true,
    hasFile: false,
    meta: 'Bluray-1080p',
    poster: 'https://image.tmdb.org/t/p/w185/7O4iVfOMTuHJl0gPzH4vA9nAgcn.jpg',
  },
  {
    id: 'r8',
    titleId: 'the-bear',
    title: 'The Bear',
    subtitle: 'S03E02 · Next',
    airDate: atLocalDay(-2, 21, 0),
    kind: 'episode',
    service: 'sonarr',
    monitored: true,
    hasFile: true,
    meta: 'WEBRip-720p',
    poster: 'https://image.tmdb.org/t/p/w185/sHFlbKS3WLqMnp9t2XFa2Vfc1OW.jpg',
  },
]

export const DEMO_SEARCH = [
  { id: 's1', titleId: 'the-penguin', title: 'The Penguin', year: 2024, type: 'series' as const, rating: 8.1 },
  { id: 's2', titleId: 'civil-war', title: 'Civil War', year: 2024, type: 'movie' as const, rating: 7.2 },
  { id: 's3', titleId: 'slow-horses', title: 'Slow Horses', year: 2022, type: 'series' as const, rating: 8.4 },
  { id: 's4', titleId: 'challengers', title: 'Challengers', year: 2024, type: 'movie' as const, rating: 7.1 },
]
