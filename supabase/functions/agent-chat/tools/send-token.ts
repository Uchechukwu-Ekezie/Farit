const RPC = Deno.env.get('SOLANA_RPC_URL') ?? 'https://api.devnet.solana.com'
const SOL_MINT = 'So11111111111111111111111111111111111111112'

async function getLatestBlockhash(): Promise<string> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getLatestBlockhash', params: [] }),
  })
  const json = await res.json()
  return json.result.value.blockhash
}

export async function buildSendTx(
  input:         Record<string, unknown>,
  walletAddress: string
) {
  const { token, amount, recipient } = input

  if (token === 'SOL' || token === SOL_MINT) {
    // Build a SOL transfer via the system program
    // The Edge Function builds the instruction data; the app signs the tx.
    const lamports   = Math.floor((amount as number) * 1e9)
    const blockhash  = await getLatestBlockhash()

    // Encode as a minimal transaction descriptor — the app reconstructs it
    return {
      tx_type:       'sol_transfer',
      serialized_tx: null, // assembled client-side from these params
      params: {
        from:      walletAddress,
        to:        recipient,
        lamports,
        blockhash,
      },
    }
  }

  // SPL token transfer — return params for client-side assembly
  const blockhash = await getLatestBlockhash()
  return {
    tx_type: 'spl_transfer',
    serialized_tx: null,
    params: {
      from:     walletAddress,
      to:       recipient,
      mint:     token,
      amount,
      blockhash,
    },
  }
}
