import { base64ToBytes, bytesToBase64 } from '@/lib/vault/crypto'
import {
  assertPrfEnabled,
  bufferSource,
  extractPrfFirst,
  markPasskeyUnlockUnsupported,
  PRF_UNAVAILABLE_MESSAGE,
  readBiometricRecord,
  unwrapPassphrase,
  wrapPassphrase,
  writeBiometricRecord,
} from '@/lib/vault/webauthn.helpers'

export {
  canUsePasskeyVaultUnlock,
  canUsePlatformAuthenticator,
  clearBiometricRecord,
  clearPasskeyUnlockUnsupported,
  isBiometricUnlockEnabled,
  isPasskeyUnlockMarkedUnsupported,
  readBiometricRecord,
} from '@/lib/vault/webauthn.helpers'

function prfFirstOrNull(
  extensionResults: AuthenticationExtensionsClientOutputs,
): ArrayBuffer | null {
  try {
    return extractPrfFirst(extensionResults)
  } catch {
    return null
  }
}

export async function enrollBiometricUnlock(passphrase: string): Promise<void> {
  if (!window.PublicKeyCredential) {
    throw new Error('Passkeys are not supported in this browser')
  }

  const challenge = crypto.getRandomValues(new Uint8Array(32))
  const userId = crypto.getRandomValues(new Uint8Array(16))
  const prfSalt = crypto.getRandomValues(new Uint8Array(32))
  const saltBuffer = bufferSource(prfSalt)

  // Request PRF during create. Avoid forcing a local "Chrome profile" passkey:
  // prefer platform UV, but allow the browser to store in iCloud / Google Password Manager.
  const credential = (await navigator.credentials.create({
    publicKey: {
      challenge: bufferSource(challenge),
      rp: {
        name: 'Dasharr',
        id: window.location.hostname,
      },
      user: {
        id: bufferSource(userId),
        name: 'dasharr-local-vault',
        displayName: 'Dasharr Vault',
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },
        { type: 'public-key', alg: -257 },
      ],
      authenticatorSelection: {
        userVerification: 'required',
        residentKey: 'preferred',
        requireResidentKey: false,
      },
      timeout: 90_000,
      attestation: 'none',
      extensions: {
        prf: { eval: { first: saltBuffer } },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null

  if (!credential) throw new Error('Passkey enrollment was cancelled')

  const createExt = credential.getClientExtensionResults()
  assertPrfEnabled(createExt)
  let prfBits = prfFirstOrNull(createExt)

  if (!prfBits) {
    const assertion = (await navigator.credentials.get({
      publicKey: {
        challenge: bufferSource(crypto.getRandomValues(new Uint8Array(32))),
        allowCredentials: [{ type: 'public-key', id: credential.rawId }],
        userVerification: 'required',
        timeout: 90_000,
        extensions: {
          prf: { eval: { first: saltBuffer } },
        } as AuthenticationExtensionsClientInputs,
      },
    })) as PublicKeyCredential | null

    if (!assertion) throw new Error('Passkey confirmation was cancelled')
    prfBits = prfFirstOrNull(assertion.getClientExtensionResults())
  }

  if (!prfBits) {
    markPasskeyUnlockUnsupported()
    throw new Error(PRF_UNAVAILABLE_MESSAGE)
  }

  const wrapped = await wrapPassphrase(prfBits, passphrase)
  writeBiometricRecord({
    version: 1,
    credentialId: bytesToBase64(new Uint8Array(credential.rawId)),
    prfSalt: bytesToBase64(prfSalt),
    iv: wrapped.iv,
    ciphertext: wrapped.ciphertext,
  })
}

export async function unlockPassphraseWithBiometric(): Promise<string> {
  const record = readBiometricRecord()
  if (!record) throw new Error('Passkey unlock is not enabled')

  const assertion = (await navigator.credentials.get({
    publicKey: {
      challenge: bufferSource(crypto.getRandomValues(new Uint8Array(32))),
      allowCredentials: [
        {
          type: 'public-key',
          id: bufferSource(base64ToBytes(record.credentialId)),
        },
      ],
      userVerification: 'required',
      timeout: 90_000,
      extensions: {
        prf: { eval: { first: bufferSource(base64ToBytes(record.prfSalt)) } },
      } as AuthenticationExtensionsClientInputs,
    },
  })) as PublicKeyCredential | null

  if (!assertion) throw new Error('Passkey unlock was cancelled')

  const prfBits = extractPrfFirst(assertion.getClientExtensionResults())
  return unwrapPassphrase(prfBits, record.iv, record.ciphertext)
}
