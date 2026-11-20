import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink, Plus, Search } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/Badge'
import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { PosterThumb } from '@/components/ui/PosterThumb'
import { AddOptionsSheet } from '@/features/search/AddOptionsSheet'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useMediaSearch } from '@/hooks/useMediaSearch'
import { serviceAccent } from '@/lib/serviceColors'

interface AddMediaSheetProps {
  open: boolean
  onClose: () => void
}

export function AddMediaSheet({ open, onClose }: AddMediaSheetProps) {
  const navigate = useNavigate()
  const { has, needsSetup } = useConfiguredStack()
  const [query, setQuery] = useState('')
  const live = useMediaSearch(open && !needsSetup, query)

  return (
    <>
      <BottomSheet
        open={open}
        onClose={onClose}
        title="Add media"
        subtitle="Search across configured Seerr and *arr services"
        size="lg"
      >
        <Input
          leadingIcon={<Search className="size-4" />}
          placeholder="Show, movie, or album…"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onClear={() => setQuery('')}
        />

        {needsSetup || !live.canSearch ? (
          <div className="mt-4">
            <EmptyState
              compact
              icon={<Search className="size-5" aria-hidden />}
              title="No search sources"
              description="Add Seerr, Sonarr, Radarr, or Lidarr in Settings."
              actionLabel="Open Settings"
              onAction={() => {
                onClose()
                navigate('/settings?focus=services')
              }}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {live.status === 'loading' ? (
              <div className="space-y-2">
                <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
                <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
                <div className="skeleton h-16 rounded-[var(--radius-xl)]" />
              </div>
            ) : null}
            {live.items.map((item) => {
              const accent = serviceAccent(item.source)
              return (
                <div
                  key={item.id}
                  className="flex min-h-[68px] items-center justify-between gap-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-subtle)] p-2.5 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-hover)]"
                >
                  <button
                    type="button"
                    onClick={() => {
                      if (item.titleId) {
                        onClose()
                        navigate(titlePath(item.titleId))
                        return
                      }
                      if (!item.alreadyAdded) {
                        void live.beginAdd(item)
                        return
                      }
                      toast.message('Title isn’t linked to a library id yet')
                    }}
                    className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
                  >
                    <PosterThumb
                      src={item.poster}
                      label={item.title}
                      accent={accent}
                      className="h-14 w-10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold tracking-tight">
                        {item.title}{' '}
                        <span className="font-normal text-[var(--color-muted-foreground)]">
                          ({item.year || '—'})
                        </span>
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge color={accent}>{item.source}</Badge>
                        <Badge>{item.type}</Badge>
                      </div>
                    </div>
                  </button>
                  {!item.alreadyAdded ? (
                    <Button
                      variant="soft"
                      size="sm"
                      className="shrink-0"
                      onClick={() => void live.beginAdd(item)}
                    >
                      <Plus className="size-3.5" aria-hidden />
                      {has('seerr') && item.source === 'seerr' ? 'Request' : 'Add'}
                    </Button>
                  ) : item.titleId ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="shrink-0"
                      onClick={() => {
                        onClose()
                        navigate(titlePath(item.titleId!))
                      }}
                    >
                      <ExternalLink className="size-3.5" aria-hidden />
                      Open
                    </Button>
                  ) : null}
                </div>
              )
            })}
            {live.status === 'success' && live.items.length === 0 ? (
              <EmptyState compact title="No matches" description="Try another search term." />
            ) : null}
          </div>
        )}
      </BottomSheet>

      <AddOptionsSheet
        open={Boolean(live.pendingItem)}
        title={live.pendingItem ? `Add · ${live.pendingItem.title}` : 'Add options'}
        bundle={live.addBundle}
        defaults={live.defaultAdd}
        onClose={live.cancelAdd}
        onConfirm={(options) => void live.confirmAdd(options)}
      />
    </>
  )
}
