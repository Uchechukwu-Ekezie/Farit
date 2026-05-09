// Runs inside Supabase Edge Function (Deno) — not bundled into the mobile app
import { GoogleGenerativeAI, FunctionCallingMode } from '@google/generative-ai'
import type { AIProvider, AIResponse, CoreMessage, ToolDefinition } from './index.ts'

export class GeminiProvider implements AIProvider {
  name = 'gemini'
  private genAI: GoogleGenerativeAI

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
  }

  async chatWithTools(
    messages: CoreMessage[],
    systemPrompt: string,
    tools: ToolDefinition[],
    model = 'gemini-2.0-flash'
  ): Promise<AIResponse> {
    const geminiModel = this.genAI.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
      tools: [{
        functionDeclarations: tools.map((t) => ({
          name:        t.name,
          description: t.description,
          parameters:  t.input_schema as Record<string, unknown>,
        })),
      }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
    })

    const history = messages.slice(0, -1).map((m) => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
    }))

    const lastMessage = messages[messages.length - 1]
    const chat = geminiModel.startChat({ history })
    const lastText = typeof lastMessage.content === 'string'
      ? lastMessage.content
      : JSON.stringify(lastMessage.content)

    const result = await chat.sendMessage(lastText)
    const response = result.response
    const content: AIResponse['content'] = []
    let stopReason: AIResponse['stop_reason'] = 'end_turn'

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.text) {
        content.push({ type: 'text', text: part.text })
      }
      if (part.functionCall) {
        stopReason = 'tool_use'
        content.push({
          type:  'tool_use',
          id:    `gemini_${Date.now()}`,
          name:  part.functionCall.name,
          input: part.functionCall.args as Record<string, unknown>,
        })
      }
    }

    return { stop_reason: stopReason, content }
  }
}
