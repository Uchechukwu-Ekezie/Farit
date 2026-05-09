import React, { useState } from 'react'
import { View, Text, TextInput, Alert, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useWallet } from '@/hooks/useWallet'
import { useWalletStore } from '@/store/walletStore'
import { useSolana } from '@/hooks/useSolana'
import {
  PublicKey, SystemProgram, LAMPORTS_PER_SOL,
  VersionedTransaction, TransactionMessage,
} from '@solana/web3.js'

export default function SendScreen() {
  const router = useRouter()
  const { address, signAndSend } = useWallet()
  const { solBalance } = useWalletStore()
  const { connection } = useSolana()

  const [recipient, setRecipient] = useState('')
  const [amount,    setAmount]    = useState('')
  const [loading,   setLoading]   = useState(false)

  async function handleSend() {
    if (!address) return
    const amountSol = parseFloat(amount)
    if (!recipient || isNaN(amountSol) || amountSol <= 0) {
      Alert.alert('Invalid input', 'Enter a valid recipient and amount.')
      return
    }
    if (amountSol > solBalance) {
      Alert.alert('Insufficient balance', `You only have ${solBalance.toFixed(4)} SOL.`)
      return
    }

    setLoading(true)
    try {
      const fromKey  = new PublicKey(address)
      const toKey    = new PublicKey(recipient.trim())
      const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL)

      const { blockhash } = await connection.getLatestBlockhash()
      const msg = new TransactionMessage({
        payerKey: fromKey,
        recentBlockhash: blockhash,
        instructions: [
          SystemProgram.transfer({ fromPubkey: fromKey, toPubkey: toKey, lamports }),
        ],
      }).compileToV0Message()

      const tx = new VersionedTransaction(msg)
      const serialized = Buffer.from(tx.serialize()).toString('base64')
      const sig = await signAndSend(serialized)

      Alert.alert('Sent!', `Signature: ${sig.slice(0, 16)}...`, [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (e) {
      Alert.alert('Error', (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <Text className="text-text-primary text-2xl font-bold">Send SOL</Text>

        <Card className="gap-4">
          <View className="gap-2">
            <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Recipient Address</Text>
            <TextInput
              className="bg-surface border border-border rounded-xl px-4 py-3 text-text-primary font-mono text-sm"
              placeholder="Base58 wallet address"
              placeholderTextColor="#50507A"
              value={recipient}
              onChangeText={setRecipient}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Amount</Text>
              <Text className="text-text-muted text-xs">Balance: {solBalance.toFixed(4)} SOL</Text>
            </View>
            <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 gap-2">
              <TextInput
                className="flex-1 text-text-primary text-base"
                placeholder="0.00"
                placeholderTextColor="#50507A"
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
              <Text className="text-accent font-bold">SOL</Text>
            </View>
          </View>
        </Card>

        <Button title="Send" loading={loading} onPress={handleSend} />
        <Button title="Cancel" variant="ghost" onPress={() => router.back()} />
      </ScrollView>
    </SafeAreaView>
  )
}
