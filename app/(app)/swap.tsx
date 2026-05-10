import React, { useState, useEffect, useRef } from 'react'
import { View, Text, TextInput, Alert, ScrollView, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useWallet } from '@/hooks/useWallet'
import { getLifiQuote, buildLifiSwapTransaction } from '@/services/lifi/swap'
import { TOKEN_MINTS, DEFAULT_SLIPPAGE_BPS } from '@/constants/tokens'

export default function SwapScreen() {
  const { address, signAndSend } = useWallet()
  const [fromAmount, setFromAmount]   = useState('')
  const [quoteOut,   setQuoteOut]     = useState<string | null>(null)
  const [quoting,    setQuoting]      = useState(false)
  const [loading,    setLoading]      = useState(false)
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // SOL → USDC for MVP
  const fromMint = TOKEN_MINTS.SOL
  const toMint   = TOKEN_MINTS.USDC

  useEffect(() => {
    const amountSol = parseFloat(fromAmount)
    if (!fromAmount || isNaN(amountSol) || amountSol <= 0) {
      setQuoteOut(null)
      return
    }
    if (debounce.current) clearTimeout(debounce.current)
    debounce.current = setTimeout(async () => {
      setQuoting(true)
      try {
        const lamports = Math.floor(amountSol * 1e9)
        const quote = await getLifiQuote(fromMint, toMint, lamports, address!, DEFAULT_SLIPPAGE_BPS)
        const out   = (parseInt(quote.estimate.toAmount) / 1e6).toFixed(4)
        setQuoteOut(out)
      } catch {
        setQuoteOut(null)
      } finally {
        setQuoting(false)
      }
    }, 500)

    return () => { if (debounce.current) clearTimeout(debounce.current) }
  }, [fromAmount])

  async function handleSwap() {
    if (!address || !fromAmount) return
    const amountSol = parseFloat(fromAmount)
    if (isNaN(amountSol) || amountSol <= 0) return
    setLoading(true)
    try {
      const lamports    = Math.floor(amountSol * 1e9)
      const serialized  = await buildLifiSwapTransaction(fromMint, toMint, lamports, address!)
      const sig         = await signAndSend(serialized)
      Alert.alert('Swap complete!', `Signature: ${sig.slice(0, 16)}...`)
      setFromAmount('')
      setQuoteOut(null)
    } catch (e) {
      Alert.alert('Swap failed', (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <Text className="text-text-primary text-2xl font-bold">Swap</Text>

        <Card className="gap-4">
          <View className="gap-2">
            <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">You Pay</Text>
            <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 gap-2">
              <TextInput
                className="flex-1 text-text-primary text-xl font-bold"
                placeholder="0.00"
                placeholderTextColor="#50507A"
                value={fromAmount}
                onChangeText={setFromAmount}
                keyboardType="decimal-pad"
              />
              <Text className="text-accent font-bold text-base">SOL</Text>
            </View>
          </View>

          <View className="items-center">
            <Text className="text-accent text-xl">⇄</Text>
          </View>

          <View className="gap-2">
            <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">You Receive</Text>
            <View className="flex-row items-center bg-surface border border-border rounded-xl px-4 py-3 gap-2">
              {quoting ? (
                <ActivityIndicator size="small" color="#9945FF" />
              ) : (
                <Text className="flex-1 text-text-primary text-xl font-bold">
                  {quoteOut ?? '—'}
                </Text>
              )}
              <Text className="text-green font-bold text-base">USDC</Text>
            </View>
          </View>

          <View className="flex-row justify-between">
            <Text className="text-text-muted text-xs">Slippage</Text>
            <Text className="text-text-secondary text-xs">{DEFAULT_SLIPPAGE_BPS / 100}%</Text>
          </View>
        </Card>

        <Button
          title={`Swap SOL → USDC`}
          loading={loading}
          disabled={!quoteOut || loading}
          onPress={handleSwap}
        />
      </ScrollView>
    </SafeAreaView>
  )
}
