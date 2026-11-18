import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { genericOAuth } from 'better-auth/plugins/generic-oauth'

import { db } from './db/client'
import * as schema from './db/schema'
import { getAppEnv, getTrustedOrigins } from './lib/env'

const env = getAppEnv()

const oidcClientId = process.env.OIDC_CLIENT_ID?.trim()
const oidcClientSecret = process.env.OIDC_CLIENT_SECRET?.trim()
const oidcDiscoveryUrl = process.env.OIDC_DISCOVERY_URL?.trim()
const oidcEnabled = Boolean(oidcClientId && oidcClientSecret && oidcDiscoveryUrl)

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      user: schema.user,
      session: schema.session,
      account: schema.account,
      verification: schema.verification,
    },
  }),
  secret: env.betterAuthSecret,
  baseURL: env.betterAuthUrl,
  trustedOrigins: getTrustedOrigins(),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 14,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  advanced: {
    useSecureCookies: env.isProd,
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'lax',
      secure: env.isProd,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'member',
        input: false,
      },
    },
  },
  plugins: oidcEnabled
    ? [
        genericOAuth({
          config: [
            {
              providerId: 'oidc',
              discoveryUrl: oidcDiscoveryUrl!,
              clientId: oidcClientId!,
              clientSecret: oidcClientSecret!,
              scopes: ['openid', 'email', 'profile'],
            },
          ],
        }),
      ]
    : [],
})

export type SessionUser = {
  id: string
  name: string
  email: string
  role?: string | null
}

export const oidcConfigured = oidcEnabled
