const RPC = Deno.env.get('SOLANA_RPC_URL') ?? 'https://api.devnet.solana.com'
const DEFAULT_VALIDATOR = 'Alio3yGkFoKJsFWiCXhXvPKLtpAkrLbFMhUcSVHBSge'

async function getLatestBlockhash(): Promise<string> {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getLatestBlockhash', params: [] }),
  })
  const json = await res.json()
  return json.result.value.blockhash
}

export async function buildStakeTx(
  input:         Record<string, unknown>,
  walletAddress: string
) {
  const { amount_sol, validator } = input
  const blockhash = await getLatestBlockhash()

  // Return params for on-device assembly with StakeProgram
  // (The Edge Function cannot generate a Keypair for the stake account)
  return {
    tx_type: 'stake',
    serialized_tx: null,
    params: {
      from:            walletAddress,
      amount_lamports: Math.floor((amount_sol as number) * 1e9),
      validator:       (validator as string) ?? DEFAULT_VALIDATOR,
      blockhash,
    },
  }
}
