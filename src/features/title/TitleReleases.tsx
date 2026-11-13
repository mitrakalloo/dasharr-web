import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import type { TitleRelease } from '@/data/demoTitles'

interface TitleReleasesProps {
  releases: TitleRelease[]
}

export function TitleReleases({ releases }: TitleReleasesProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Releases</h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">Best match first</p>
        </div>
        <Button
          variant="soft"
          className="min-h-10 px-3 text-xs"
          onClick={() => toast.message('Manual search queued')}
        >
          Search
        </Button>
      </div>

      <div className="space-y-2">
        {releases.map((release) => (
          <article
            key={release.id}
            className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3"
          >
            <div className="flex flex-wrap gap-2">
              <Badge>{release.quality}</Badge>
              <Badge className="tabular">{release.size}</Badge>
              <Badge>{release.age}</Badge>
              <Badge color={release.protocol === 'torrent' ? '#60a5fa' : '#fbbf24'}>
                {release.protocol}
              </Badge>
            </div>
            <p className="mt-2 break-all text-sm font-medium leading-snug">{release.title}</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="tabular text-xs text-[var(--color-muted-foreground)]">
                {release.indexer}
                {release.seeders != null ? ` · ${release.seeders} seeders` : ''} · +{release.score}
              </p>
              <Button
                variant="soft"
                className="min-h-10 px-3 text-xs"
                onClick={() => toast.success(`Grabbed via ${release.indexer}`)}
              >
                Grab
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
