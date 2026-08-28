"use client"

import { useMemo, useState } from "react"

import type { Project } from "@/components/editor/project-types"

export type ProjectDialog = "create" | "rename" | "delete" | null

const initialProjects: Project[] = [
  {
    id: "checkout-platform",
    name: "Checkout Platform",
    slug: "checkout-platform",
    access: "owned",
  },
  {
    id: "observability-refresh",
    name: "Observability Refresh",
    slug: "observability-refresh",
    access: "owned",
  },
  {
    id: "team-knowledge-graph",
    name: "Team Knowledge Graph",
    slug: "team-knowledge-graph",
    access: "shared",
  },
]

function createSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project"
  )
}

export function useProjectDialogs() {
  const [projects, setProjects] = useState(initialProjects)
  const [dialog, setDialog] = useState<ProjectDialog>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const slugPreview = useMemo(() => createSlug(projectName), [projectName])

  function openCreateDialog() {
    setSelectedProject(null)
    setProjectName("")
    setDialog("create")
  }

  function openRenameDialog(project: Project) {
    setSelectedProject(project)
    setProjectName(project.name)
    setDialog("rename")
  }

  function openDeleteDialog(project: Project) {
    setSelectedProject(project)
    setDialog("delete")
  }

  function closeDialog() {
    if (!isLoading) {
      setDialog(null)
    }
  }

  async function createProject() {
    if (!projectName.trim()) return

    setIsLoading(true)
    await Promise.resolve()
    const project: Project = {
      id: `${slugPreview}-${Date.now()}`,
      name: projectName.trim(),
      slug: slugPreview,
      access: "owned",
    }
    setProjects((current) => [project, ...current])
    setIsLoading(false)
    setDialog(null)
  }

  async function renameProject() {
    if (!selectedProject || !projectName.trim()) return

    setIsLoading(true)
    await Promise.resolve()
    setProjects((current) =>
      current.map((project) =>
        project.id === selectedProject.id
          ? { ...project, name: projectName.trim(), slug: slugPreview }
          : project,
      ),
    )
    setIsLoading(false)
    setDialog(null)
  }

  async function deleteProject() {
    if (!selectedProject) return

    setIsLoading(true)
    await Promise.resolve()
    setProjects((current) =>
      current.filter((project) => project.id !== selectedProject.id),
    )
    setIsLoading(false)
    setDialog(null)
  }

  return {
    createProject,
    deleteProject,
    dialog,
    closeDialog,
    isLoading,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    projectName,
    projects,
    renameProject,
    selectedProject,
    setProjectName,
    slugPreview,
  }
}