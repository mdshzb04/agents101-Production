import type { Scorer } from 'autoevals'

type ToolCall = {
  function?: {
    name?: string
  }
}

type AssistantOutput = {
  role: string
  tool_calls?: ToolCall[]
}

type ExpectedOutput = {
  tool_calls: ToolCall[]
}

export const ToolCallMatch: Scorer<AssistantOutput, unknown> = async ({
  output,
  expected,
}) => {
  const score =
    output.role === 'assistant' &&
    Array.isArray(output.tool_calls) &&
    output.tool_calls.length === 1 &&
    output.tool_calls[0].function?.name ===
      expected?.tool_calls?.[0]?.function?.name
      ? 1
      : 0

  return {
    name: 'ToolCallMatch',
    score,
  }
}
