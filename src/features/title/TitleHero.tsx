import { Link } from 'react-router-dom'
import { motion, useTransform, type MotionValue } from 'motion/react'
import { ArrowUpRight, ExternalLink, Star } from 'lucide-react'

import { PosterThumb } from '@/components/ui/PosterThumb'
import type { DemoTitle } from '@/data/demoTitles'
import { serviceAccent } from '@/lib/serviceColors'
import { useConfigStore } from '@/stores/configStore'
import { effectiveServiceUrl } from '@/types/config'

interface TitleHeroProps {
  title: DemoTitle
  scrollY: MotionValue<number>
}

export function TitleHero({ title, scrollY }: TitleHeroProps) {
  const accent = serviceAccent(title.service)
  const service = useConfigStore((state) =>
    state.services.find((entry) => entry.enabled && entry.type === title.service),
  )

  const backdropY = useTransform(scrollY, [0, 280], [0, 96])
  const backdropScale = useTransform(scrollY, [0, 280], [1.04, 1.16])
  const backdropBlur = useTransform(scrollY, [0, 200], [0, 12])
  const backdropOpacity = useTransform(scrollY, [0, 220], [1, 0.25])
  const backdropFilter = useTransform(backdropBlur, (value) => `blur(${value}px)`)
  const posterY = useTransform(scrollY, [0, 200], [0, 28])
  const posterOpacity = useTransform(scrollY, [0, 180], [1, 0.45])

  const nativeUrl = service
    ? (() => {
        const base = effectiveServiceUrl(service).replace(/\/+$/, '')
        if (title.service === 'sonarr' && title.titleSlug) return `${base}/series/${title.titleSlug}`
        if (title.service === 'radarr' && (title.tmdbId || title.titleSlug)) {
          return `${base}/movie/${title.titleSlug || title.tmdbId}`
        }
        return base
      })()
    : undefined

  const imdbUrl = title.imdbId ? `https://www.imdb.com/title/${title.imdbId}` : undefined
  const tmdbUrl = title.tmdbId
    ? `https://www.themoviedb.org/${title.kind === 'movie' ? 'movie' : 'tv'}/${title.tmdbId}`
    : undefined
  const tvdbUrl = title.tvdbId
    ? `https://thetvdb.com/dereferrer/series/${title.tvdbId}`
    : undefined

  const externalLinks = [
    nativeUrl ? { label: `Open in ${service?.name || title.service}`, href: nativeUrl } : null,
    imdbUrl ? { label: 'IMDb', href: imdbUrl } : null,
    tmdbUrl ? { label: 'TMDb', href: tmdbUrl } : null,
    tvdbUrl ? { label: 'TVDB', href: tvdbUrl } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>

  return (
    <div className="relative -mt-14 overflow-hidden border-b border-[var(--color-hairline)]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 origin-top will-change-transform"
        style={{
          y: backdropY,
          scale: backdropScale,
          opacity: backdropOpacity,
          filter: backdropFilter,
          background: `radial-gradient(ellipse 80% 65% at 24% 0%, color-mix(in srgb, ${accent} 26%, transparent), transparent 62%), linear-gradient(180deg, var(--color-card-elevated) 0%, var(--color-background) 100%)`,
        }}
      />

      <div className="relative mx-auto max-w-[var(--content-max)] px-4 pb-6 pt-[calc(58px+max(12px,env(safe-area-inset-top)))] sm:px-6 lg:px-8">
        <div className="flex items-end gap-4 sm:gap-6">
          <motion.div style={{ y: posterY, opacity: posterOpacity }} className="shrink-0">
            <PosterThumb
              src={title.poster}
              label={title.title}
              accent={accent}
              className="h-40 w-[106px] rounded-[var(--radius-xl)] shadow-[var(--elevation-lg)] sm:h-48 sm:w-[128px]"
            />
          </motion.div>
          <div className="min-w-0 flex-1 pb-0.5">
            <Link
              to={service ? `/service/${service.id}` : `/library?service=${title.service}`}
              className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.14em] hover:underline"
              style={{ color: accent }}
            >
              <span>
                {title.service} · {title.kind}
              </span>
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
            <h1 className="font-display mt-1 text-2xl font-semibold leading-tight tracking-tight text-[var(--color-foreground)] sm:text-3xl">
              {title.title}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-[var(--color-muted-foreground)] tabular">
              {title.year ? <span>{title.year}</span> : null}
              {title.year ? <span>·</span> : null}
              <span>{title.runtime}</span>
              {title.rating > 0 ? (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-1 font-medium text-[var(--color-foreground)]">
                    <Star className="size-3.5 fill-amber-400 text-amber-400" aria-hidden="true" />
                    {title.rating.toFixed(1)}
                  </span>
                </>
              ) : null}
            </div>
            {title.genres.length > 0 || title.network ? (
              <p className="mt-1.5 text-xs text-[var(--color-muted-foreground)]">
                {title.genres.join(' · ')}
                {title.network ? `${title.genres.length > 0 ? ' · ' : ''}${title.network}` : ''}
              </p>
            ) : null}
            {externalLinks.length > 0 ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                {externalLinks.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-[var(--color-surface-subtle)] px-2.5 py-1 text-[11px] font-medium text-[var(--color-muted-foreground)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-foreground)]"
                  >
                    {link.label}
                    <ExternalLink className="size-2.5" aria-hidden />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
