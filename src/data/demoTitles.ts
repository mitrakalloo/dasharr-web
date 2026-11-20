export type TitleKind = 'movie' | 'series'

export type TitleEpisode = {
  id: string
  episodeNumber: number
  title: string
  airDate: string
  hasFile: boolean
  monitored: boolean
  quality?: string
  size?: string
}

export type TitleSeason = {
  seasonNumber: number
  monitored?: boolean
  episodeFileCount: number
  episodeCount: number
  sizeOnDisk: string
  episodes: TitleEpisode[]
}

export type TitleRelease = {
  id: string
  title: string
  indexer: string
  quality: string
  size: string
  age: string
  seeders?: number
  score: number
  protocol: 'usenet' | 'torrent'
}

export type DemoTitle = {
  id: string
  kind: TitleKind
  service: 'sonarr' | 'radarr' | 'lidarr'
  title: string
  year: number
  runtime: string
  rating: number
  genres: string[]
  overview: string
  status: string
  monitored: boolean
  network?: string
  quality: string
  hdr?: string
  sizeOnDisk: string
  path: string
  poster: string
  tmdbId?: number
  imdbId?: string
  tvdbId?: number
  titleSlug?: string
  qualityProfileId?: number
  rootFolderPath?: string
  seasons?: TitleSeason[]
  releases: TitleRelease[]
}

const severanceEpisodes: TitleEpisode[] = [
  {
    id: 'sev-s2e1',
    episodeNumber: 1,
    title: 'Hello, Ms. Cobel',
    airDate: '2025-01-17',
    hasFile: true,
    monitored: true,
    quality: 'WEB-DL 1080p',
    size: '2.1 GB',
  },
  {
    id: 'sev-s2e2',
    episodeNumber: 2,
    title: 'Goodbye, Mrs. Selvig',
    airDate: '2025-01-24',
    hasFile: true,
    monitored: true,
    quality: 'WEB-DL 1080p',
    size: '2.0 GB',
  },
  {
    id: 'sev-s2e3',
    episodeNumber: 3,
    title: 'Who Is Alive?',
    airDate: '2025-01-31',
    hasFile: true,
    monitored: true,
    quality: 'WEB-DL 1080p',
    size: '2.3 GB',
  },
  {
    id: 'sev-s2e4',
    episodeNumber: 4,
    title: 'Woe’s Hollow',
    airDate: '2025-02-07',
    hasFile: false,
    monitored: true,
  },
  {
    id: 'sev-s2e5',
    episodeNumber: 5,
    title: 'Trojan’s Horse',
    airDate: '2025-02-14',
    hasFile: true,
    monitored: true,
    quality: 'WEB-DL 1080p',
    size: '2.2 GB',
  },
]

const andorEpisodes: TitleEpisode[] = [
  {
    id: 'and-s2e1',
    episodeNumber: 1,
    title: 'One Year Later',
    airDate: '2025-04-22',
    hasFile: true,
    monitored: true,
    quality: 'WEB-DL 1080p',
    size: '2.8 GB',
  },
  {
    id: 'and-s2e2',
    episodeNumber: 2,
    title: 'Sagrona Teema',
    airDate: '2025-04-22',
    hasFile: true,
    monitored: true,
    quality: 'WEB-DL 1080p',
    size: '2.6 GB',
  },
  {
    id: 'and-s2e3',
    episodeNumber: 3,
    title: 'Harvest',
    airDate: '2025-04-22',
    hasFile: false,
    monitored: true,
  },
]

function releaseSet(prefix: string): TitleRelease[] {
  return [
    {
      id: `${prefix}-rel-1`,
      title: `${prefix}.2160p.WEB-DL.DDP5.1.H.265-OPENMOVIE`,
      indexer: 'OpenNZB',
      quality: 'WEBDL-2160p',
      size: '8.4 GB',
      age: '12h',
      score: 98,
      protocol: 'usenet',
    },
    {
      id: `${prefix}-rel-2`,
      title: `${prefix}.1080p.BluRay.x264-GROUP`,
      indexer: 'TorrentLeech',
      quality: 'Bluray-1080p',
      size: '12.1 GB',
      age: '2d',
      seeders: 184,
      score: 91,
      protocol: 'torrent',
    },
    {
      id: `${prefix}-rel-3`,
      title: `${prefix}.720p.WEBRip.x264-GROUP`,
      indexer: 'IPT',
      quality: 'WEBRip-720p',
      size: '2.4 GB',
      age: '5d',
      seeders: 62,
      score: 74,
      protocol: 'torrent',
    },
  ]
}

export const DEMO_TITLES: Record<string, DemoTitle> = {
  severance: {
    id: 'severance',
    kind: 'series',
    service: 'sonarr',
    title: 'Severance',
    year: 2022,
    runtime: '55m',
    rating: 8.7,
    genres: ['Sci-Fi', 'Drama', 'Mystery'],
    overview:
      'Mark leads a team of office workers whose memories have been surgically divided between their work and personal lives. When a mysterious colleague appears outside of work, it begins to unravel the world they thought they knew.',
    status: 'Continuing',
    monitored: true,
    network: 'Apple TV+',
    quality: 'WEBDL-1080p',
    hdr: 'SDR',
    sizeOnDisk: '48.2 GB',
    path: '/media/tv/Severance',
    poster: 'https://image.tmdb.org/t/p/w185/pPHzeujVDQjwQ9aQEm8rY8uLxua.jpg',
    seasons: [
      {
        seasonNumber: 1,
        episodeFileCount: 9,
        episodeCount: 9,
        sizeOnDisk: '22.4 GB',
        episodes: [],
      },
      {
        seasonNumber: 2,
        episodeFileCount: 4,
        episodeCount: 10,
        sizeOnDisk: '8.6 GB',
        episodes: severanceEpisodes,
      },
    ],
    releases: releaseSet('Severance.S02E04'),
  },
  andor: {
    id: 'andor',
    kind: 'series',
    service: 'sonarr',
    title: 'Andor',
    year: 2022,
    runtime: '45m',
    rating: 8.4,
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    overview:
      'Cassian Andor’s path to rebellion takes him through a dangerous web of spies, soldiers, and politicians in the years leading up to Rogue One.',
    status: 'Continuing',
    monitored: true,
    network: 'Disney+',
    quality: 'WEBDL-1080p',
    sizeOnDisk: '61.0 GB',
    path: '/media/tv/Andor',
    poster: 'https://image.tmdb.org/t/p/w185/59SVNwLfoMnZCSPE6DdVTwLWAr0.jpg',
    seasons: [
      {
        seasonNumber: 1,
        episodeFileCount: 12,
        episodeCount: 12,
        sizeOnDisk: '34.1 GB',
        episodes: [],
      },
      {
        seasonNumber: 2,
        episodeFileCount: 2,
        episodeCount: 12,
        sizeOnDisk: '5.4 GB',
        episodes: andorEpisodes,
      },
    ],
    releases: releaseSet('Andor.S02E03'),
  },
  'dune-part-two': {
    id: 'dune-part-two',
    kind: 'movie',
    service: 'radarr',
    title: 'Dune: Part Two',
    year: 2024,
    runtime: '166m',
    rating: 8.5,
    genres: ['Sci-Fi', 'Adventure'],
    overview:
      'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.',
    status: 'Released',
    monitored: true,
    quality: 'Remux-2160p',
    hdr: 'HDR10',
    sizeOnDisk: '45.2 GB',
    path: '/media/movies/Dune Part Two (2024)',
    poster: 'https://image.tmdb.org/t/p/w185/1pdfLvkbY9ohJlCjQH2CZzeYwsM.jpg',
    releases: releaseSet('Dune.Part.Two.2024'),
  },
  furiosa: {
    id: 'furiosa',
    kind: 'movie',
    service: 'radarr',
    title: 'Furiosa: A Mad Max Saga',
    year: 2024,
    runtime: '148m',
    rating: 7.6,
    genres: ['Action', 'Adventure'],
    overview:
      'The origin story of renegade warrior Furiosa before she teamed up with Mad Max in a desert wasteland.',
    status: 'Released',
    monitored: true,
    quality: 'WEBDL-2160p',
    hdr: 'Dolby Vision',
    sizeOnDisk: '0 B',
    path: '/media/movies/Furiosa (2024)',
    poster: 'https://image.tmdb.org/t/p/w185/iADOJ8Zymht2JPMoy3R7xceZssk.jpg',
    releases: releaseSet('Furiosa.2024'),
  },
  shogun: {
    id: 'shogun',
    kind: 'series',
    service: 'sonarr',
    title: 'Shogun',
    year: 2024,
    runtime: '60m',
    rating: 8.6,
    genres: ['Drama', 'History'],
    overview:
      'In Japan in the year 1600, a mysterious European ship is found shipwrecked. The survivor, John Blackthorne, becomes a pivotal player in a dangerous political game.',
    status: 'Ended',
    monitored: true,
    network: 'FX / Hulu',
    quality: 'Bluray-1080p',
    sizeOnDisk: '28.7 GB',
    path: '/media/tv/Shogun',
    poster: 'https://image.tmdb.org/t/p/w185/7O4iVfOMTuHJl0gPzH4vA9nAgcn.jpg',
    seasons: [
      {
        seasonNumber: 1,
        episodeFileCount: 8,
        episodeCount: 10,
        sizeOnDisk: '28.7 GB',
        episodes: [
          {
            id: 'sho-s1e8',
            episodeNumber: 8,
            title: 'The Abyss of Life',
            airDate: '2024-04-02',
            hasFile: false,
            monitored: true,
          },
          {
            id: 'sho-s1e9',
            episodeNumber: 9,
            title: 'Crimson Sky',
            airDate: '2024-04-09',
            hasFile: false,
            monitored: true,
          },
        ],
      },
    ],
    releases: releaseSet('Shogun.S01E08'),
  },
  'the-bear': {
    id: 'the-bear',
    kind: 'series',
    service: 'sonarr',
    title: 'The Bear',
    year: 2022,
    runtime: '35m',
    rating: 8.5,
    genres: ['Comedy', 'Drama'],
    overview:
      'A young chef from the fine dining world returns to Chicago to run his family’s sandwich shop after a heartbreaking loss.',
    status: 'Continuing',
    monitored: true,
    network: 'FX',
    quality: 'WEBRip-720p',
    sizeOnDisk: '18.9 GB',
    path: '/media/tv/The Bear',
    poster: 'https://image.tmdb.org/t/p/w185/sHFlbKS3WLqMnp9t2XFa2Vfc1OW.jpg',
    seasons: [
      {
        seasonNumber: 3,
        episodeFileCount: 1,
        episodeCount: 10,
        sizeOnDisk: '1.4 GB',
        episodes: [
          {
            id: 'bear-s3e1',
            episodeNumber: 1,
            title: 'Tomorrow',
            airDate: '2024-06-26',
            hasFile: false,
            monitored: true,
          },
          {
            id: 'bear-s3e2',
            episodeNumber: 2,
            title: 'Next',
            airDate: '2024-06-26',
            hasFile: true,
            monitored: true,
            quality: 'WEBRip-720p',
            size: '1.3 GB',
          },
        ],
      },
    ],
    releases: releaseSet('The.Bear.S03E01'),
  },
  fallout: {
    id: 'fallout',
    kind: 'series',
    service: 'sonarr',
    title: 'Fallout',
    year: 2024,
    runtime: '60m',
    rating: 8.4,
    genres: ['Sci-Fi', 'Adventure'],
    overview:
      'In a future, post-apocalyptic Los Angeles brought about by nuclear decimation, citizens try to survive among the aftermath.',
    status: 'Continuing',
    monitored: true,
    network: 'Prime Video',
    quality: 'WEBDL-1080p',
    sizeOnDisk: '24.5 GB',
    path: '/media/tv/Fallout',
    poster: 'https://image.tmdb.org/t/p/w185/AsdB9D6I7s8bkLb2AzPYTHaqKRN.jpg',
    seasons: [
      {
        seasonNumber: 2,
        episodeFileCount: 0,
        episodeCount: 8,
        sizeOnDisk: '0 B',
        episodes: [
          {
            id: 'fo-s2e1',
            episodeNumber: 1,
            title: 'The Ghouls',
            airDate: '2025-12-16',
            hasFile: false,
            monitored: true,
          },
        ],
      },
    ],
    releases: releaseSet('Fallout.S02E01'),
  },
  'the-penguin': {
    id: 'the-penguin',
    kind: 'series',
    service: 'sonarr',
    title: 'The Penguin',
    year: 2024,
    runtime: '60m',
    rating: 8.1,
    genres: ['Crime', 'Drama'],
    overview:
      'Oswald Cobblepot sets out to carve a place for himself among Gotham’s criminal underworld following the events of The Batman.',
    status: 'Ended',
    monitored: true,
    network: 'HBO',
    quality: 'WEBDL-1080p',
    sizeOnDisk: '19.2 GB',
    path: '/media/tv/The Penguin',
    poster: 'https://image.tmdb.org/t/p/w185/vOWcqC4oDQtxduQY84RZTfWOuYp.jpg',
    seasons: [
      {
        seasonNumber: 1,
        episodeFileCount: 8,
        episodeCount: 8,
        sizeOnDisk: '19.2 GB',
        episodes: [],
      },
    ],
    releases: releaseSet('The.Penguin.S01E01'),
  },
  'civil-war': {
    id: 'civil-war',
    kind: 'movie',
    service: 'radarr',
    title: 'Civil War',
    year: 2024,
    runtime: '109m',
    rating: 7.2,
    genres: ['Action', 'War'],
    overview:
      'A journey across a dystopian future America, following a team of military-embedded journalists as they race against time.',
    status: 'Released',
    monitored: true,
    quality: 'Bluray-1080p',
    sizeOnDisk: '0 B',
    path: '/media/movies/Civil War (2024)',
    poster: 'https://image.tmdb.org/t/p/w185/m8xW5ElaQLycAZ0iPO5Olzw7dWJ.jpg',
    releases: releaseSet('Civil.War.2024'),
  },
  'slow-horses': {
    id: 'slow-horses',
    kind: 'series',
    service: 'sonarr',
    title: 'Slow Horses',
    year: 2022,
    runtime: '45m',
    rating: 8.4,
    genres: ['Thriller', 'Drama'],
    overview:
      'A dysfunctional team of MI5 agents — and their obnoxious leader, Jackson Lamb — navigate the espionage world’s smoke and mirrors.',
    status: 'Continuing',
    monitored: true,
    network: 'Apple TV+',
    quality: 'WEBDL-1080p',
    sizeOnDisk: '32.0 GB',
    path: '/media/tv/Slow Horses',
    poster: 'https://image.tmdb.org/t/p/w185/dhkPvgfZnNl9aVYl6xFxJx8p8kH.jpg',
    seasons: [
      {
        seasonNumber: 4,
        episodeFileCount: 6,
        episodeCount: 6,
        sizeOnDisk: '9.8 GB',
        episodes: [],
      },
    ],
    releases: releaseSet('Slow.Horses.S04E01'),
  },
  challengers: {
    id: 'challengers',
    kind: 'movie',
    service: 'radarr',
    title: 'Challengers',
    year: 2024,
    runtime: '131m',
    rating: 7.1,
    genres: ['Drama', 'Romance'],
    overview:
      'Tashi, a former tennis prodigy turned coach, has transformed her husband into a champion — but their marriage cracks when a former boyfriend enters a tournament.',
    status: 'Released',
    monitored: false,
    quality: 'WEBDL-1080p',
    sizeOnDisk: '0 B',
    path: '/media/movies/Challengers (2024)',
    poster: 'https://image.tmdb.org/t/p/w185/H6vke7zGiuLszrs3R5lAtSSeT.jpg',
    releases: releaseSet('Challengers.2024'),
  },
}

export function getDemoTitle(id: string): DemoTitle | undefined {
  return DEMO_TITLES[id]
}

export function titlePath(id: string): string {
  return `/title/${id}`
}
