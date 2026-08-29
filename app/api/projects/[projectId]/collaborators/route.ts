import { currentUser } from "@clerk/nextjs/server"
import { createClerkClient } from "@clerk/backend"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { collaborators: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Enrich collaborators with Clerk user data
    const enrichedCollaborators = await Promise.all(
      project.collaborators.map(async (collab) => {
        try {
          const clerkUsers = await clerk.users.getUserList({
            emailAddress: [collab.collaboratorEmail],
          })
          const clerkUser = clerkUsers.data?.[0]

          return {
            id: collab.id,
            email: collab.collaboratorEmail,
            displayName: clerkUser?.firstName
              ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`
              : undefined,
            avatarUrl: clerkUser?.imageUrl,
          }
        } catch {
          // Fall back to email only if Clerk lookup fails
          return {
            id: collab.id,
            email: collab.collaboratorEmail,
          }
        }
      })
    )

    return NextResponse.json(enrichedCollaborators)
  } catch (error) {
    console.error("Error fetching collaborators:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params
  const user = await currentUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Enforce ownership
    if (project.ownerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = (await request.json()) as { email: string }
    const { email } = body

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 })
    }

    // Check if collaborator already exists
    const existing = await prisma.projectCollaborator.findUnique({
      where: {
        projectId_collaboratorEmail: {
          projectId,
          collaboratorEmail: email.toLowerCase(),
        },
      },
    })

    if (existing) {
      return NextResponse.json({ error: "Collaborator already invited" }, { status: 400 })
    }

    // Create collaborator record
    const collaborator = await prisma.projectCollaborator.create({
      data: {
        projectId,
        collaboratorEmail: email.toLowerCase(),
      },
    })

    // Enrich with Clerk data
    let enrichedData: Record<string, unknown> = {
      id: collaborator.id,
      email: collaborator.collaboratorEmail,
    }

    try {
      const clerkUsers = await clerk.users.getUserList({
        emailAddress: [email],
      })
      const clerkUser = clerkUsers.data?.[0]
      if (clerkUser) {
        enrichedData.displayName = clerkUser.firstName
          ? `${clerkUser.firstName}${clerkUser.lastName ? ` ${clerkUser.lastName}` : ""}`
          : undefined
        enrichedData.avatarUrl = clerkUser.imageUrl
      }
    } catch {
      // Fall back to email only
    }

    return NextResponse.json(enrichedData)
  } catch (error) {
    console.error("Error inviting collaborator:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
