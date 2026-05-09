import '../global.css'
import 'react-native-url-polyfill/auto'
import React, { useEffect, useState } from 'react'
import { Stack, useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PrivyProvider, usePrivy, useEmbeddedSolanaWallet } from '@privy-io/expo'
import { supabase } from '@/services/supabase/client'
import { useWalletStore } from '@/store/walletStore'
import { useAgentStore } from '@/store/agentStore'
import { fetchAgentConfig } from '@/services/supabase/agent'
import { fetchMessages } from '@/services/supabase/messages'

const queryClient = new QueryClient()

function AuthGate() {
  const { isReady, user, error: privyError } = usePrivy()
  const solanaWallet = useEmbeddedSolanaWallet()
  const router     = useRouter()
  const setAddress  = useWalletStore((s) => s.setAddress)
  const setConfig   = useAgentStore((s) => s.setConfig)
  const setMessages = useAgentStore((s) => s.setMessages)
  const [timedOut, setTimedOut] = useState(false)

  // Safety net — if Privy hasn't initialised in 8 s, go to welcome anyway
  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 8000)
    return () => clearTimeout(t)
  }, [])

  // Create embedded wallet on first login, then store its address
  useEffect(() => {
    const w = solanaWallet as any
    console.log('[Wallet] full state:', JSON.stringify({
      status: w.status,
      publicKey: w.publicKey,
      hasWallets: !!w.wallets,
      walletsLength: w.wallets?.length,
      firstWallet: w.wallets?.[0] && {
        publicKey: w.wallets[0].publicKey,
        address: w.wallets[0].address,
      },
      keys: Object.keys(w),
    }))

    if (w.status === 'connected') {
      // Try multiple field paths since Privy SDK shape varies
      const pk = w.publicKey ?? w.wallets?.[0]?.publicKey ?? w.wallets?.[0]?.address
      if (pk) {
        console.log('[Wallet] saving address:', pk)
        setAddress(pk, 'embedded')
      }
    } else if (w.status === 'not_created') {
      console.log('[Wallet] creating...')
      w.create?.()
    }
  }, [(solanaWallet as any).status])

  useEffect(() => {
    if (privyError) {
      console.error('[Privy init error]', privyError)
      router.replace('/(auth)/welcome')
      return
    }

    if (!isReady && !timedOut) return

    if (!user) {
      router.replace('/(auth)/welcome')
      return
    }

    async function init() {
      const accounts: any[] = (user as any).linked_accounts ?? (user as any).linkedAccounts ?? []
      const emailAccount = accounts.find((a: any) => a.type === 'email')
      const email: string | undefined = emailAccount?.address ?? emailAccount?.email

      if (!email) {
        // User is authenticated but has no email linked — go to onboarding
        router.replace('/(auth)/onboarding/agent-setup')
        return
      }

      // Bridge Privy auth to Supabase so RLS keeps working
      const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({
        email, password: user!.id,
      })
      if (signInErr || !signInData.session) {
        const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
          email, password: user!.id,
        })
        if (signUpErr || !signUpData.session) {
          await supabase.auth.signInWithPassword({ email, password: user!.id })
        }
      }

      const { data: { session } } = await supabase.auth.getSession()

      // If the Supabase bridge failed (email confirmation still on, or first run),
      // the user is still Privy-authenticated — never send them back to sign-in.
      // Route to onboarding so they can set up their agent config.
      if (!session) {
        console.warn('[AuthGate] No Supabase session — route to onboarding. Disable "Confirm email" in Supabase dashboard to fix permanently.')
        router.replace('/(auth)/onboarding/agent-setup')
        return
      }

      const config = await fetchAgentConfig(session.user.id)
      if (!config) {
        router.replace('/(auth)/onboarding/agent-setup')
        return
      }

      setConfig(config)
      fetchMessages(session.user.id)
        .then((msgs) => { if (msgs.length) setMessages(msgs) })
        .catch(() => {})

      router.replace('/(app)')
    }

    init().catch((e) => {
      console.error('[AuthGate init error]', e)
      router.replace('/(auth)/welcome')
    })
  }, [isReady, user?.id, privyError, timedOut])

  return null
}

export default function RootLayout() {
  return (
    <PrivyProvider
      appId={process.env.EXPO_PUBLIC_PRIVY_APP_ID!}
      clientId={process.env.EXPO_PUBLIC_PRIVY_CLIENT_ID!}
      config={{
        embedded: {
          solana: {
            createOnLogin: 'users-without-wallets',
          },
        },
      }}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <QueryClientProvider client={queryClient}>
            <StatusBar style="light" translucent backgroundColor="transparent" />
            <AuthGate />
            <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
              <Stack.Screen name="index"         />
              <Stack.Screen name="auth/callback"  />
              <Stack.Screen name="(auth)"        />
              <Stack.Screen name="(app)"         />
            </Stack>
          </QueryClientProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </PrivyProvider>
  )
}
