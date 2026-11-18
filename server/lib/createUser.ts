import { hashPassword } from 'better-auth/crypto'

import { auth } from '../auth'

export async function createCredentialUser(input: {
  email: string
  password: string
  name: string
  role: 'admin' | 'member'
}) {
  const ctx = await auth.$context
  const created = await ctx.internalAdapter.createUser(
    {
      email: input.email.toLowerCase().trim(),
      name: input.name.trim(),
      emailVerified: true,
      role: input.role,
    },
    { method: 'email-password' },
  )
  if (!created) throw new Error('Could not create user')

  await ctx.internalAdapter.linkAccount({
    userId: created.id,
    providerId: 'credential',
    accountId: created.id,
    password: await hashPassword(input.password),
  })

  return created
}
