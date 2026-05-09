import React, { useState } from 'react'
import { View, Text, TextInput, Alert, ScrollView, Switch } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { supabase } from '@/services/supabase/client'
import { upsertAgentConfig } from '@/services/supabase/agent'
import { useAgentStore, AgentPersonality, AIProvider } from '@/store/agentStore'

const PERSONALITIES: { value: AgentPersonality; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'friendly',     label: 'Friendly'     },
  { value: 'degen',        label: 'Degen'         },
]

const PROVIDERS: { value: AIProvider; label: string }[] = [
  { value: 'anthropic', label: 'Claude' },
  { value: 'openai',    label: 'GPT-4o' },
  { value: 'gemini',    label: 'Gemini' },
]

const ALL_ACTIONS = ['send', 'swap', 'stake']

export default function AgentSettingsScreen() {
  const router    = useRouter()
  const { config, setConfig } = useAgentStore()
  const [loading, setLoading] = useState(false)

  const [agentName,   setAgentName]   = useState(config?.agentName   ?? 'SAGE')
  const [personality, setPersonality] = useState<AgentPersonality>(config?.personality  ?? 'professional')
  const [provider,    setProvider]    = useState<AIProvider>(config?.aiProvider ?? 'anthropic')
  const [threshold,   setThreshold]   = useState(String(config?.autoApproveThresholdUsd ?? 10))
  const [actions,     setActions]     = useState<string[]>(config?.enabledActions ?? ALL_ACTIONS)

  function toggleAction(action: string) {
    setActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    )
  }

  async function handleSave() {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    setLoading(true)
    try {
      const updated = {
        agentName,
        personality,
        aiProvider:  provider,
        aiModel:     provider === 'anthropic' ? 'claude-sonnet-4-20250514'
                   : provider === 'openai'    ? 'gpt-4o' : 'gemini-2.0-flash',
        autoApproveThresholdUsd: parseFloat(threshold) || 10,
        enabledActions: actions,
      }
      await upsertAgentConfig(session.user.id, updated)
      setConfig(updated)
      Alert.alert('Saved', 'Agent config updated.', [
        { text: 'OK', onPress: () => router.back() },
      ])
    } catch (e) {
      Alert.alert('Error', (e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-bg" edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }}>
        <Text className="text-text-primary text-2xl font-bold">Agent Settings</Text>

        <View className="gap-2">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Agent Name</Text>
          <TextInput
            className="bg-card border border-border rounded-2xl px-4 py-3 text-text-primary text-base"
            value={agentName}
            onChangeText={setAgentName}
            maxLength={20}
          />
        </View>

        <View className="gap-2">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Personality</Text>
          <View className="flex-row gap-3">
            {PERSONALITIES.map((p) => (
              <Button
                key={p.value}
                title={p.label}
                size="sm"
                variant={personality === p.value ? 'primary' : 'outline'}
                className="flex-1"
                onPress={() => setPersonality(p.value)}
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">AI Provider</Text>
          <View className="flex-row gap-3">
            {PROVIDERS.map((p) => (
              <Button
                key={p.value}
                title={p.label}
                size="sm"
                variant={provider === p.value ? 'primary' : 'outline'}
                className="flex-1"
                onPress={() => setProvider(p.value)}
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Auto-Approve Threshold ($)</Text>
          <TextInput
            className="bg-card border border-border rounded-2xl px-4 py-3 text-text-primary text-base"
            value={threshold}
            onChangeText={setThreshold}
            keyboardType="decimal-pad"
          />
        </View>

        <View className="gap-2">
          <Text className="text-text-muted text-xs font-bold uppercase tracking-widest">Enabled Actions</Text>
          <Card className="gap-4">
            {ALL_ACTIONS.map((action) => (
              <View key={action} className="flex-row items-center justify-between">
                <Text className="text-text-primary capitalize font-medium">{action}</Text>
                <Switch
                  value={actions.includes(action)}
                  onValueChange={() => toggleAction(action)}
                  trackColor={{ false: '#252545', true: '#9945FF' }}
                  thumbColor="#fff"
                />
              </View>
            ))}
          </Card>
        </View>

        <Button title="Save Changes" loading={loading} onPress={handleSave} />
      </ScrollView>
    </SafeAreaView>
  )
}
