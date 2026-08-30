import { auth } from "@clerk/nextjs/server"
import { put } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentClerkIdentity, hasProjectAccess } from "@/lib/project-access"

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth()

  if (!userId) {
    return unauthorizedResponse()
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const { primaryEmail } = await getCurrentClerkIdentity()

  if (!primaryEmail || !(await hasProjectAccess(projectId, userId, primaryEmail))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  if (!project.canvasJsonPath) {
    return NextResponse.json({ nodes: [], edges: [] })
  }

  try {
    const response = await fetch(project.canvasJsonPath, {
      headers: process.env.BLOB_READ_WRITE_TOKEN
        ? {
            Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          }
        : undefined,
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Canvas snapshot not found" }, { status: 404 })
    }

    const payload = (await response.json()) as { nodes?: unknown[]; edges?: unknown[] }

    return NextResponse.json({
      nodes: Array.isArray(payload.nodes) ? payload.nodes : [],
      edges: Array.isArray(payload.edges) ? payload.edges : [],
    })
  } catch {
    return NextResponse.json({ error: "Failed to load canvas snapshot" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const { userId } = await auth()

  if (!userId) {
    return unauthorizedResponse()
  }

  const { projectId } = await params

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { collaborators: true },
  })

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  const { primaryEmail } = await getCurrentClerkIdentity()

  if (!primaryEmail || !(await hasProjectAccess(projectId, userId, primaryEmail))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN

  if (!blobToken) {
    return NextResponse.json({ error: "Blob storage is not configured for this environment" }, { status: 501 })
  }

  try {
    const blob = await put(`canvas/${projectId}.json`, JSON.stringify(payload ?? { nodes: [], edges: [] }), {
      access: "private",
      allowOverwrite: true,
      contentType: "application/json",
      token: blobToken,
    })

    const updatedProject = await prisma.project.update({
      where: { id: projectId },
      data: { canvasJsonPath: blob.url },
    })

    return NextResponse.json({
      ok: true,
      url: blob.url,
      project: updatedProject,
    })
  } catch (error) {
    console.error("Canvas save failed", error)
    return NextResponse.json({ error: "Failed to save canvas snapshot" }, { status: 500 })
  }
}
