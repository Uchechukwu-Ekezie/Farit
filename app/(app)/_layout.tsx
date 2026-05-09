import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { Tabs, useRouter, usePathname } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const TABS = [
  { name: 'index',    route: '/(app)',          label: 'Agent',    icon: '✦', primary: true  },
  { name: 'wallet',   route: '/(app)/wallet',   label: 'Wallet',   icon: '◈', primary: false },
  { name: 'swap',     route: '/(app)/swap',     label: 'Swap',     icon: '⇄', primary: false },
  { name: 'settings', route: '/(app)/settings', label: 'Settings', icon: '⚙', primary: false },
]

function CustomTabBar() {
  const insets   = useSafeAreaInsets()
  const router   = useRouter()
  const pathname = usePathname()

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 12,
        left: 16, right: 16,
        height: 68,
        backgroundColor: '#131320',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: '#1E1E38',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 20,
        elevation: 16,
      }}
    >
      {TABS.map((tab) => {
        const isActive = tab.name === 'index'
          ? pathname === '/' || pathname === '/(app)' || pathname === '/(app)/'
          : pathname.startsWith(tab.route)

        return (
          <TouchableOpacity
            key={tab.name}
            onPress={() => router.push(tab.route as `/${string}`)}
            activeOpacity={0.7}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
          >
            {tab.primary ? (
              <View style={{
                backgroundColor: isActive ? '#9945FF' : '#252545',
                borderRadius: 16,
                paddingHorizontal: 22,
                paddingVertical: 11,
                shadowColor: '#9945FF',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isActive ? 0.5 : 0,
                shadowRadius: 8,
              }}>
                <Text style={{ fontSize: 20, color: '#fff' }}>✦</Text>
              </View>
            ) : (
              <View style={{ alignItems: 'center', gap: 3 }}>
                <Text style={{
                  fontSize: 22,
                  color: isActive ? '#9945FF' : '#50507A',
                  fontWeight: isActive ? '700' : '400',
                }}>
                  {tab.icon}
                </Text>
                <Text style={{
                  fontSize: 11,
                  fontWeight: '600',
                  color: isActive ? '#9945FF' : '#50507A',
                }}>
                  {tab.label}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

export default function AppLayout() {
  return (
    <Tabs tabBar={() => <CustomTabBar />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index"    />
      <Tabs.Screen name="wallet"   />
      <Tabs.Screen name="swap"     />
      <Tabs.Screen name="settings" />
      <Tabs.Screen name="agent"    options={{ href: null }} />
      <Tabs.Screen name="nfts"     options={{ href: null }} />
      <Tabs.Screen name="send"     options={{ href: null }} />
      <Tabs.Screen name="receive"  options={{ href: null }} />
    </Tabs>
  )
}
