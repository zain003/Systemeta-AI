import { currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ projectId: string; email: string }> }
) {
  const { projectId, email } = await params
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

    // Delete collaborator
    await prisma.projectCollaborator.delete({
      where: {
        projectId_collaboratorEmail: {
          projectId,
          collaboratorEmail: decodeURIComponent(email).toLowerCase(),
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing collaborator:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
