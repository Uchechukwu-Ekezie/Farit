import React from 'react'
import { View, Text } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { useWalletStore } from '@/store/walletStore'
import { useAgentStore } from '@/store/agentStore'

export default function CompleteScreen() {
  const router  = useRouter()
  const address = useWalletStore((s) => s.address)
  const config  = useAgentStore((s) => s.config)

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top', 'bottom']}>
      <View className="flex-1 items-center justify-center px-6 gap-8">
        <View className="items-center gap-4">
          <Text className="text-7xl">🎉</Text>
          <Text className="text-text-primary text-3xl font-bold text-center">
            You're all set!
          </Text>
          <Text className="text-text-secondary text-base text-center leading-6">
            {config?.agentName ?? 'Your agent'} is ready to help you navigate the Solana ecosystem.
          </Text>
        </View>

        <View className="w-full bg-card border border-border rounded-2xl p-4 gap-2">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Wallet Address</Text>
          <Text className="text-text-primary font-mono text-sm break-all">
            {address ?? '—'}
          </Text>
        </View>

        <View className="w-full bg-orange/10 border border-orange/30 rounded-2xl p-4">
          <Text className="text-orange text-xs font-bold mb-1">⚠ Devnet Only</Text>
          <Text className="text-text-secondary text-xs">
            This wallet operates on Solana Devnet. All tokens and transactions are test-only.
          </Text>
        </View>

        <Button
          title="Enter App"
          className="w-full"
          onPress={() => router.replace('/(app)')}
        />
      </View>
    </SafeAreaView>
  )
}
