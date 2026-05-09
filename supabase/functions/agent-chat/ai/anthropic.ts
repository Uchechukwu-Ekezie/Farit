import Anthropic from 'npm:@anthropic-ai/sdk@0.40.0'
import type { AIProvider, AIResponse, CoreMessage, ToolDefinition } from './types.ts'

export class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  private client: Anthropic

  constructor(apiKey: string) {
    this.client = new Anthropic({ apiKey })
  }

  async chatWithTools(
    messages: CoreMessage[],
    systemPrompt: string,
    tools: ToolDefinition[],
    model = 'claude-sonnet-4-20250514'
  ): Promise<AIResponse> {
    const response = await this.client.messages.create({
      model,
      max_tokens: 4096,
      system: systemPrompt,
      tools: tools.map((t) => ({
        name:         t.name,
        description:  t.description,
        input_schema: t.input_schema,
      })),
      messages: messages as Anthropic.MessageParam[],
    })

    return {
      stop_reason: response.stop_reason as AIResponse['stop_reason'],
      content: response.content.map((block) => {
        if (block.type === 'text') return { type: 'text' as const, text: block.text }
        return {
          type:  'tool_use' as const,
          id:    block.id,
          name:  block.name,
          input: block.input as Record<string, unknown>,
        }
      }),
    }
  }
}
