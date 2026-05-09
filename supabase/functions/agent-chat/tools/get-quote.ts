export async function getQuote(input: Record<string, unknown>) {
  const { from_mint, to_mint, amount, slippage_bps = 50 } = input

  const params = new URLSearchParams({
    inputMint:   from_mint as string,
    outputMint:  to_mint   as string,
    amount:      String(Math.floor(amount as number)),
    slippageBps: String(slippage_bps),
  })

  const res = await fetch(`https://quote-api.jup.ag/v6/quote?${params}`)
  if (!res.ok) return { error: `Jupiter quote failed: ${res.status}` }

  const quote = await res.json()
  return {
    in_amount:        quote.inAmount,
    out_amount:       quote.outAmount,
    price_impact_pct: quote.priceImpactPct,
    from_mint,
    to_mint,
    slippage_bps,
    quote_raw: quote, // kept for execute_swap to reuse
  }
}
