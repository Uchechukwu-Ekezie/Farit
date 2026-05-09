import React, { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, Alert, KeyboardAvoidingView, Platform,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLoginWithEmail, usePrivy } from '@privy-io/expo'
import { Button } from '@/components/ui/Button'

export default function SignInScreen() {
  const [email,   setEmail]   = useState('')
  const [code,    setCode]    = useState('')
  const [step,    setStep]    = useState<'email' | 'code'>('email')
  const [loading, setLoading] = useState(false)

  const { sendCode, loginWithCode } = useLoginWithEmail()
  const { user, logout } = usePrivy()

  async function handleSendCode() {
    if (!email.trim()) return
    setLoading(true)
    try {
      await sendCode({ email: email.trim() })
      setStep('code')
    } catch (e) {
      const msg = (e as Error).message ?? String(e)
      Alert.alert('Failed to send code', msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleVerify() {
    if (!code.trim()) return
    setLoading(true)
    try {
      await loginWithCode({ code: code.trim(), email: email.trim() })
      // Privy fires → AuthGate in _layout.tsx handles routing
    } catch (e) {
      const msg = (e as Error).message ?? String(e)
      Alert.alert('Login failed', msg)
    } finally {
      setLoading(false)
    }
  }

  // Already authenticated — shouldn't be on this screen; show a recovery option
  if (user) {
    return (
      <SafeAreaView className="flex-1 bg-bg items-center justify-center px-6 gap-6">
        <Text className="text-text-primary text-lg font-bold text-center">You're already signed in</Text>
        <Text className="text-text-muted text-sm text-center">
          Tap below to sign out and start fresh, or go back.
        </Text>
        <Button title="Sign out" onPress={() => logout()} />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-bg">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-6 gap-8">

            <View className="items-center gap-2">
              <Text className="text-5xl">◎</Text>
              <Text className="text-text-primary text-2xl font-bold">Farit Wallet</Text>
              <Text className="text-text-muted text-sm">
                {step === 'email'
                  ? 'Enter your email to continue'
                  : `Code sent to ${email}`}
              </Text>
            </View>

            {step === 'email' ? (
              <View className="gap-3">
                <View className="gap-2">
                  <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Email</Text>
                  <TextInput
                    className="bg-card border border-border rounded-2xl px-4 py-4 text-text-primary text-base"
                    placeholder="you@example.com"
                    placeholderTextColor="#50507A"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    autoFocus
                  />
                </View>
                <Button title="Send Code" loading={loading} onPress={handleSendCode} />
              </View>
            ) : (
              <View className="gap-3">
                <View className="gap-2">
                  <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">
                    Verification Code
                  </Text>
                  <TextInput
                    className="bg-card border border-border rounded-2xl px-4 py-4 text-text-primary text-2xl tracking-widest text-center"
                    placeholder="••••••"
                    placeholderTextColor="#50507A"
                    value={code}
                    onChangeText={setCode}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
                <Button title="Verify" loading={loading} onPress={handleVerify} />
                <TouchableOpacity
                  className="items-center py-2"
                  onPress={() => { setStep('email'); setCode('') }}
                >
                  <Text className="text-text-muted text-sm">← Change email</Text>
                </TouchableOpacity>
              </View>
            )}

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}
