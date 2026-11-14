export function InsecureContextScreen() {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'this URL'

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#050507] px-4 text-[var(--color-foreground)]">
      <div className="w-full max-w-sm space-y-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-5">
        <h1 className="text-xl font-semibold tracking-tight">Secure context required</h1>
        <p className="text-sm text-[var(--color-muted-foreground)]">
          Vault encryption uses Web Crypto, which browsers only allow on{' '}
          <span className="text-[var(--color-foreground)]">https://</span> or{' '}
          <span className="text-[var(--color-foreground)]">http://localhost</span>.
        </p>
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          You opened <span className="font-mono">{origin}</span>. Use HTTPS (reverse proxy / Traefik /
          Caddy) or open via localhost / SSH tunnel.
        </p>
      </div>
    </div>
  )
}
