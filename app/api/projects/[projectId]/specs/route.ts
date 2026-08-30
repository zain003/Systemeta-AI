import { auth } from "@clerk/nextjs/server"
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentClerkIdentity, hasProjectAccess } from "@/lib/project-access"
import { specFilename } from "@/lib/project-specs"

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
  const { primaryEmail } = await getCurrentClerkIdentity()

  if (!primaryEmail || !(await hasProjectAccess(projectId, userId, primaryEmail))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const records = await prisma.projectSpec.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    specs: records.map((record) => ({
      id: record.id,
      createdAt: record.createdAt.toISOString(),
      filename: specFilename(record.createdAt),
    })),
  })
}
