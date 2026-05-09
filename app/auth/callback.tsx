import React, { useEffect } from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { supabase } from '@/services/supabase/client'

export default function AuthCallbackScreen() {
  const { token_hash, type } = useLocalSearchParams<{ token_hash?: string; type?: string }>()
  const router = useRouter()

  useEffect(() => {
    if (token_hash && type) {
      supabase.auth
        .verifyOtp({ token_hash, type: type as 'email' | 'signup' | 'recovery' })
        .then(({ error }) => {
          if (error) router.replace('/(auth)/sign-in')
          // On success, onAuthStateChange in _layout.tsx handles routing
        })
    } else {
      router.replace('/(auth)/sign-in')
    }
  }, [])

  return (
    <View className="flex-1 bg-bg items-center justify-center gap-4">
      <ActivityIndicator size="large" color="#9945FF" />
      <Text className="text-text-secondary text-base">Confirming your account…</Text>
    </View>
  )
}
