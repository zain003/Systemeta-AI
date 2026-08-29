import { getCurrentClerkIdentity, getAccessibleProjects } from "@/lib/project-access"
import { redirect } from "next/navigation"

import type { Project } from "@/components/editor/project-types"
import { EditorPageContent } from "./editor-content"

export default async function EditorPage() {
  const { userId, primaryEmail } = await getCurrentClerkIdentity()

  if (!userId || !primaryEmail) {
    redirect("/sign-in")
  }

  const projects = await getAccessibleProjects(userId, primaryEmail)
  const normalizedProjects: Project[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    slug: project.id,
    access: project.ownerId === userId ? "owned" : "shared",
  }))

  return <EditorPageContent initialProjects={normalizedProjects} />
}
