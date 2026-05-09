import React, { useEffect } from 'react'
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, Linking } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import * as Clipboard from 'expo-clipboard'
import { useWalletStore } from '@/store/walletStore'
import { useBalance } from '@/hooks/useBalance'
import { useTransactions, type ParsedTransaction } from '@/hooks/useTransactions'
import { TokenList } from '@/components/wallet/TokenList'
import { SkeletonLoader } from '@/components/ui/SkeletonLoader'
import { ellipsify } from '@/utils/ellipsify'
import { explorerTxUrl } from '@/constants/rpc'

const QUICK_ACTIONS = [
  { label: 'Send',    icon: '↑', route: '/(app)/send'    },
  { label: 'Receive', icon: '↓', route: '/(app)/receive' },
  { label: 'Swap',    icon: '⇄', route: '/(app)/swap'    },
  { label: 'NFTs',    icon: '🖼', route: '/(app)/nfts'    },
]

function RecentActivity({ txs, loading }: { txs: ParsedTransaction[]; loading: boolean }) {
  if (loading) {
    return (
      <View className="gap-2">
        {[1, 2].map((i) => <SkeletonLoader key={i} width="100%" height={56} borderRadius={12} />)}
      </View>
    )
  }
  if (!txs.length) {
    return (
      <View className="bg-card border border-border rounded-2xl py-8 items-center gap-2">
        <Text className="text-2xl">🕊</Text>
        <Text className="text-text-muted text-sm">No transactions yet</Text>
      </View>
    )
  }
  return (
    <View className="gap-2">
      {txs.map((tx) => (
        <TouchableOpacity
          key={tx.signature}
          className="bg-card border border-border rounded-2xl px-4 py-3 flex-row items-center justify-between"
          onPress={() => Linking.openURL(explorerTxUrl(tx.signature))}
          activeOpacity={0.7}
        >
          <View className="flex-row items-center gap-3">
            <View className={`w-10 h-10 rounded-xl items-center justify-center ${tx.status === 'success' ? 'bg-green/10' : 'bg-red-500/10'}`}>
              <Text className="text-base">{tx.status === 'success' ? '✓' : '✗'}</Text>
            </View>
            <View>
              <Text className="text-text-primary text-base font-semibold capitalize">{tx.type}</Text>
              <Text className="text-text-muted text-xs font-mono">{ellipsify(tx.signature, 4)}</Text>
            </View>
          </View>
          <Text className="text-accent text-sm">↗</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

export default function WalletScreen() {
  const router  = useRouter()
  const insets  = useSafeAreaInsets()
  const { address, solBalance, totalUsdValue, isLoading } = useWalletStore()
  const { refresh } = useBalance()
  const { transactions, loading: txLoading, fetchTransactions } = useTransactions()

  useEffect(() => {
    refresh()
    fetchTransactions(5)
  }, [])

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 100, gap: 20 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => { refresh(); fetchTransactions(5) }} tintColor="#9945FF" />}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between pt-2">
          <Text className="text-text-primary text-2xl font-bold">Wallet</Text>
          <View className="flex-row items-center gap-2">
            <View className="bg-orange/10 border border-orange/30 rounded-full px-3 py-1">
              <Text className="text-orange text-xs font-bold">DEVNET</Text>
            </View>
            <TouchableOpacity
              className="bg-card border border-border rounded-full px-3 py-1.5"
              onPress={async () => { if (address) await Clipboard.setStringAsync(address) }}
            >
              <Text className="text-text-secondary text-xs font-mono">
                {address ? ellipsify(address, 4) : '—'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Portfolio card */}
        <View className="bg-card border border-border rounded-3xl overflow-hidden">
          <View className="p-6 items-center gap-2">
            <Text className="text-text-muted text-xs uppercase tracking-widest">Total Balance</Text>
            {isLoading ? (
              <SkeletonLoader width={180} height={52} borderRadius={8} />
            ) : (
              <Text className="text-text-primary text-5xl font-bold">
                ${totalUsdValue.toFixed(2)}
              </Text>
            )}
            {isLoading ? (
              <SkeletonLoader width={120} height={22} borderRadius={6} />
            ) : (
              <Text className="text-text-secondary text-lg">
                {solBalance.toFixed(4)} <Text className="text-accent font-bold">SOL</Text>
              </Text>
            )}
          </View>

          {/* Quick actions */}
          <View className="flex-row border-t border-border">
            {QUICK_ACTIONS.map(({ label, icon, route }, idx) => (
              <TouchableOpacity
                key={label}
                className={`flex-1 items-center py-4 gap-1 ${idx < QUICK_ACTIONS.length - 1 ? 'border-r border-border' : ''}`}
                onPress={() => router.push(route as `/${string}`)}
                activeOpacity={0.7}
              >
                <Text className="text-accent text-xl font-bold">{icon}</Text>
                <Text className="text-text-muted text-xs font-semibold">{label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Token list */}
        <View className="gap-3">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Tokens</Text>
          <TokenList />
        </View>

        {/* Recent activity */}
        <View className="gap-3">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Recent Activity</Text>
          <RecentActivity txs={transactions} loading={txLoading} />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}
