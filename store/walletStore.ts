import { create } from 'zustand'

export type WalletType = 'self_custodial' | 'embedded'

export interface TokenBalance {
  mint: string
  symbol: string
  decimals: number
  balance: number
  usdValue: number
}

interface WalletState {
  address: string | null
  walletType: WalletType | null
  solBalance: number
  tokens: TokenBalance[]
  totalUsdValue: number
  isLoading: boolean
  setAddress: (address: string, walletType: WalletType) => void
  setSolBalance: (balance: number) => void
  setTokens: (tokens: TokenBalance[]) => void
  setTotalUsdValue: (value: number) => void
  setLoading: (loading: boolean) => void
  clear: () => void
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  walletType: null,
  solBalance: 0,
  tokens: [],
  totalUsdValue: 0,
  isLoading: false,
  setAddress: (address, walletType) => set({ address, walletType }),
  setSolBalance: (solBalance) => set({ solBalance }),
  setTokens: (tokens) => set({ tokens }),
  setTotalUsdValue: (totalUsdValue) => set({ totalUsdValue }),
  setLoading: (isLoading) => set({ isLoading }),
  clear: () => set({
    address: null,
    walletType: null,
    solBalance: 0,
    tokens: [],
    totalUsdValue: 0,
    isLoading: false,
  }),
}))
