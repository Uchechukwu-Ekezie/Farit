// Runs inside Supabase Edge Function (Deno) — not bundled into the mobile app
import OpenAI from 'openai'
import type { AIProvider, AIResponse, CoreMessage, ToolDefinition } from './index.ts'

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private client: OpenAI

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey })
  }

  async chatWithTools(
    messages: CoreMessage[],
    systemPrompt: string,
    tools: ToolDefinition[],
    model = 'gpt-4o'
  ): Promise<AIResponse> {
    const openAIMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(messages as OpenAI.ChatCompletionMessageParam[]),
    ]

    const openAITools: OpenAI.ChatCompletionTool[] = tools.map((t) => ({
      type: 'function',
      function: {
        name:        t.name,
        description: t.description,
        parameters:  t.input_schema,
      },
    }))

    const response = await this.client.chat.completions.create({
      model,
      messages: openAIMessages,
      tools:    openAITools,
    })

    const choice = response.choices[0]
    const msg    = choice.message
    const content: AIResponse['content'] = []

    if (msg.content) {
      content.push({ type: 'text', text: msg.content })
    }

    if (msg.tool_calls?.length) {
      for (const tc of msg.tool_calls) {
        content.push({
          type:  'tool_use',
          id:    tc.id,
          name:  tc.function.name,
          input: JSON.parse(tc.function.arguments),
        })
      }
    }

    const stopReason = msg.tool_calls?.length ? 'tool_use' : 'end_turn'

    return { stop_reason: stopReason, content }
  }
}
