import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function GET() {
  const { userId } = await auth()

  if (!userId) {
    return unauthorizedResponse()
  }

  const projects = await prisma.project.findMany({
    where: {
      ownerId: userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return NextResponse.json(projects)
}

export async function POST(request: NextRequest) {
  const { userId } = await auth()

  if (!userId) {
    return unauthorizedResponse()
  }

  let payload: unknown

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const record =
    typeof payload === "object" && payload !== null ? (payload as { name?: unknown }) : {}

  const name = typeof record.name === "string" ? record.name.trim() : ""

  const project = await prisma.project.create({
    data: {
      ownerId: userId,
      name: name || "Untitled Project",
    },
  })

  return NextResponse.json(project, { status: 201 })
}
