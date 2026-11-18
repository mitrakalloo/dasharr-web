import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

import { getAppEnv } from './env'

export interface ServiceSecrets {
  apiKey: string
  password?: string
}

function keyBytes(): Buffer {
  const raw = getAppEnv().dataEncryptionKey
  // Accept base64 or utf8; always derive a 32-byte key
  try {
    const decoded = Buffer.from(raw, 'base64')
    if (decoded.length >= 32) return decoded.subarray(0, 32)
  } catch {
    // fall through
  }
  return createHash('sha256').update(raw).digest()
}

export function encryptSecrets(secrets: ServiceSecrets): {
  ciphertext: string
  nonce: string
} {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', keyBytes(), iv)
  const plaintext = Buffer.from(JSON.stringify(secrets), 'utf8')
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()])
  const tag = cipher.getAuthTag()
  return {
    ciphertext: Buffer.concat([encrypted, tag]).toString('base64'),
    nonce: iv.toString('base64'),
  }
}

export function decryptSecrets(ciphertext: string, nonce: string): ServiceSecrets {
  const payload = Buffer.from(ciphertext, 'base64')
  const iv = Buffer.from(nonce, 'base64')
  const tag = payload.subarray(payload.length - 16)
  const data = payload.subarray(0, payload.length - 16)
  const decipher = createDecipheriv('aes-256-gcm', keyBytes(), iv)
  decipher.setAuthTag(tag)
  const plain = Buffer.concat([decipher.update(data), decipher.final()]).toString('utf8')
  const parsed = JSON.parse(plain) as ServiceSecrets
  return {
    apiKey: typeof parsed.apiKey === 'string' ? parsed.apiKey : '',
    password: typeof parsed.password === 'string' ? parsed.password : undefined,
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}
