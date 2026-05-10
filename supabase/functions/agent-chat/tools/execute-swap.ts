const LIFI_API          = 'https://li.quest/v1'
const LIFI_SOLANA_CHAIN = '1151111081099710'

export async function buildSwapTx(
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

    const txData = data.transactionRequest?.data
    if (!txData) return { error: 'LI.FI did not return transaction data' }

    return {
      serialized_tx: txData,          // base64 Solana tx — loop detects → tx_ready
      from_mint,
      to_mint,
      amount,
      out_amount: data.estimate?.toAmount,
      tool:       data.tool,
    }
  } catch (e) {
    return { error: `LI.FI unreachable: ${(e as Error).message}` }
  }
}
