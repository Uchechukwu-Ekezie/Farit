export interface CoreMessage {
  role: 'user' | 'assistant' | 'system'
  content: string | unknown[]
}

export interface ToolDefinition {
  name: string
  description: string
  input_schema: {
    type: string
    properties: Record<string, unknown>
    required?: string[]
  }
}

export interface AIResponse {
  stop_reason: 'end_turn' | 'tool_use' | 'max_tokens'
  content: Array<{
    type: 'text' | 'tool_use'
    text?: string
    id?: string
    name?: string
    input?: Record<string, unknown>
  }>
}

export interface AIProvider {
  name: string
  chatWithTools(
    messages: CoreMessage[],
    systemPrompt: string,
    tools: ToolDefinition[]
  ): Promise<AIResponse>
}
