import { View, ActivityIndicator } from 'react-native'

// Root index — shown briefly while the auth check in _layout.tsx runs.
// The layout immediately redirects to the correct route.
export default function RootIndex() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0D0D14' }}>
      <ActivityIndicator size="large" color="#9945FF" />
    </View>
  )
}
