import React, { useState } from 'react'
import { View, Text, Alert, ScrollView, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { loadMnemonic } from '@/services/solana/wallet'
import * as LocalAuthentication from 'expo-local-authentication'

export default function WalletBackupScreen() {
  const router = useRouter()
  const [phrase,   setPhrase]   = useState<string[] | null>(null)
  const [loading,  setLoading]  = useState(false)

  async function handleReveal() {
    setLoading(true)
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync()
      const isEnrolled  = await LocalAuthentication.isEnrolledAsync()

      if (hasHardware && isEnrolled) {
        const result = await LocalAuthentication.authenticateAsync({
          promptMessage: 'Authenticate to reveal seed phrase',
          fallbackLabel: 'Use PIN',
        })
        if (!result.success) {
          Alert.alert('Authentication failed', 'Could not verify your identity.')
          return
        }
      }

      const mnemonic = await loadMnemonic()
      if (!mnemonic) {
        Alert.alert('Not found', 'No seed phrase found on this device.')
        return
      }
      setPhrase(mnemonic.split(' '))
    } catch (e) {
      Alert.alert('Error', (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-accent text-base">← Back</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-text-primary text-2xl font-bold">Wallet Backup</Text>

        <View className="bg-red/10 border border-red/30 rounded-2xl p-4 gap-2">
          <Text className="text-red font-bold text-sm">⚠ Keep this private</Text>
          <Text className="text-text-secondary text-xs leading-5">
            Your seed phrase is the only way to recover your wallet. Anyone who has it
            can steal your funds. Never share it online or take a screenshot.
          </Text>
        </View>

        {phrase ? (
          <>
            <View className="flex-row flex-wrap gap-2">
              {phrase.map((word, i) => (
                <View
                  key={i}
                  className="bg-card border border-border rounded-xl px-3 py-2 flex-row items-center gap-2"
                  style={{ width: '31%' }}
                >
                  <Text className="text-text-muted text-xs" style={{ width: 16 }}>{i + 1}</Text>
                  <Text className="text-text-primary font-mono text-sm">{word}</Text>
                </View>
              ))}
            </View>
            <Button
              title="Hide Seed Phrase"
              variant="outline"
              onPress={() => setPhrase(null)}
            />
          </>
        ) : (
          <Card className="items-center gap-4 py-8">
            <Text className="text-4xl">🔒</Text>
            <Text className="text-text-secondary text-sm text-center">
              Authenticate to reveal your 12-word seed phrase
            </Text>
            <Button
              title="Reveal Seed Phrase"
              variant="danger"
              loading={loading}
              onPress={handleReveal}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}
