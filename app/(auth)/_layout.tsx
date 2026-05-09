import React from 'react'
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="custody-choice" />
      <Stack.Screen name="create-wallet" />
      <Stack.Screen name="import-wallet" />
      <Stack.Screen name="onboarding/agent-setup" />
      <Stack.Screen name="onboarding/complete" />
    </Stack>
  )
}
