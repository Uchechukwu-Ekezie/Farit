import { LIFI_API, LIFI_SOLANA_CHAIN } from '@/constants/tokens'

export interface LifiQuoteEstimate {
  toAmount:    string
  toAmountMin: string
  fromAmount:  string
}

export interface LifiQuote {
  tool:               string
  estimate:           LifiQuoteEstimate
  transactionRequest: { data: string; transactionId: string }
}

export async function getLifiQuote(
  fromToken:   string,
  toToken:     string,
  fromAmount:  number,
  fromAddress: string,
  slippageBps  = 50,
): Promise<LifiQuote> {
  const params = new URLSearchParams({
    fromChain:   LIFI_SOLANA_CHAIN,
    toChain:     LIFI_SOLANA_CHAIN,
    fromToken,
    toToken,
    fromAmount:  String(Math.floor(fromAmount)),
    fromAddress,
    slippage:    String(slippageBps / 10000),
  })

  const res = await fetch(`${LIFI_API}/quote?${params}`)
  if (!res.ok) throw new Error(`LI.FI quote failed: ${res.status}`)

  const data = await res.json()
  if (data.message) throw new Error(`LI.FI: ${data.message}`)

  return data as LifiQuote
}

// Returns base64-serialized Solana transaction ready to sign
export async function buildLifiSwapTransaction(
  fromToken:     string,
  toToken:       string,
  fromAmount:    number,
  walletAddress: string,
  slippageBps?:  number,
): Promise<string> {
  const quote = await getLifiQuote(fromToken, toToken, fromAmount, walletAddress, slippageBps)
  const txData = quote.transactionRequest?.data
  if (!txData) throw new Error('LI.FI did not return transaction data')
  return txData
}
