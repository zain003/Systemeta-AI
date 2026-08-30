import { auth } from "@clerk/nextjs/server"
import { get } from "@vercel/blob"
import { NextRequest, NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { getCurrentClerkIdentity, hasProjectAccess } from "@/lib/project-access"
import { specFilename } from "@/lib/project-specs"

function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ projectId: string; specId: string }> },
) {
  const { userId } = await auth()

  if (!userId) {
    return unauthorizedResponse()
  }

  const { projectId, specId } = await params
  const { primaryEmail } = await getCurrentClerkIdentity()

  if (!primaryEmail || !(await hasProjectAccess(projectId, userId, primaryEmail))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const projectSpec = await prisma.projectSpec.findFirst({
    where: {
      id: specId,
      projectId,
    },
  })

  if (!projectSpec) {
    return NextResponse.json({ error: "Specification not found" }, { status: 404 })
  }

  const blobToken = process.env.BLOB_READ_WRITE_TOKEN

  if (!blobToken) {
    return NextResponse.json(
      { error: "Blob storage is not configured for this environment" },
      { status: 501 },
    )
  }

  try {
    const blobResult = await get(projectSpec.filePath, {
      access: "private",
      token: blobToken,
    })

    if (!blobResult || blobResult.statusCode !== 200) {
      return NextResponse.json({ error: "Specification file not found" }, { status: 404 })
    }

    const content = await new Response(blobResult.stream).text()
    const filename = specFilename(projectSpec.createdAt)

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error("Error downloading spec:", error)
    return NextResponse.json({ error: "Failed to download specification" }, { status: 500 })
  }
}
