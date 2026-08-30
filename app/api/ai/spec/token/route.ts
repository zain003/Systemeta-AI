import { NextRequest, NextResponse } from "next/server"
import { auth as clerkAuth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@trigger.dev/sdk"

interface TokenRequest {
  runId: string
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await clerkAuth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = (await request.json()) as TokenRequest
    const { runId } = body

    if (!runId) {
      return NextResponse.json(
        { error: "Missing required field: runId" },
        { status: 400 }
      )
    }

    // Verify ownership using TaskRun record
    const taskRun = await prisma.taskRun.findUnique({
      where: { runId },
    })

    if (!taskRun) {
      return NextResponse.json(
        { error: "Task run not found" },
        { status: 404 }
      )
    }

    if (taskRun.userId !== userId) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      )
    }

    // Generate a Trigger.dev public token scoped to this run with 1 hour expiration
    const token = await auth.createPublicToken({
      scopes: { read: { runs: [runId] } },
      expirationTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    })

    return NextResponse.json({ token })
  } catch (error) {
    console.error("Error creating token:", error)
    return NextResponse.json(
      { error: "Failed to create token" },
      { status: 500 }
    )
  }
}
