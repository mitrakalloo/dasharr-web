import { Badge } from '@/components/ui/Badge'
import type { DemoTitle } from '@/data/demoTitles'
import { serviceAccent } from '@/lib/serviceColors'

interface TitleMetaBadgesProps {
  title: DemoTitle
}

export function TitleMetaBadges({ title }: TitleMetaBadgesProps) {
  const accent = serviceAccent(title.service)

  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge color={accent}>{title.status}</Badge>
      {title.quality ? <Badge>{title.quality}</Badge> : null}
      {title.hdr ? <Badge tone="info">{title.hdr}</Badge> : null}
      {title.sizeOnDisk ? <Badge className="tabular">{title.sizeOnDisk}</Badge> : null}
      <Badge tone={title.monitored ? 'success' : 'neutral'} dot>
        {title.monitored ? 'Monitored' : 'Unmonitored'}
      </Badge>
    </div>
  )
}
