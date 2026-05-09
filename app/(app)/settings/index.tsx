import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { usePrivy } from '@privy-io/expo'
import { supabase } from '@/services/supabase/client'
import { useWalletStore } from '@/store/walletStore'
import { useAgentStore } from '@/store/agentStore'
import { ellipsify } from '@/utils/ellipsify'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text className="text-text-muted text-xs font-bold uppercase tracking-widest px-1">{title}</Text>
      <View className="bg-card border border-border rounded-2xl overflow-hidden">
        {children}
      </View>
    </View>
  )
}

function Row({ icon, label, value, onPress, danger = false, last = false }: {
  icon: string; label: string; value?: string
  onPress: () => void; danger?: boolean; last?: boolean
}) {
  return (
    <TouchableOpacity
      className={`flex-row items-center gap-3 px-4 py-4 ${!last ? 'border-b border-divider' : ''}`}
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="w-8 h-8 rounded-xl bg-border items-center justify-center">
        <Text className="text-base">{icon}</Text>
      </View>
      <Text className={`flex-1 text-base font-medium ${danger ? 'text-red-400' : 'text-text-primary'}`}>
        {label}
      </Text>
      <View className="flex-row items-center gap-2">
        {value && <Text className="text-text-muted text-sm">{value}</Text>}
        {!danger && <Text className="text-text-muted">›</Text>}
      </View>
    </TouchableOpacity>
  )
}

export default function SettingsScreen() {
  const router  = useRouter()
  const address = useWalletStore((s) => s.address)
  const config  = useAgentStore((s) => s.config)
  const { clear: clearWallet } = useWalletStore()
  const { setConfig } = useAgentStore()
  const { logout } = usePrivy()

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out', style: 'destructive',
        onPress: async () => {
          await logout()
          await supabase.auth.signOut()
          clearWallet()
          setConfig(null as never)
        },
      },
    ])
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-text-primary text-2xl font-bold">Settings</Text>

        <Section title="Wallet">
          <Row icon="◈" label="Address" value={address ? ellipsify(address, 6) : '—'} onPress={() => router.push('/(app)/receive')} />
          <Row icon="🖼" label="NFT Gallery" onPress={() => router.push('/(app)/nfts')} last />
        </Section>

        <Section title="Agent">
          <Row icon="✦" label="Configure Agent" value={config?.agentName} onPress={() => router.push('/(app)/settings/agent' as never)} />
          <Row icon="🤖" label="AI Provider" value={config?.aiProvider?.toUpperCase()} onPress={() => router.push('/(app)/settings/agent' as never)} last />
        </Section>

        <Section title="Network">
          <Row icon="⬡" label="Network" value="Devnet" onPress={() => {}} />
          <Row icon="🔗" label="RPC Endpoint" value="api.devnet.solana.com" onPress={() => {}} last />
        </Section>

        <Section title="Account">
          <Row icon="🚪" label="Sign Out" onPress={handleSignOut} danger last />
        </Section>

        <Text className="text-text-muted text-xs text-center">
          Farit Wallet · Solana Devnet · v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}
