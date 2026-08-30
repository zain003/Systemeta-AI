import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { tasks } from "@trigger.dev/sdk"
import type { generateSpec } from "@/trigger/generate-spec"
import { getCurrentClerkIdentity, hasProjectAccess } from "@/lib/project-access"
import { z } from "zod"

const specRequestSchema = z.object({
  roomId: z.string().min(1),
  chatHistory: z.array(
    z.object({
      sender: z.string(),
      role: z.enum(["user", "assistant"]),
      content: z.string(),
      timestamp: z.number(),
    })
  ),
  nodes: z.array(z.record(z.string(), z.unknown())),
  edges: z.array(z.record(z.string(), z.unknown())),
})

interface SpecRequest {
  roomId: string
  chatHistory: Array<{
    sender: string
    role: "user" | "assistant"
    content: string
    timestamp: number
  }>
  nodes: Array<Record<string, unknown>>
  edges: Array<Record<string, unknown>>
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { primaryEmail } = await getCurrentClerkIdentity()

    if (!primaryEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 401 })
    }

    const body = (await request.json()) as SpecRequest

    // Validate input
    const validationResult = specRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const { roomId, chatHistory, nodes, edges } = validationResult.data

    // Treat roomId as projectId and verify user access using helper
    const hasAccess = await hasProjectAccess(roomId, userId, primaryEmail)

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: roomId },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    // Trigger the spec generation task
    const handle = await tasks.trigger<typeof generateSpec>(
      "generate-spec",
      {
        projectId: roomId,
        roomId,
        chatHistory,
        nodes,
        edges,
        userId,
      }
    )

    // Create TaskRun record for ownership/access control
    const taskRun = await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId: roomId,
        userId,
      },
    })

    return NextResponse.json({ runId: taskRun.runId })
  } catch (error) {
    console.error("Error triggering spec generation task:", error)
    return NextResponse.json(
      { error: "Failed to trigger spec generation" },
      { status: 500 }
    )
  }
}
