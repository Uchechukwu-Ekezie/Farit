export const RPC_DEVNET = process.env.EXPO_PUBLIC_SOLANA_RPC_DEVNET ?? 'https://api.devnet.solana.com'
export const NETWORK_LABEL = 'Devnet'
export const EXPLORER_BASE = 'https://solscan.io'
export const EXPLORER_CLUSTER = '?cluster=devnet'

export function explorerTxUrl(signature: string) {
  return `${EXPLORER_BASE}/tx/${signature}${EXPLORER_CLUSTER}`
}

export function explorerAddressUrl(address: string) {
  return `${EXPLORER_BASE}/account/${address}${EXPLORER_CLUSTER}`
}
