import { Connection, Keypair, VersionedTransaction } from '@solana/web3.js'
import { loadKeypairSecret } from './wallet'

const MAX_RETRIES  = 3
const RETRY_DELAY  = 1000

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let last: Error | null = null
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn()
    } catch (e) {
      last = e as Error
      if (i < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, RETRY_DELAY * 2 ** i))
      }
    }
  }
  throw last
}

export async function signAndBroadcast(
  connection: Connection,
  serializedTxBase64: string
): Promise<string> {
  const secretKey = await loadKeypairSecret()
  if (!secretKey) throw new Error('No keypair found in secure store')

  const keypair = Keypair.fromSecretKey(secretKey)
  const txBytes = Buffer.from(serializedTxBase64, 'base64')
  const tx = VersionedTransaction.deserialize(txBytes)

  tx.sign([keypair])

  const signature = await withRetry(() =>
    connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    })
  )

  await withRetry(() =>
    connection.confirmTransaction(signature, 'confirmed')
  )

  return signature
}
