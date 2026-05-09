import { create } from 'zustand'

interface SettingsState {
  biometricsEnabled: boolean
  rpcEndpoint: string
  setBiometrics: (enabled: boolean) => void
  setRpcEndpoint: (url: string) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  biometricsEnabled: false,
  rpcEndpoint: process.env.EXPO_PUBLIC_SOLANA_RPC_DEVNET ?? 'https://api.devnet.solana.com',
  setBiometrics: (biometricsEnabled) => set({ biometricsEnabled }),
  setRpcEndpoint: (rpcEndpoint) => set({ rpcEndpoint }),
}))
