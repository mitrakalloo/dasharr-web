import { base64ToBytes, bytesToBase64 } from '@/lib/vault/crypto'

export const BIOMETRIC_STORAGE_KEY = 'dasharr-vault-bio'

export interface BiometricUnlockRecord {
  version: 1
  credentialId: string
  prfSalt: string
  iv: string
  ciphertext: string
}

type PrfExtensionResults = {
  prf?: {
    enabled?: boolean
    results?: { first?: ArrayBuffer }
  }
}

export function bufferSource(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

export function readBiometricRecord(): BiometricUnlockRecord | null {
  try {
    const raw = localStorage.getItem(BIOMETRIC_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as BiometricUnlockRecord
    if (parsed?.version !== 1 || !parsed.credentialId || !parsed.prfSalt) return null
    return parsed
  } catch {
    return null
  }
}

export function writeBiometricRecord(record: BiometricUnlockRecord): void {
  localStorage.setItem(BIOMETRIC_STORAGE_KEY, JSON.stringify(record))
}

export function clearBiometricRecord(): void {
  localStorage.removeItem(BIOMETRIC_STORAGE_KEY)
}

export function isBiometricUnlockEnabled(): boolean {
  return readBiometricRecord() !== null
}

export async function canUsePlatformAuthenticator(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) return false
  if (!window.isSecureContext) return false
  try {
    if (typeof PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
    }
  } catch {
    return false
  }
  return false
}

/** WebAuthn PRF is required to turn a passkey into a vault encryption key. */
export async function browserReportsPrfSupport(): Promise<boolean | null> {
  const getCapabilities = (
    PublicKeyCredential as unknown as {
      getClientCapabilities?: () => Promise<Record<string, boolean>>
    }
  ).getClientCapabilities

  if (typeof getCapabilities !== 'function') return null

  try {
    const capabilities = await getCapabilities.call(PublicKeyCredential)
    if (typeof capabilities['extension:prf'] === 'boolean') {
      return capabilities['extension:prf']
    }
    return null
  } catch {
    return null
  }
}

export async function canUsePasskeyVaultUnlock(): Promise<{
  ok: boolean
  reason?: string
}> {
  if (!window.isSecureContext) {
    return { ok: false, reason: 'Passkey unlock needs HTTPS or localhost.' }
  }
  if (!window.PublicKeyCredential) {
    return { ok: false, reason: 'This browser does not support passkeys.' }
  }

  const platform = await canUsePlatformAuthenticator()
  if (!platform) {
    return {
      ok: false,
      reason: 'No Face ID / Touch ID / Windows Hello authenticator is available here.',
    }
  }

  const prf = await browserReportsPrfSupport()
  if (prf === false) {
    return {
      ok: false,
      reason:
        'This browser can’t use passkeys for vault encryption yet (no PRF). Keep using your passphrase, or try current Safari/Chrome.',
    }
  }

  // prf === null means we can’t probe ahead of time; allow the enable attempt.
  return { ok: true }
}

export const PRF_UNSUPPORTED_FLAG = 'dasharr-vault-bio-unsupported'

export const PRF_UNAVAILABLE_MESSAGE =
  'Passkey saved without vault support (no PRF). Use Safari, or in Chrome save to iCloud/Google — not “Chrome profile”.'

export function markPasskeyUnlockUnsupported(): void {
  try {
    localStorage.setItem(PRF_UNSUPPORTED_FLAG, '1')
  } catch {
    // ignore
  }
}

export function clearPasskeyUnlockUnsupported(): void {
  try {
    localStorage.removeItem(PRF_UNSUPPORTED_FLAG)
  } catch {
    // ignore
  }
}

export function isPasskeyUnlockMarkedUnsupported(): boolean {
  try {
    return localStorage.getItem(PRF_UNSUPPORTED_FLAG) === '1'
  } catch {
    return false
  }
}

async function aesKeyFromPrf(prfBits: ArrayBuffer): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', prfBits, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function wrapPassphrase(prfBits: ArrayBuffer, passphrase: string) {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await aesKeyFromPrf(prfBits)
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(passphrase),
  )
  return {
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(encrypted)),
  }
}

export async function unwrapPassphrase(
  prfBits: ArrayBuffer,
  ivB64: string,
  ciphertextB64: string,
): Promise<string> {
  const key = await aesKeyFromPrf(prfBits)
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(ivB64) },
    key,
    base64ToBytes(ciphertextB64),
  )
  return new TextDecoder().decode(decrypted)
}

export function assertPrfEnabled(extensionResults: AuthenticationExtensionsClientOutputs): void {
  const prf = (extensionResults as PrfExtensionResults).prf
  // Some authenticators omit `enabled` but still return results later; only fail when explicitly false.
  if (prf && prf.enabled === false) {
    throw new Error(PRF_UNAVAILABLE_MESSAGE)
  }
}

export function extractPrfFirst(
  extensionResults: AuthenticationExtensionsClientOutputs,
): ArrayBuffer {
  const prf = (extensionResults as PrfExtensionResults).prf
  const first = prf?.results?.first
  if (!first) throw new Error(PRF_UNAVAILABLE_MESSAGE)
  return first
}
