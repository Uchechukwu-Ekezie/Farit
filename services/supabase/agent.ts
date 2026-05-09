import { supabase } from './client'
import type { AgentConfig } from '@/store/agentStore'

export async function fetchAgentConfig(userId: string): Promise<AgentConfig | null> {
  const { data, error } = await supabase
    .from('agent_configs')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    agentName: data.agent_name,
    personality: data.personality,
    aiProvider: data.ai_provider,
    aiModel: data.ai_model,
    autoApproveThresholdUsd: data.auto_approve_threshold_usd,
    enabledActions: data.enabled_actions ?? [],
  }
}

export async function upsertAgentConfig(
  userId: string,
  config: Omit<AgentConfig, 'id'>
): Promise<void> {
  const { error } = await supabase
    .from('agent_configs')
    .upsert({
      user_id:                    userId,
      agent_name:                 config.agentName,
      personality:                config.personality,
      ai_provider:                config.aiProvider,
      ai_model:                   config.aiModel,
      auto_approve_threshold_usd: config.autoApproveThresholdUsd,
      enabled_actions:            config.enabledActions,
      updated_at:                 new Date().toISOString(),
    }, { onConflict: 'user_id' })

  if (error) throw error
}
