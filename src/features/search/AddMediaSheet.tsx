import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { BottomSheet } from '@/components/ui/BottomSheet'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Input } from '@/components/ui/Input'
import { titlePath } from '@/data/demoTitles'
import { useConfiguredStack } from '@/hooks/useConfiguredStack'
import { useMediaSearch } from '@/hooks/useMediaSearch'

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
    <BottomSheet open={open} onClose={onClose} title="Add media" size="lg">
      <Input
        label="Search"
        placeholder="Show, movie, or album…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      {needsSetup || !live.canSearch ? (
        <div className="mt-4 space-y-3">
          <EmptyState
            title="No search sources"
            description="Add Seerr or an *arr app in Settings."
            actionLabel="Open Settings"
            actionTo="/settings?focus=services"
          />
          <Link
            to="/settings?focus=services"
            onClick={onClose}
            className="inline-flex min-h-[var(--tap)] w-full items-center justify-center text-sm font-medium text-[var(--color-accent)]"
          >
            Open Settings
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-2">
          {live.status === 'loading' ? (
            <p className="text-sm text-[var(--color-muted-foreground)]">Searching…</p>
          ) : null}
          {live.items.map((item) => (
            <div
              key={item.id}
              className="flex min-h-[var(--tap)] items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-card-elevated)] px-3"
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
                className="min-w-0 flex-1 cursor-pointer py-2 text-left"
              >
                <p className="text-sm font-medium">
                  {item.title}{' '}
                  <span className="text-[var(--color-muted-foreground)]">
                    ({item.year || '—'})
                  </span>
                </p>
                <p className="text-xs capitalize text-[var(--color-muted-foreground)]">
                  {item.type} · {item.source}
                  {item.titleId ? ' · Open details' : ''}
                </p>
              </button>
              {!item.alreadyAdded ? (
                <Button
                  variant="soft"
                  className="min-h-10 px-3 text-xs"
                  onClick={() => void live.beginAdd(item)}
                >
                  {has('seerr') && item.source === 'seerr' ? 'Request' : 'Add'}
                </Button>
              ) : item.titleId ? (
                <Button
                  variant="soft"
                  className="min-h-10 px-3 text-xs"
                  onClick={() => {
                    onClose()
                    navigate(titlePath(item.titleId!))
                  }}
                >
                  Open
                </Button>
              ) : null}
            </div>
          ))}
          {live.status === 'success' && live.items.length === 0 ? (
            <EmptyState title="No matches" description="Try another search." />
          ) : null}
        </div>
      )}
    </BottomSheet>
  )
}
