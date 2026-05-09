import { Redirect } from 'expo-router'

// Agent IS the home screen now — redirect any link to '/(app)/agent' back to '/'
export default function AgentRedirect() {
  return <Redirect href="/(app)" />
}
