import { useState, useCallback } from 'react'
import { useWalletStore } from '@/store/walletStore'
import { useSolana } from './useSolana'
import { PublicKey } from '@solana/web3.js'

export interface ParsedTransaction {
  signature: string
  blockTime: number | null
  type: string
  status: 'success' | 'failed'
  fee: number
}

const MAX_RETRIES  = 3

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let last: Error | null = null
  for (let i = 0; i < MAX_RETRIES; i++) {
    try { return await fn() } catch (e) {
      last = e as Error
      if (i < MAX_RETRIES - 1) await new Promise((r) => setTimeout(r, 1000 * 2 ** i))
    }
  }
  throw last
}

export function useTransactions() {
  const address = useWalletStore((s) => s.address)
  const { connection } = useSolana()
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [loading, setLoading] = useState(false)

  const fetchTransactions = useCallback(async (limit = 10) => {
    if (!address) return
    setLoading(true)
    try {
      const sigs = await withRetry(() =>
        connection.getSignaturesForAddress(new PublicKey(address), { limit })
      )

      const parsed: ParsedTransaction[] = sigs.map((s) => ({
        signature: s.signature,
        blockTime: s.blockTime ?? null,
        type:      'transfer',
        status:    s.err ? 'failed' : 'success',
        fee:       0,
      }))

      setTransactions(parsed)
    } catch {
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [address, connection])

  return { transactions, loading, fetchTransactions }
}
