import { getQuote } from './get-quote.ts'

export async function buildSwapTx(
  input:         Record<string, unknown>,
  walletAddress: string
) {
  const { from_mint, to_mint, amount, slippage_bps = 50 } = input

  // Get a fresh quote
  const quoteResult = await getQuote({ from_mint, to_mint, amount, slippage_bps })
  if ((quoteResult as Record<string, unknown>).error) return quoteResult

  const quote = (quoteResult as Record<string, unknown>).quote_raw

  const res = await fetch('https://quote-api.jup.ag/v6/swap', {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      quoteResponse:              quote,
      userPublicKey:              walletAddress,
      wrapAndUnwrapSol:           true,
      dynamicComputeUnitLimit:    true,
      prioritizationFeeLamports:  'auto',
    }),
  })

  if (!res.ok) return { error: `Jupiter swap failed: ${res.status}` }

  const { swapTransaction } = await res.json()
  return {
    serialized_tx: swapTransaction, // base64 unsigned tx — signed on-device
    from_mint,
    to_mint,
    amount,
    out_amount: (quoteResult as Record<string, unknown>).out_amount,
  }
}
