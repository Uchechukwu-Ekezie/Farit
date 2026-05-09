import { create } from 'zustand'

export type AgentPersonality = 'professional' | 'friendly' | 'degen'
export type AIProvider = 'anthropic' | 'openai' | 'gemini'
export type ActionStatus = 'pending' | 'approved' | 'rejected' | 'executed'

export interface AgentConfig {
  id?: string
  agentName: string
  personality: AgentPersonality
  aiProvider: AIProvider
  aiModel: string
  autoApproveThresholdUsd: number
  enabledActions: string[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  actionType?: string
  actionData?: Record<string, unknown>
  actionStatus?: ActionStatus
  txSignature?: string
  createdAt: Date
}

export interface PendingApproval {
  summary: string
  estimatedUsd: number
  action: Record<string, unknown>
  pendingMessages: unknown[]
}

interface AgentState {
  config: AgentConfig | null
  messages: ChatMessage[]
  isThinking: boolean
  pendingApproval: PendingApproval | null
  setConfig: (config: AgentConfig) => void
  addMessage: (message: ChatMessage) => void
  setMessages: (messages: ChatMessage[]) => void
  setThinking: (thinking: boolean) => void
  setPendingApproval: (approval: PendingApproval | null) => void
  clearMessages: () => void
}

const DEFAULT_CONFIG: AgentConfig = {
  agentName: 'SAGE',
  personality: 'professional',
  aiProvider: 'anthropic',
  aiModel: 'claude-sonnet-4-20250514',
  autoApproveThresholdUsd: 10,
  enabledActions: ['send', 'swap', 'stake'],
}

export const useAgentStore = create<AgentState>((set) => ({
  config: null,
  messages: [],
  isThinking: false,
  pendingApproval: null,
  setConfig: (config) => set({ config }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  setMessages: (messages) => set({ messages }),
  setThinking: (isThinking) => set({ isThinking }),
  setPendingApproval: (pendingApproval) => set({ pendingApproval }),
  clearMessages: () => set({ messages: [] }),
}))

export { DEFAULT_CONFIG }
