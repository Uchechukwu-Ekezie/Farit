import React, { useState, useEffect } from 'react'
import {
  View, Text, ScrollView, Alert, TextInput,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { saveMnemonic, saveKeypairSecret } from '@/services/solana/wallet'
import { useWalletStore } from '@/store/walletStore'
import * as Bip39 from 'bip39'
import { Keypair } from '@solana/web3.js'
import { derivePath } from 'ed25519-hd-key'

const SOLANA_PATH = "m/44'/501'/0'/0'"

function deriveKeypair(mnemonic: string): Keypair {
  const seed = Bip39.mnemonicToSeedSync(mnemonic).slice(0, 64)
  const { key } = derivePath(SOLANA_PATH, Buffer.from(seed).toString('hex'))
  return Keypair.fromSeed(key)
}

type Step = 'show' | 'verify'

export default function CreateWalletScreen() {
  const router     = useRouter()
  const setAddress = useWalletStore((s) => s.setAddress)
  const [mnemonic,       setMnemonic]       = useState<string[]>([])
  const [step,           setStep]           = useState<Step>('show')
  const [verifyIndices,  setVerifyIndices]  = useState<number[]>([])
  const [answers,        setAnswers]        = useState<Record<number, string>>({})
  const [loading,        setLoading]        = useState(false)

  useEffect(() => {
    const words = Bip39.generateMnemonic(128).split(' ')
    setMnemonic(words)
    const indices: number[] = []
    while (indices.length < 3) {
      const i = Math.floor(Math.random() * 12)
      if (!indices.includes(i)) indices.push(i)
    }
    setVerifyIndices(indices.sort((a, b) => a - b))
  }, [])

  async function handleSave() {
    setLoading(true)
    try {
      const phrase  = mnemonic.join(' ')
      const keypair = deriveKeypair(phrase)
      await saveMnemonic(phrase)
      await saveKeypairSecret(keypair.secretKey)
      setAddress(keypair.publicKey.toBase58(), 'self_custodial')
      router.push('/(auth)/onboarding/agent-setup')
    } catch (e) {
      Alert.alert('Error', (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function checkVerification(): boolean {
    return verifyIndices.every(
      (idx) => answers[idx]?.trim().toLowerCase() === mnemonic[idx]?.toLowerCase()
    )
  }

  if (step === 'show') {
    return (
      <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
        <ScrollView
          contentContainerStyle={{ padding: 24, gap: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="gap-1">
            <Text className="text-text-primary text-2xl font-bold">Your Seed Phrase</Text>
            <Text className="text-text-secondary text-sm leading-5">
              Write these 12 words down in order. Store them safely offline.
            </Text>
          </View>

          <View className="bg-red/10 border border-red/30 rounded-2xl p-4 gap-1">
            <Text className="text-red text-xs font-bold">⚠ WARNING</Text>
            <Text className="text-text-secondary text-xs mt-1">
              Anyone with these words can access your wallet. Never screenshot or share them.
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2">
            {mnemonic.map((word, i) => (
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

          <Button title="I've Written It Down →" onPress={() => setStep('verify')} />
        </ScrollView>
      </SafeAreaView>
    )
  }

  // Verify step — TextInput for each word (works on both iOS and Android)
  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView
        contentContainerStyle={{ padding: 24, gap: 20 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-1">
          <Text className="text-text-primary text-2xl font-bold">Verify Your Phrase</Text>
          <Text className="text-text-secondary text-sm">
            Enter the words at the positions below to confirm you have them saved.
          </Text>
        </View>

        {verifyIndices.map((idx) => (
          <View key={idx} className="gap-2">
            <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">
              Word #{idx + 1}
            </Text>
            <TextInput
              className={`bg-card border rounded-2xl px-4 py-4 font-mono text-base ${
                answers[idx]
                  ? answers[idx].trim().toLowerCase() === mnemonic[idx]?.toLowerCase()
                    ? 'border-green text-green'
                    : 'border-red text-red'
                  : 'border-border text-text-primary'
              }`}
              placeholder={`Enter word #${idx + 1}`}
              placeholderTextColor="#50507A"
              value={answers[idx] ?? ''}
              onChangeText={(t) => setAnswers((a) => ({ ...a, [idx]: t }))}
              autoCapitalize="none"
              autoCorrect={false}
              spellCheck={false}
            />
          </View>
        ))}

        <Button
          title="Create Wallet"
          loading={loading}
          disabled={!checkVerification()}
          onPress={handleSave}
        />
        <Button
          title="← Back"
          variant="ghost"
          onPress={() => setStep('show')}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
