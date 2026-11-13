import { Badge } from '@/components/ui/Badge'
import type { DemoTitle } from '@/data/demoTitles'
import { serviceAccent } from '@/lib/serviceColors'

interface TitleMetaBadgesProps {
  title: DemoTitle
}

export function TitleMetaBadges({ title }: TitleMetaBadgesProps) {
  const accent = serviceAccent(title.service)

  return (
    <div className="flex flex-wrap gap-2">
      <Badge color={accent}>{title.status}</Badge>
      <Badge>{title.quality}</Badge>
      {title.hdr ? <Badge color="#38bdf8">{title.hdr}</Badge> : null}
      <Badge className="tabular">{title.sizeOnDisk}</Badge>
      <Badge color={title.monitored ? '#34d399' : undefined}>
        {title.monitored ? 'Monitored' : 'Unmonitored'}
      </Badge>
    </div>
  )
}
