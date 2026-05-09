import { supabase } from './client'
import type { ChatMessage } from '@/store/agentStore'

export async function saveMessage(
  userId: string,
  message: Omit<ChatMessage, 'id' | 'createdAt'>
): Promise<void> {
  const { error } = await supabase.from('agent_messages').insert({
    user_id:       userId,
    role:          message.role,
    content:       message.content,
    action_type:   message.actionType ?? null,
    action_data:   message.actionData ?? null,
    action_status: message.actionStatus ?? null,
    tx_signature:  message.txSignature ?? null,
  })

  if (error) throw error
}

export async function fetchMessages(userId: string, limit = 50): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('agent_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit)

  if (error || !data) return []

  return data.map((row) => ({
    id:            row.id,
    role:          row.role,
    content:       row.content,
    actionType:    row.action_type,
    actionData:    row.action_data,
    actionStatus:  row.action_status,
    txSignature:   row.tx_signature,
    createdAt:     new Date(row.created_at),
  }))
}
