import { redirect } from "next/navigation"

import { AccessDenied } from "@/components/editor/access-denied"
import { WorkspaceShell } from "@/components/editor/workspace-shell"
import type { Project } from "@/components/editor/project-types"
import { prisma } from "@/lib/prisma"
import { getAccessibleProjects, getCurrentClerkIdentity, hasProjectAccess } from "@/lib/project-access"

function toSidebarProject(project: { id: string; name: string; ownerId: string }, currentUserId: string): Project {
  return {
    id: project.id,
    name: project.name,
    slug: project.name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project",
    access: project.ownerId === currentUserId ? "owned" : "shared",
  }
}

export default async function EditorWorkspacePage({
  params,
}: {
  params: Promise<{ roomId: string }>
}) {
  const { roomId } = await params
  const { userId, primaryEmail } = await getCurrentClerkIdentity()

  if (!userId || !primaryEmail) {
    redirect("/sign-in")
  }

  const project = await prisma.project.findUnique({
    where: {
      id: roomId,
    },
    include: {
      collaborators: true,
    },
  })

  if (!project) {
    return <AccessDenied />
  }

  const canAccessProject = await hasProjectAccess(project.id, userId, primaryEmail)

  if (!canAccessProject) {
    return <AccessDenied />
  }

  const accessibleProjects = await getAccessibleProjects(userId, primaryEmail)
  const sidebarProjects = accessibleProjects.map((item) => toSidebarProject(item, userId))

  return <WorkspaceShell project={project} projects={sidebarProjects} />
}
