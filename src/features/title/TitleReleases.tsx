import { Download, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { SectionHeader } from '@/components/ui/SectionHeader'
import type { TitleRelease } from '@/data/demoTitles'

interface TitleReleasesProps {
  releases: TitleRelease[]
}

export function TitleReleases({ releases }: TitleReleasesProps) {
  return (
    <section className="space-y-3">
      <SectionHeader
        title="Releases"
        count={releases.length}
        trailing={
          <Button
            size="sm"
            variant="soft"
            onClick={() => toast.message('Manual search queued')}
          >
            <Search className="size-3.5" />
            Search
          </Button>
        }
      />

      <div className="space-y-2.5">
        {releases.map((release) => (
          <article
            key={release.id}
            className="panel rounded-[var(--radius-2xl)] p-3.5"
          >
            <div className="flex flex-wrap gap-1.5">
              <Badge>{release.quality}</Badge>
              <Badge className="tabular">{release.size}</Badge>
              <Badge>{release.age}</Badge>
              <Badge tone={release.protocol === 'torrent' ? 'info' : 'warning'}>
                {release.protocol}
              </Badge>
            </div>
            <p className="mt-2 break-words text-sm font-medium leading-snug text-[var(--color-foreground)]">
              {release.title}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--color-hairline)] pt-2.5">
              <p className="tabular text-xs text-[var(--color-muted-foreground)]">
                {release.indexer}
                {release.seeders != null ? ` · ${release.seeders} seeders` : ''} · +{release.score}
              </p>
              <Button
                size="sm"
                variant="soft"
                onClick={() => toast.success(`Grabbed via ${release.indexer}`)}
              >
                <Download className="size-3.5" />
                Grab
              </Button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
