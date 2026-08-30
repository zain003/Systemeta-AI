import { Liveblocks } from "@liveblocks/node"
import { google } from "@ai-sdk/google"
import { generateText } from "ai"
import { z } from "zod"
import { AbortTaskRunError, task } from "@trigger.dev/sdk"
import { put } from "@vercel/blob"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "node:crypto"

const LIVEBLOCKS_SECRET_KEY = process.env.LIVEBLOCKS_SECRET_KEY
const AI_STATUS_FEED_ID = "ai-status-feed"

const chatMessageSchema = z.object({
  sender: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number(),
})

const nodeSchema = z.object({
  id: z.string(),
  type: z.string().optional(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  data: z.record(z.string(), z.unknown()).optional(),
})

const edgeSchema = z.object({
  id: z.string(),
  source: z.string().optional(),
  target: z.string().optional(),
  animated: z.boolean().optional(),
  label: z.string().optional(),
})

export const generateSpecPayloadSchema = z.object({
  projectId: z.string(),
  roomId: z.string(),
  chatHistory: z.array(chatMessageSchema),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
  userId: z.string(),
})

export interface GenerateSpecPayload {
  projectId: string
  roomId: string
  chatHistory: Array<{
    sender: string
    role: "user" | "assistant"
    content: string
    timestamp: number
  }>
  nodes: Array<Record<string, unknown>>
  edges: Array<Record<string, unknown>>
  userId: string
}

export type GenerateSpecPayload_Type = z.infer<typeof generateSpecPayloadSchema>

const liveblocks = LIVEBLOCKS_SECRET_KEY
  ? new Liveblocks({ secret: LIVEBLOCKS_SECRET_KEY })
  : null

async function setAiPresence(
  roomId: string,
  thinking: boolean,
  cursor: { x: number; y: number } | null = null
) {
  if (!liveblocks) {
    return
  }

  await liveblocks.setPresence(roomId, {
    userId: "ai-architect",
    data: {
      cursor,
      thinking,
    },
    userInfo: {
      name: "AI Architect",
      avatar: "",
      color: "#6457f9",
    },
    ttl: 180,
  })
}

async function publishStatus(roomId: string, text: string) {
  if (!liveblocks || !text.trim()) {
    return
  }

  const feedResult = await liveblocks
    .getFeeds({ roomId })
    .catch(() => ({ data: [] as Array<{ id?: string }> }))

  const hasFeed = feedResult.data.some(
    (feed) =>
      typeof feed === "object" &&
      feed &&
      "id" in feed &&
      feed.id === AI_STATUS_FEED_ID
  )

  if (!hasFeed) {
    await liveblocks
      .createFeed({
        roomId,
        feedId: AI_STATUS_FEED_ID,
      })
      .catch(() => undefined)
  }

  const message = { text: text.trim().slice(0, 240) }

  await liveblocks
    .createFeedMessage({
      roomId,
      feedId: AI_STATUS_FEED_ID,
      data: message,
    })
    .catch(() => undefined)
}

function formatCanvasContext(
  nodes: Array<Record<string, unknown>>,
  edges: Array<Record<string, unknown>>
): string {
  const nodeDescriptions = nodes
    .map((node) => {
      const nodeData = node.data as Record<string, unknown> | undefined
      const label = nodeData?.label ?? node.id ?? "Untitled"
      return `- ${label} (id: ${node.id})`
    })
    .join("\n")

  const edgeDescriptions = edges
    .map((edge) => {
      const label = edge.label || ""
      const labelPart = label ? ` [${label}]` : ""
      return `- ${edge.source} → ${edge.target}${labelPart}`
    })
    .join("\n")

  return `Current Canvas State:

Nodes:
${nodeDescriptions || "(empty)"}

Connections:
${edgeDescriptions || "(no connections)"}`
}

function formatChatHistory(
  chatHistory: Array<{
    sender: string
    role: string
    content: string
    timestamp: number
  }>
): string {
  if (chatHistory.length === 0) {
    return "(no chat history)"
  }

  return chatHistory
    .map((msg) => `${msg.sender}: ${msg.content}`)
    .join("\n\n")
}

export const generateSpec = task({
  id: "generate-spec",
  run: async (payload: GenerateSpecPayload) => {
    const { roomId, chatHistory, nodes, edges, projectId, userId } = payload

    if (!roomId || !projectId) {
      throw new Error("Spec generation requires roomId and projectId")
    }

    console.log("Spec generation task started", {
      roomId,
      projectId,
      userId,
      nodeCount: nodes.length,
      edgeCount: edges.length,
      chatMessageCount: chatHistory.length,
    })

    await setAiPresence(roomId, true, { x: 0, y: 0 })
    await publishStatus(roomId, "Analyzing canvas and generating technical specification…")

    try {
      const model = google("gemini-2.5-flash")

      const canvasContext = formatCanvasContext(nodes, edges)
      const chatContext = formatChatHistory(chatHistory)

      const specPrompt = `You are a technical documentation expert. Based on the design canvas and team discussion, generate a comprehensive technical specification in Markdown format.

${canvasContext}

Team Discussion:
${chatContext}

Generate a professional technical specification that includes:
1. System Overview - Brief summary of the architecture
2. Components - Detailed description of each node on the canvas
3. Interactions - How components connect and communicate
4. Data Flow - Description of data movement through the system
5. Key Features - Main capabilities and characteristics
6. Future Considerations - Scalability and extension points

Format as clean, well-structured Markdown. Use headers, bullet points, and code blocks where appropriate. Be concise but comprehensive.`

      const result = await generateText({
        model,
        system:
          "You are a technical documentation expert. Generate clear, professional technical specifications in Markdown format.",
        prompt: specPrompt,
        temperature: 0.7,
      })

      const spec = result.text

      if (!spec || spec.trim().length === 0) {
        throw new Error("Failed to generate specification")
      }

      const blobToken = process.env.BLOB_READ_WRITE_TOKEN

      if (!blobToken) {
        throw new AbortTaskRunError("Blob storage is not configured for this environment")
      }

      const specId = randomUUID()
      const pathname = `specs/${projectId}/${specId}.md`
      const blob = await put(pathname, spec, {
        access: "private",
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: "text/markdown; charset=utf-8",
        token: blobToken,
      })

      const projectSpec = await prisma.projectSpec.create({
        data: {
          id: specId,
          projectId,
          filePath: blob.url,
        },
      })

      await publishStatus(roomId, "Technical specification generated successfully.")
      await setAiPresence(roomId, false, null)

      return {
        success: true,
        message: "Spec generation completed",
        roomId,
        projectId,
        specId: projectSpec.id,
        contentLength: spec.length,
      }
    } catch (error) {
      if (error instanceof AbortTaskRunError) {
        throw error
      }

      const message =
        error instanceof Error ? error.message : "Unknown spec generation error"
      console.error("Spec generation failed", error)

      await publishStatus(
        roomId,
        "Specification generation failed. Please try again."
      )
      await setAiPresence(roomId, false, null)

      return {
        success: false,
        message,
        roomId,
        projectId,
      }
    }
  },
})
