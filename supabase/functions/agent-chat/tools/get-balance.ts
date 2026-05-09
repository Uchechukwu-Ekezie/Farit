const RPC = Deno.env.get('SOLANA_RPC_URL') ?? 'https://api.devnet.solana.com'

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method, params }),
  })
  return res.json()
}

export async function getBalance(walletAddress: string) {
  const [solRes, tokenRes] = await Promise.all([
    rpc('getBalance', [walletAddress]),
    rpc('getTokenAccountsByOwner', [
      walletAddress,
      { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
      { encoding: 'jsonParsed' },
    ]),
  ])

  const solBalance = (solRes?.result?.value ?? 0) / 1e9

  const tokens = (tokenRes?.result?.value ?? []).map((account: Record<string, unknown>) => {
    const info    = (account.account as Record<string, unknown>)?.data as Record<string, unknown>
    const parsed  = (info?.parsed as Record<string, unknown>)?.info as Record<string, unknown>
    const amount  = parsed?.tokenAmount as Record<string, unknown>
    return {
      mint:     parsed?.mint,
      decimals: amount?.decimals,
      balance:  amount?.uiAmount,
    }
  }).filter((t: Record<string, unknown>) => (t.balance as number) > 0)

  return { sol_balance: solBalance, tokens, wallet_address: walletAddress }
}
