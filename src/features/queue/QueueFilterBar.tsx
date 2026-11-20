import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { QueueFilter } from '@/features/queue/useQueuePage'

const FILTER_LABELS: Record<QueueFilter, string> = {
  all: 'All',
  downloading: 'Downloads',
  paused: 'Paused',
  queued: 'Queued',
  requests: 'Waiting approval',
  watching: 'Now playing',
}

interface QueueFilterBarProps {
  filters: readonly QueueFilter[]
  value: QueueFilter
  counts?: Partial<Record<QueueFilter, number>>
  onChange: (value: QueueFilter) => void
}

export function QueueFilterBar({ filters, value, counts, onChange }: QueueFilterBarProps) {
  return (
    <SegmentedControl
      ariaLabel="Queue filters"
      value={value}
      onChange={onChange}
      bleedMobile
      options={filters.map((filter) => ({
        value: filter,
        label: FILTER_LABELS[filter],
        count: counts?.[filter],
      }))}
    />
  )
}
