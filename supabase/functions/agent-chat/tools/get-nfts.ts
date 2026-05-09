const RPC = Deno.env.get('SOLANA_RPC_URL') ?? 'https://api.devnet.solana.com'

export async function getNfts(walletAddress: string) {
  const res = await fetch(RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'get-nfts',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress: walletAddress,
        page: 1,
        limit: 50,
        displayOptions: { showFungible: false },
      },
    }),
  })

  const json = await res.json()
  const items = json?.result?.items ?? []

  const nfts = items.map((asset: Record<string, unknown>) => {
    const meta    = (asset.content as Record<string, unknown>)?.metadata as Record<string, unknown>
    const links   = (asset.content as Record<string, unknown>)?.links   as Record<string, unknown>
    return {
      mint:  asset.id,
      name:  meta?.name  ?? 'Unknown NFT',
      image: links?.image ?? null,
    }
  })

  return { nfts, total: nfts.length, wallet_address: walletAddress }
}
