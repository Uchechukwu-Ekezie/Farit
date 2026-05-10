const LIFI_API          = 'https://li.quest/v1'
const LIFI_SOLANA_CHAIN = '1151111081099710'

export async function getQuote(
  input:         Record<string, unknown>,
  walletAddress: string,
) {
  const { from_mint, to_mint, amount, slippage_bps = 50 } = input

  const params = new URLSearchParams({
    fromChain:   LIFI_SOLANA_CHAIN,
    toChain:     LIFI_SOLANA_CHAIN,
    fromToken:   from_mint   as string,
    toToken:     to_mint     as string,
    fromAmount:  String(Math.floor(amount as number)),
    fromAddress: walletAddress,
    slippage:    String((slippage_bps as number) / 10000),
  })

  try {
    const res = await fetch(`${LIFI_API}/quote?${params}`)
    if (!res.ok) return { error: `LI.FI quote failed: ${res.status}` }

    const data = await res.json()
    if (data.message) return { error: `LI.FI: ${data.message}` }

    const estimate = data.estimate ?? {}
    return {
      in_amount:        estimate.fromAmount,
      out_amount:       estimate.toAmount,
      out_amount_min:   estimate.toAmountMin,
      price_impact_pct: '0',
      tool:             data.tool,
      from_mint,
      to_mint,
      slippage_bps,
    }
  } catch (e) {
    return { error: `LI.FI unreachable: ${(e as Error).message}` }
  }
}
