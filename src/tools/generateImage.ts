import type { ToolFn } from '../../types'
import { z } from 'zod'
import { openai } from '../ai'

export const generateImageToolDefinition = {
  name: 'generate_image',
  description: 'generate an image',
  parameters: z.object({
    prompt: z
      .string()
      .describe(
        "Prompt for the image. Consider the user's message when creating it."
      ),
  }),
}

type Args = z.infer<typeof generateImageToolDefinition.parameters>

export const generateImage: ToolFn<Args, string> = async ({ toolArgs }) => {
  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt: toolArgs.prompt,
    n: 1,
    size: '1024x1024',
  })

  if (!response.data || response.data.length === 0) {
    throw new Error('Failed to generate image: no data returned from OpenAI')
  }

  const imageData = response.data[0]

  
  if (typeof imageData.url !== 'string') {
    throw new Error('Failed to generate image: URL not returned from OpenAI')
  }

  return imageData.url
}
