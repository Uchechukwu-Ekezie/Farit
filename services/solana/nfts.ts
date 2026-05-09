import { RPC_DEVNET } from '@/constants/rpc'

export interface NFTItem {
  mint: string
  name: string
  symbol: string
  image: string | null
  collection: string | null
}

export async function fetchNFTs(walletAddress: string): Promise<NFTItem[]> {
  // Uses Metaplex DAS API (getAssetsByOwner)
  const response = await fetch(RPC_DEVNET, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 'get-nfts',
      method: 'getAssetsByOwner',
      params: {
        ownerAddress: walletAddress,
        page: 1,
        limit: 100,
        displayOptions: { showFungible: false, showNativeBalance: false },
      },
    }),
  })

  const json = await response.json()
  const items = json?.result?.items ?? []

  return items.map((asset: Record<string, unknown>) => {
    const meta    = (asset.content as Record<string, unknown>)?.metadata as Record<string, unknown>
    const links   = (asset.content as Record<string, unknown>)?.links as Record<string, unknown>
    const grouped = asset.grouping as Array<Record<string, unknown>>

    return {
      mint:       asset.id as string,
      name:       (meta?.name as string) ?? 'Unknown NFT',
      symbol:     (meta?.symbol as string) ?? '',
      image:      (links?.image as string) ?? null,
      collection: grouped?.[0]?.group_value as string ?? null,
    }
  })
}
