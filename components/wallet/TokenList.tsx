import React from 'react'
import { View, Text, FlatList } from 'react-native'
import { useWalletStore, TokenBalance } from '@/store/walletStore'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { Card } from '@/components/ui/Card'

function TokenRow({ token }: { token: TokenBalance }) {
  return (
    <View className="flex-row items-center justify-between py-3 border-b border-divider last:border-0">
      <View className="flex-row items-center gap-3">
        <View className="w-10 h-10 rounded-full bg-border items-center justify-center">
          <Text className="text-text-primary font-bold text-xs">
            {token.symbol.slice(0, 2)}
          </Text>
        </View>
        <View>
          <Text className="text-text-primary font-semibold">{token.symbol}</Text>
          <Text className="text-text-muted text-xs">{token.balance.toFixed(4)}</Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="text-text-primary font-semibold">
          ${token.usdValue.toFixed(2)}
        </Text>
      </View>
    </View>
  )
}

export function TokenList() {
  const { tokens, isLoading } = useWalletStore()

  if (isLoading) {
    return (
      <Card>
        {[1, 2, 3].map((i) => (
          <View key={i} className="flex-row items-center justify-between py-3">
            <View className="flex-row items-center gap-3">
              <SkeletonLoader width={40} height={40} borderRadius={20} />
              <View className="gap-2">
                <SkeletonLoader width={60} height={12} />
                <SkeletonLoader width={40} height={10} />
              </View>
            </View>
            <SkeletonLoader width={50} height={12} />
          </View>
        ))}
      </Card>
    )
  }

  if (!tokens.length) {
    return (
      <Card>
        <Text className="text-text-muted text-center py-4">No tokens found</Text>
      </Card>
    )
  }

  return (
    <Card className="p-0 overflow-hidden">
      <FlatList
        data={tokens}
        keyExtractor={(t) => t.mint}
        renderItem={({ item }) => <TokenRow token={item} />}
        scrollEnabled={false}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      />
    </Card>
  )
}
