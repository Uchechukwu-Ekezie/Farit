import { Connection, PublicKey } from '@solana/web3.js'
import { TOKEN_DECIMALS, TOKEN_LABELS } from '@/constants/tokens'

export interface TokenAccountInfo {
  mint: string
  symbol: string
  decimals: number
  rawBalance: bigint
  balance: number
}

export async function getSPLTokenAccounts(
  connection: Connection,
  walletAddress: string
): Promise<TokenAccountInfo[]> {
  const { value } = await connection.getParsedTokenAccountsByOwner(
    new PublicKey(walletAddress),
    { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
  )

  return value
    .map(({ account }) => {
      const info    = account.data.parsed.info
      const mint    = info.mint as string
      const decimal = (info.tokenAmount.decimals as number) ?? TOKEN_DECIMALS[mint] ?? 0
      const raw     = BigInt(info.tokenAmount.amount as string)
      const balance = Number(raw) / 10 ** decimal

      return {
        mint,
        symbol:   TOKEN_LABELS[mint] ?? mint.slice(0, 6),
        decimals: decimal,
        rawBalance: raw,
        balance,
      }
    })
    .filter((t) => t.balance > 0)
}
