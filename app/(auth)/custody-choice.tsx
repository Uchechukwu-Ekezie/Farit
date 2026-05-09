import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Card } from '@/components/ui/Card'

export default function CustodyChoiceScreen() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <View className="flex-1 px-6 pt-8 gap-6">
        <View className="gap-2">
          <Text className="text-text-primary text-2xl font-bold">Wallet Type</Text>
          <Text className="text-text-secondary">Choose how your keys are managed</Text>
        </View>

        <TouchableOpacity onPress={() => router.push('/(auth)/create-wallet')} activeOpacity={0.8}>
          <Card className="gap-3">
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">🔑</Text>
              <View className="flex-1">
                <Text className="text-text-primary font-bold text-base">Self-Custodial</Text>
                <Text className="text-text-secondary text-sm mt-1">
                  Your keys, your crypto. Seed phrase stored encrypted on-device. You are fully in control.
                </Text>
              </View>
              <Text className="text-accent text-xl">›</Text>
            </View>
            <View className="bg-green/10 border border-green/20 rounded-xl px-3 py-2">
              <Text className="text-green text-xs font-semibold">✓ Recommended for privacy</Text>
            </View>
          </Card>
        </TouchableOpacity>

        <Card className="gap-3 opacity-50">
          <View className="flex-row items-center gap-3">
            <Text className="text-2xl">☁️</Text>
            <View className="flex-1">
              <Text className="text-text-primary font-bold text-base">Managed Wallet</Text>
              <Text className="text-text-secondary text-sm mt-1">
                Powered by Privy. No seed phrase needed — log in with email or social.
              </Text>
            </View>
          </View>
          <View className="bg-border rounded-xl px-3 py-2">
            <Text className="text-text-muted text-xs font-semibold">Coming soon</Text>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  )
}
