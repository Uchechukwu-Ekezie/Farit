import { useWalletStore } from '@/store/walletStore'
import { useCallback } from 'react'
import { signAndBroadcast } from '@/services/solana/transactions'
import { useSolana } from './useSolana'

export function useWallet() {
  const { address, walletType, solBalance, tokens, isLoading } = useWalletStore()
  const { connection } = useSolana()

  const signAndSend = useCallback(
    async (serializedTxBase64: string) => {
      if (!address) throw new Error('No wallet connected')
      return signAndBroadcast(connection, serializedTxBase64)
    },
    [address, connection]
  )

  return { address, walletType, solBalance, tokens, isLoading, signAndSend }
}
