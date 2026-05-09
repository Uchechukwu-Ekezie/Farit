import { AnthropicProvider } from './ai/anthropic.ts'
import { OpenAIProvider }    from './ai/openai.ts'
import { GeminiProvider }    from './ai/gemini.ts'
import { TOOLS }             from './tools/index.ts'
import { executeTool }       from './tools/router.ts'
import type { AIProvider }   from './ai/types.ts'

interface AgentConfig {
  ai_provider: string
  ai_model:    string
}

export interface AgentLoopResult {
  type:              'reply' | 'approval_required'
  text?:             string
  summary?:          string
  estimated_usd?:    number
  action?:           Record<string, unknown>
  pending_messages?: unknown[]
}

function getProvider(config: AgentConfig): AIProvider {
  const key = (n: string) => Deno.env.get(n) ?? ''
  switch (config.ai_provider) {
    case 'openai':  return new OpenAIProvider(key('OPENAI_API_KEY'))
    case 'gemini':  return new GeminiProvider(key('GEMINI_API_KEY'))
    default:        return new AnthropicProvider(key('ANTHROPIC_API_KEY'))
  }
}

export async function runAgentLoop(
  messages:      unknown[],
  systemPrompt:  string,
  walletAddress: string,
  config:        AgentConfig
): Promise<AgentLoopResult> {
  const provider   = getProvider(config)
  const msgHistory = [...messages] as Parameters<typeof provider.chatWithTools>[0]
  const MAX_ITERS  = 10
  let   iterations = 0

  while (iterations < MAX_ITERS) {
    iterations++

    const response = await provider.chatWithTools(msgHistory, systemPrompt, TOOLS)

    if (response.stop_reason === 'end_turn') {
      const text = response.content.find((b) => b.type === 'text')?.text ?? ''
      return { type: 'reply', text }
    }

    if (response.stop_reason === 'tool_use') {
      const toolCall = response.content.find((b) => b.type === 'tool_use')
      if (!toolCall?.name) continue

      const result = await executeTool(toolCall.name, toolCall.input ?? {}, walletAddress)

      if ((result as Record<string, unknown>).__requires_approval) {
        const a = result as Record<string, unknown>
        return {
          type:              'approval_required',
          summary:           a.summary       as string,
          estimated_usd:     a.estimated_usd as number,
          action:            a.action        as Record<string, unknown>,
          pending_messages:  [...msgHistory, { role: 'assistant', content: response.content }],
        }
      }

      msgHistory.push({ role: 'assistant', content: response.content })
      msgHistory.push({
        role: 'user',
        content: [{ type: 'tool_result', tool_use_id: toolCall.id, content: JSON.stringify(result) }],
      })
    }
  }

  return { type: 'reply', text: 'Reached maximum steps. Please try again.' }
}
