import { JUPITER_QUOTE_URL, DEFAULT_SLIPPAGE_BPS } from '@/constants/tokens'

export interface JupiterQuote {
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  priceImpactPct: string
  routePlan: unknown[]
  slippageBps: number
  otherAmountThreshold: string
  swapMode: string
}

export async function getQuote(
  fromMint: string,
  toMint: string,
  amount: number,
  slippageBps = DEFAULT_SLIPPAGE_BPS
): Promise<JupiterQuote> {
  const params = new URLSearchParams({
    inputMint:    fromMint,
    outputMint:   toMint,
    amount:       String(Math.floor(amount)),
    slippageBps:  String(slippageBps),
    onlyDirectRoutes: 'false',
  })

  const res = await fetch(`${JUPITER_QUOTE_URL}?${params}`)
  if (!res.ok) throw new Error(`Jupiter quote failed: ${res.status}`)

  return res.json()
}
