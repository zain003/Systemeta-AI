import { z } from "zod"

export const aiStatusMessageSchema = z
  .object({
    text: z.string().min(1).max(240).optional(),
  })
  .passthrough()

export const aiChatMessageSchema = z
  .object({
    sender: z.string().min(1).max(80),
    role: z.enum(["user", "assistant"]),
    content: z.string().min(1).max(2000),
    timestamp: z.number().int().nonnegative(),
  })
  .passthrough()

export type AiStatusMessage = z.infer<typeof aiStatusMessageSchema>
export type AiChatMessage = z.infer<typeof aiChatMessageSchema>

export function isValidAiStatusMessage(value: unknown): value is AiStatusMessage {
  return aiStatusMessageSchema.safeParse(value).success
}

export function isValidAiChatMessage(value: unknown): value is AiChatMessage {
  return aiChatMessageSchema.safeParse(value).success
}
