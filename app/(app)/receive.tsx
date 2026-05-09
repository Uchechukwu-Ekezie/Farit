import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as Clipboard from 'expo-clipboard'
import QRCode from 'react-native-qrcode-svg'
import { useWalletStore } from '@/store/walletStore'

export default function ReceiveScreen() {
  const address = useWalletStore((s) => s.address)

  async function copy() {
    if (!address) return
    await Clipboard.setStringAsync(address)
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <View className="flex-1 items-center justify-center px-6 gap-8">
        <Text className="text-text-primary text-2xl font-bold">Receive SOL</Text>

        <View className="bg-white p-5 rounded-3xl shadow-lg">
          {address ? (
            <QRCode
              value={address}
              size={200}
              color="#000000"
              backgroundColor="#FFFFFF"
            />
          ) : (
            <View className="w-52 h-52 items-center justify-center">
              <Text className="text-text-muted text-xs">Loading address…</Text>
            </View>
          )}
        </View>

        <View className="w-full gap-3">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest text-center">
            Your Devnet Address
          </Text>
          <TouchableOpacity
            className="bg-card border border-border rounded-2xl px-4 py-4 items-center"
            onPress={copy}
            activeOpacity={0.7}
          >
            <Text className="text-text-primary font-mono text-sm text-center break-all">
              {address ?? '—'}
            </Text>
            <Text className="text-accent text-xs mt-2 font-semibold">Tap to copy</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-orange/10 border border-orange/30 rounded-2xl p-4 w-full">
          <Text className="text-orange text-xs text-center">
            Only send Devnet SOL to this address. Mainnet funds will be lost.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  )
}
