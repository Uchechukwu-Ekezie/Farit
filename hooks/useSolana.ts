import { useMemo } from 'react'
import { Connection } from '@solana/web3.js'
import { useSettingsStore } from '@/store/settingsStore'

export function useSolana() {
  const rpcEndpoint = useSettingsStore((s) => s.rpcEndpoint)

  const connection = useMemo(
    () => new Connection(rpcEndpoint, 'confirmed'),
    [rpcEndpoint]
  )

  return { connection }
}
