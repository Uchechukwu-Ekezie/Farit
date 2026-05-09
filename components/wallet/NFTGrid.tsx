import React from 'react'
import { View, Text, Image, FlatList, Dimensions } from 'react-native'
import type { NFTItem } from '@/services/solana/nfts'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'

const COLS = 2
const GAP  = 12
const W    = (Dimensions.get('window').width - 40 - GAP) / COLS

function NFTCard({ item }: { item: NFTItem }) {
  return (
    <View style={{ width: W }} className="bg-card border border-border rounded-2xl overflow-hidden mb-3">
      {item.image ? (
        <Image source={{ uri: item.image }} style={{ width: W, height: W }} resizeMode="cover" />
      ) : (
        <View style={{ width: W, height: W }} className="bg-border items-center justify-center">
          <Text className="text-text-muted text-3xl">🖼</Text>
        </View>
      )}
      <View className="p-3">
        <Text className="text-text-primary font-semibold text-sm" numberOfLines={1}>
          {item.name}
        </Text>
        {item.collection && (
          <Text className="text-text-muted text-xs" numberOfLines={1}>
            {item.collection}
          </Text>
        )}
      </View>
    </View>
  )
}

interface NFTGridProps {
  nfts: NFTItem[]
  loading?: boolean
}

export function NFTGrid({ nfts, loading }: NFTGridProps) {
  if (loading) {
    return (
      <View className="flex-row flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonLoader key={i} width={W} height={W + 60} borderRadius={16} />
        ))}
      </View>
    )
  }

  if (!nfts.length) {
    return (
      <View className="items-center py-10">
        <Text className="text-4xl mb-3">🖼</Text>
        <Text className="text-text-muted">No NFTs in this wallet</Text>
      </View>
    )
  }

  return (
    <FlatList
      data={nfts}
      keyExtractor={(n) => n.mint}
      numColumns={COLS}
      columnWrapperStyle={{ gap: GAP }}
      renderItem={({ item }) => <NFTCard item={item} />}
      scrollEnabled={false}
    />
  )
}
