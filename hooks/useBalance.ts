import { useCallback } from 'react'
import { PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useWalletStore } from '@/store/walletStore'
import { useSolana } from './useSolana'
import { getSPLTokenAccounts } from '@/services/solana/tokens'
import { TOKEN_MINTS } from '@/constants/tokens'

const PRICE_API = 'https://api.jup.ag/price/v2'
const PRICE_CACHE: { prices: Record<string, number>; ts: number } = { prices: {}, ts: 0 }
const CACHE_TTL_MS = 60_000

async function fetchJupiterPrices(mints: string[]): Promise<Record<string, number>> {
  if (Date.now() - PRICE_CACHE.ts < CACHE_TTL_MS && Object.keys(PRICE_CACHE.prices).length) {
    return PRICE_CACHE.prices
  }
  try {
    const ids = [TOKEN_MINTS.SOL, ...mints].filter(Boolean).join(',')
    const res = await fetch(`${PRICE_API}?ids=${encodeURIComponent(ids)}`)
    if (!res.ok) return {}
    const json = await res.json()
    const prices: Record<string, number> = {}
    for (const [mint, data] of Object.entries<{ price?: string | number }>(json.data ?? {})) {
      prices[mint] = Number(data.price ?? 0)
    }
    PRICE_CACHE.prices = prices
    PRICE_CACHE.ts = Date.now()
    return prices
  } catch {
    return {}
  }
}

export function useBalance() {
  const { connection } = useSolana()
  const { address, setLoading, setSolBalance, setTokens, setTotalUsdValue } = useWalletStore()

  const refresh = useCallback(async () => {
    if (!address) return
    setLoading(true)
    try {
      const pubkey = new PublicKey(address)
      const [lamports, tokenAccounts] = await Promise.all([
        connection.getBalance(pubkey),
        getSPLTokenAccounts(connection, address),
      ])

      const sol = lamports / LAMPORTS_PER_SOL
      setSolBalance(sol)

      const mints = tokenAccounts.map((t) => t.mint)
      const prices = await fetchJupiterPrices(mints)
      const solPrice = prices[TOKEN_MINTS.SOL] ?? 0

      const tokens = tokenAccounts.map((t) => ({
        mint:     t.mint,
        symbol:   t.symbol,
        decimals: t.decimals,
        balance:  t.balance,
        usdValue: t.balance * (prices[t.mint] ?? 0),
      }))

      const totalUsd = sol * solPrice + tokens.reduce((sum, t) => sum + t.usdValue, 0)

      setTokens(tokens)
      setTotalUsdValue(totalUsd)
    } catch (e) {
      console.error('Balance fetch failed:', e)
    } finally {
      setLoading(false)
    }
  }, [address, connection, setLoading, setSolBalance, setTokens, setTotalUsdValue])

  return { refresh }
}
