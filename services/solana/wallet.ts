import * as SecureStore from 'expo-secure-store'

const MNEMONIC_KEY  = 'sage_mnemonic'
const KEYPAIR_KEY   = 'sage_keypair_secret'

export async function saveMnemonic(mnemonic: string): Promise<void> {
  await SecureStore.setItemAsync(MNEMONIC_KEY, mnemonic, {
    requireAuthentication: false,
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  })
}

export async function loadMnemonic(): Promise<string | null> {
  return SecureStore.getItemAsync(MNEMONIC_KEY)
}

export async function saveKeypairSecret(secretKey: Uint8Array): Promise<void> {
  const encoded = Buffer.from(secretKey).toString('base64')
  await SecureStore.setItemAsync(KEYPAIR_KEY, encoded, {
    requireAuthentication: false,
    keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
  })
}

export async function loadKeypairSecret(): Promise<Uint8Array | null> {
  const encoded = await SecureStore.getItemAsync(KEYPAIR_KEY)
  if (!encoded) return null
  return new Uint8Array(Buffer.from(encoded, 'base64'))
}

export async function deleteWallet(): Promise<void> {
  await SecureStore.deleteItemAsync(MNEMONIC_KEY)
  await SecureStore.deleteItemAsync(KEYPAIR_KEY)
}

export function hasWallet(): Promise<boolean> {
  return SecureStore.getItemAsync(KEYPAIR_KEY).then(Boolean)
}
