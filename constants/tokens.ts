// Common SPL token mints on Devnet
export const TOKEN_MINTS = {
  SOL:  'So11111111111111111111111111111111111111112',
  USDC: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Devnet USDC
  USDT: 'EJwZgeZrdC8TXTQbQBoL6bfuAnFUUy1PVCMB4DYPzVaS', // Devnet USDT
  BONK: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', // Devnet BONK
} as const

export type TokenSymbol = keyof typeof TOKEN_MINTS

export const TOKEN_DECIMALS: Record<string, number> = {
  [TOKEN_MINTS.SOL]:  9,
  [TOKEN_MINTS.USDC]: 6,
  [TOKEN_MINTS.USDT]: 6,
  [TOKEN_MINTS.BONK]: 5,
}

export const TOKEN_LABELS: Record<string, string> = {
  [TOKEN_MINTS.SOL]:  'SOL',
  [TOKEN_MINTS.USDC]: 'USDC',
  [TOKEN_MINTS.USDT]: 'USDT',
  [TOKEN_MINTS.BONK]: 'BONK',
}

export const LIFI_API          = 'https://li.quest/v1'
export const LIFI_SOLANA_CHAIN = '1151111081099710'

export const DEFAULT_SLIPPAGE_BPS = 50 // 0.5%

export const DEFAULT_VALIDATOR = 'Alio3yGkFoKJsFWiCXhXvPKLtpAkrLbFMhUcSVHBSge'
