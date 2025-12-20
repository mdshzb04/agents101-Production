import type { AIMessage } from '../types'
import { addMessages, getMessages, saveToolResponse } from './memory'
import { runApprovalCheck, runLLM } from './llm'
import { showLoader, logMessage } from './ui'
import { runTool } from './toolRunner'
import { generateImageToolDefinition } from './tools/generateImage'

/**
 * Narrow AIMessage → assistant with tool_calls
 */
const getFirstToolCall = (message?: AIMessage) => {
  if (
    message?.role === 'assistant' &&
    Array.isArray(message.tool_calls) &&
    message.tool_calls.length > 0
  ) {
    return message.tool_calls[0]
  }
  return null
}

const handleImageApprovalFlow = async (
  history: AIMessage[],
  userMessage: string
) => {
  const lastMessage = history[history.length - 1]
  const toolCall = getFirstToolCall(lastMessage)

  if (
    !toolCall ||
    toolCall.function.name !== generateImageToolDefinition.name
  ) {
    return false
  }

  const loader = showLoader('Processing approval...')
  const approved = await runApprovalCheck(userMessage)

  if (approved) {
    loader.update(`executing tool: ${toolCall.function.name}`)
    const toolResponse = await runTool(toolCall, userMessage)
    await saveToolResponse(toolCall.id, toolResponse)
  } else {
    await saveToolResponse(
      toolCall.id,
      'User did not approve image generation at this time.'
    )
  }

  loader.stop()
  return true
}

export const runAgent = async ({
  userMessage,
  tools,
}: {
  userMessage: string
  tools: any[]
}) => {
  const history = await getMessages()
  const isImageApproval = await handleImageApprovalFlow(history, userMessage)

  if (!isImageApproval) {
    await addMessages([{ role: 'user', content: userMessage }])
  }

  const loader = showLoader('🤔')

  while (true) {
    const history = await getMessages()
    const response = await runLLM({ messages: history, tools })

    await addMessages([response])

    if (response.content) {
      loader.stop()
      logMessage(response)
      return getMessages()
    }

    const toolCall = getFirstToolCall(response)

    if (toolCall) {
      logMessage(response)

      if (toolCall.function.name === generateImageToolDefinition.name) {
        loader.update('need user approval')
        loader.stop()
        return getMessages()
      }

      loader.update(`executing: ${toolCall.function.name}`)
      const toolResponse = await runTool(toolCall, userMessage)
      await saveToolResponse(toolCall.id, toolResponse)
      loader.update(`done: ${toolCall.function.name}`)
    }
  }
}

export const runAgentEval = async ({
  userMessage,
  tools,
}: {
  userMessage: string
  tools: any[]
}) => {
  let messages: AIMessage[] = [{ role: 'user', content: userMessage }]

  while (true) {
    const response = await runLLM({ messages, tools })
    messages = [...messages, response]

    if (response.content) {
      return messages
    }

    const toolCall = getFirstToolCall(response)

    if (toolCall) {
      if (toolCall.function.name === generateImageToolDefinition.name) {
        return messages
      }

      const toolResponse = await runTool(toolCall, userMessage)
      messages = [
        ...messages,
        { role: 'tool', content: toolResponse, tool_call_id: toolCall.id },
      ]
    }
  }
}
