import React, { useState } from 'react'
import { View, Text, TextInput, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { saveMnemonic, saveKeypairSecret } from '@/services/solana/wallet'
import { useWalletStore } from '@/store/walletStore'
import * as Bip39 from 'bip39'
import { Keypair } from '@solana/web3.js'
import { derivePath } from 'ed25519-hd-key'

const SOLANA_PATH = "m/44'/501'/0'/0'"

export default function ImportWalletScreen() {
  const router = useRouter()
  const setAddress = useWalletStore((s) => s.setAddress)
  const [phrase, setPhrase] = useState('')
  const [loading, setLoading] = useState(false)

  const wordCount = phrase.trim().split(/\s+/).filter(Boolean).length
  const isValid   = (wordCount === 12 || wordCount === 24) && Bip39.validateMnemonic(phrase.trim())

  async function handleImport() {
    if (!isValid) {
      Alert.alert('Invalid phrase', 'Please enter a valid 12 or 24 word seed phrase.')
      return
    }
    setLoading(true)
    try {
      const mnemonic = phrase.trim()
      const seed = Bip39.mnemonicToSeedSync(mnemonic).slice(0, 64)
      const { key } = derivePath(SOLANA_PATH, Buffer.from(seed).toString('hex'))
      const keypair = Keypair.fromSeed(key)
      await saveMnemonic(mnemonic)
      await saveKeypairSecret(keypair.secretKey)
      setAddress(keypair.publicKey.toBase58(), 'self_custodial')
      router.push('/(auth)/onboarding/agent-setup')
    } catch (e) {
      Alert.alert('Error', (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }}>
        <View className="gap-2">
          <Text className="text-text-primary text-2xl font-bold">Import Wallet</Text>
          <Text className="text-text-secondary text-sm">
            Enter your 12 or 24 word seed phrase, separated by spaces.
          </Text>
        </View>

        <View className="bg-red/10 border border-red/30 rounded-2xl p-4">
          <Text className="text-red text-xs">
            Only enter your seed phrase on a device you trust. Never share it with anyone.
          </Text>
        </View>

        <TextInput
          className="bg-card border border-border rounded-2xl p-4 text-text-primary text-base min-h-[140px]"
          placeholder="word1 word2 word3 ..."
          placeholderTextColor="#50507A"
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          value={phrase}
          onChangeText={setPhrase}
          style={{ textAlignVertical: 'top' }}
        />

        <View className="flex-row justify-between">
          <Text className="text-text-muted text-xs">{wordCount} / 12 or 24 words</Text>
          {isValid && <Text className="text-green text-xs font-semibold">✓ Valid phrase</Text>}
        </View>

        <Button
          title="Import Wallet"
          loading={loading}
          disabled={!isValid}
          onPress={handleImport}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
