function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is required`)
  return value
}

export function getTrustedOrigins(): string[] {
  const raw = process.env.TRUSTED_ORIGINS ?? 'http://localhost:5173,http://localhost:8787'
  return raw
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}

export function getAppEnv() {
  return {
    databaseUrl: required('DATABASE_URL'),
    betterAuthSecret: required('BETTER_AUTH_SECRET'),
    betterAuthUrl: process.env.BETTER_AUTH_URL?.trim() || 'http://localhost:8787',
    dataEncryptionKey: required('DATA_ENCRYPTION_KEY'),
    setupToken: required('SETUP_TOKEN'),
    trustedOrigins: getTrustedOrigins(),
    isProd: process.env.NODE_ENV === 'production',
    port: Number(process.env.PORT ?? 8787),
  }
}
