import { GoogleGenerativeAI, FunctionCallingMode } from 'npm:@google/generative-ai@0.21.0'
import type { AIProvider, AIResponse, CoreMessage, ToolDefinition } from './types.ts'

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
      tools: [{ functionDeclarations: tools.map((t) => ({ name: t.name, description: t.description, parameters: t.input_schema as Record<string, unknown> })) }],
      toolConfig: { functionCallingConfig: { mode: FunctionCallingMode.AUTO } },
    })

    const history = messages.slice(0, -1).map((m) => ({
      role:  m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: typeof m.content === 'string' ? m.content : JSON.stringify(m.content) }],
    }))
    const last     = messages[messages.length - 1]
    const lastText = typeof last.content === 'string' ? last.content : JSON.stringify(last.content)
    const chat     = geminiModel.startChat({ history })
    const result   = await chat.sendMessage(lastText)

    const content: AIResponse['content'] = []
    let stopReason: AIResponse['stop_reason'] = 'end_turn'

    for (const part of result.response.candidates?.[0]?.content?.parts ?? []) {
      if (part.text) content.push({ type: 'text', text: part.text })
      if (part.functionCall) {
        stopReason = 'tool_use'
        content.push({ type: 'tool_use', id: `gemini_${Date.now()}`, name: part.functionCall.name, input: part.functionCall.args as Record<string, unknown> })
      }
    }
    return { stop_reason: stopReason, content }
  }
}
