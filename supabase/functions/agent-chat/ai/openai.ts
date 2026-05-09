import OpenAI from 'npm:openai@4.86.1'
import type { AIProvider, AIResponse, CoreMessage, ToolDefinition } from './types.ts'

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
    const oaiMessages: OpenAI.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...(messages as OpenAI.ChatCompletionMessageParam[]),
    ]
    const oaiTools: OpenAI.ChatCompletionTool[] = tools.map((t) => ({
      type: 'function',
      function: { name: t.name, description: t.description, parameters: t.input_schema },
    }))

    const res = await this.client.chat.completions.create({ model, messages: oaiMessages, tools: oaiTools })
    const msg = res.choices[0].message
    const content: AIResponse['content'] = []

    if (msg.content) content.push({ type: 'text', text: msg.content })
    for (const tc of msg.tool_calls ?? []) {
      content.push({ type: 'tool_use', id: tc.id, name: tc.function.name, input: JSON.parse(tc.function.arguments) })
    }

    return { stop_reason: msg.tool_calls?.length ? 'tool_use' : 'end_turn', content }
  }
}
