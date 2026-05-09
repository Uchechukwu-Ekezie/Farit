import React, { useEffect, useState } from 'react'
import { View, Text, RefreshControl, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NFTGrid } from '@/components/wallet/NFTGrid'
import { fetchNFTs, type NFTItem } from '@/services/solana/nfts'
import { useWalletStore } from '@/store/walletStore'

export default function NFTsScreen() {
  const address = useWalletStore((s) => s.address)
  const [nfts,    setNfts]    = useState<NFTItem[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    if (!address) return
    setLoading(true)
    try {
      const data = await fetchNFTs(address)
      setNfts(data)
    } catch {
      setNfts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [address])

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 16 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} tintColor="#9945FF" />}
      >
        <View className="flex-row items-center justify-between">
          <Text className="text-text-primary text-2xl font-bold">NFTs</Text>
          <View className="bg-orange/10 border border-orange/30 rounded-full px-3 py-1">
            <Text className="text-orange text-xs font-bold">DEVNET</Text>
          </View>
        </View>
        <NFTGrid nfts={nfts} loading={loading} />
      </ScrollView>
    </SafeAreaView>
  )
}
