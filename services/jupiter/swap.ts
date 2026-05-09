import { JUPITER_SWAP_URL, DEFAULT_SLIPPAGE_BPS } from '@/constants/tokens'
import { getQuote } from './quote'

export async function buildSwapTransaction(
  fromMint: string,
  toMint: string,
  amount: number,
  walletAddress: string,
  slippageBps = DEFAULT_SLIPPAGE_BPS
): Promise<string> {
  const quote = await getQuote(fromMint, toMint, amount, slippageBps)

  const res = await fetch(JUPITER_SWAP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse:         quote,
      userPublicKey:         walletAddress,
      wrapAndUnwrapSol:      true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: 'auto',
    }),
  })

  if (!res.ok) throw new Error(`Jupiter swap failed: ${res.status}`)

  const { swapTransaction } = await res.json()
  return swapTransaction as string // base64 unsigned serialized tx
}
