import React from 'react'
import { ActivityIndicator, View } from 'react-native'

interface LoaderProps {
  size?: 'small' | 'large'
  fullScreen?: boolean
}

export function Loader({ size = 'large', fullScreen = false }: LoaderProps) {
  if (fullScreen) {
    return (
      <View className="flex-1 items-center justify-center bg-bg">
        <ActivityIndicator size={size} color="#9945FF" />
      </View>
    )
  }
  return <ActivityIndicator size={size} color="#9945FF" />
}
