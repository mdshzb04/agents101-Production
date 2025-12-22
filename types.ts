import OpenAI from 'openai'

export type AIMessage =
  | OpenAI.Chat.Completions.ChatCompletionAssistantMessageParam
  | { role: 'user'; content: string }
  | { role: 'tool'; content: string; tool_call_id: string }

export interface ToolFn<A = unknown, T = unknown> {
  (input: { userMessage: string; toolArgs: A }): Promise<T>
}

export interface Score {
  name: string
  score: number
}

export interface Run {
  input: string
  output: {
    role: string
    content: string | null
    tool_calls?: unknown[]
    refusal: null
    annotations?: unknown[]
  }
  expected: unknown
  scores: Score[]
  createdAt: string
}

export interface ExperimentSet {
  runs: Run[]
  score: number
  createdAt: string
}

export interface Experiment {
  name: string
  sets: ExperimentSet[]
}

export interface Results {
  experiments: Experiment[]
}
