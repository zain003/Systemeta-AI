import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { tasks } from "@trigger.dev/sdk";
import type { designAgent } from "@/trigger/design-agent";
import { getCurrentClerkIdentity, hasProjectAccess } from "@/lib/project-access";

interface DesignRequest {
  prompt: string;
  roomId: string;
  projectId: string;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { primaryEmail } = await getCurrentClerkIdentity();

    if (!primaryEmail) {
      return NextResponse.json({ error: "User email not found" }, { status: 401 });
    }

    const body = (await request.json()) as DesignRequest;
    const { prompt, roomId, projectId } = body;

    if (!prompt || !roomId || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields: prompt, roomId, projectId" },
        { status: 400 }
      );
    }

    // Verify project access for owner or collaborator
    const hasAccess = await hasProjectAccess(projectId, userId, primaryEmail);

    if (!hasAccess) {
      return NextResponse.json(
        { error: "Project not found or access denied" },
        { status: 403 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    // Trigger the design task with the full room/project context needed for
    // a collaborative canvas mutation in the background worker.
    const handle = await tasks.trigger<typeof designAgent>("design-agent", {
      prompt,
      roomId,
      projectId,
      userId,
    });

    // Create TaskRun record
    const taskRun = await prisma.taskRun.create({
      data: {
        runId: handle.id,
        projectId,
        userId,
      },
    });

    return NextResponse.json({ runId: taskRun.runId });
  } catch (error) {
    console.error("Error triggering design task:", error);
    return NextResponse.json(
      { error: "Failed to trigger design task" },
      { status: 500 }
    );
  }
}
