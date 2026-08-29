"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"

import type { Project } from "@/components/editor/project-types"

export type ProjectDialog = "create" | "rename" | "delete" | null

function createSlug(name: string) {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "untitled-project"
  )
}

function normalizeProject(project: { id: string; name: string; ownerId?: string }): Project {
  return {
    id: project.id,
    name: project.name,
    slug: createSlug(project.name),
    access: "owned",
  }
}

interface UseProjectDialogsProps {
  initialProjects?: Project[]
}

export function useProjectDialogs(initialProjects: Project[] = []) {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [dialog, setDialog] = useState<ProjectDialog>(null)
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [projectName, setProjectName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const slugPreview = useMemo(() => createSlug(projectName), [projectName])

  useEffect(() => {
    if (initialProjects.length === 0) {
      void loadProjects()
    }
  }, [])

  async function loadProjects() {
    const response = await fetch("/api/projects")

    if (!response.ok) {
      setProjects([])
      return
    }

    const payload = (await response.json()) as Array<{ id: string; name: string; ownerId: string }>
    setProjects(payload.map(normalizeProject))
  }

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

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: projectName.trim() }),
      })

      if (!response.ok) {
        setIsLoading(false)
        return
      }

      const project = (await response.json()) as { id: string; name: string }
      setProjects((current) => [normalizeProject(project), ...current])
      setProjectName("")
      setDialog(null)
      router.push(`/editor/${project.id}`)
    } finally {
      setIsLoading(false)
    }
  }

  async function renameProject() {
    if (!selectedProject || !projectName.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: projectName.trim() }),
      })

      if (!response.ok) {
        setIsLoading(false)
        return
      }

      const project = (await response.json()) as { id: string; name: string }
      setProjects((current) =>
        current.map((item) =>
          item.id === selectedProject.id
            ? { ...item, name: project.name, slug: createSlug(project.name) }
            : item,
        ),
      )
      setDialog(null)
    } finally {
      setIsLoading(false)
    }
  }

  async function deleteProject() {
    if (!selectedProject) return

    setIsLoading(true)

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        setIsLoading(false)
        return
      }

      setProjects((current) => current.filter((project) => project.id !== selectedProject.id))
      setDialog(null)
      router.push("/editor")
    } finally {
      setIsLoading(false)
    }
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