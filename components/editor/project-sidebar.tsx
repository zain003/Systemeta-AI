"use client"

import Link from "next/link"
import { FolderOpen, MoreHorizontal, Pencil, Plus, Trash2, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import type { Project } from "@/components/editor/project-types"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewProject?: () => void
  projects: Project[]
  onRenameProject?: (project: Project) => void
  onDeleteProject?: (project: Project) => void
  selectedProjectId?: string | null
}

function ProjectList({
  projects,
  onRenameProject,
  onDeleteProject,
  selectedProjectId,
}: Pick<ProjectSidebarProps, "projects" | "onRenameProject" | "onDeleteProject" | "selectedProjectId">) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
        <FolderOpen className="h-8 w-8 text-copy-faint" />
        <p className="text-sm text-copy-muted">No projects yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-1 px-3 py-3">
      {projects.map((project) => {
        const isSelected = selectedProjectId === project.id

        return (
          <div
            className={`group flex items-center gap-3 rounded-xl px-3 py-2 transition-colors ${
              isSelected ? "bg-subtle ring-1 ring-accent-primary/40" : "hover:bg-subtle"
            }`}
            key={project.id}
          >
            <FolderOpen className={`h-4 w-4 shrink-0 ${isSelected ? "text-accent-primary" : "text-copy-faint"}`} />
            <Link
              className={`min-w-0 flex-1 truncate text-sm ${isSelected ? "text-copy-primary" : "text-copy-secondary"}`}
              href={`/editor/${project.id}`}
            >
              {project.name}
            </Link>
            {project.access === "owned" && onRenameProject && onDeleteProject ? (
              <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <Button aria-label={`Rename ${project.name}`} onClick={() => onRenameProject(project)} size="icon-xs" variant="ghost">
                  <Pencil />
                </Button>
                <Button aria-label={`Delete ${project.name}`} onClick={() => onDeleteProject(project)} size="icon-xs" variant="ghost">
                  <Trash2 />
                </Button>
              </div>
            ) : (
              <MoreHorizontal aria-hidden="true" className="h-4 w-4 text-copy-faint" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
  projects,
  onRenameProject,
  onDeleteProject,
  selectedProjectId,
}: ProjectSidebarProps) {
  return (
    <>
      {isOpen ? (
        <button
          aria-label="Close projects sidebar"
          className="fixed inset-0 top-14 z-10 bg-base/60 lg:hidden"
          onClick={onClose}
          type="button"
        />
      ) : null}
      <aside
        aria-label="Projects"
        aria-hidden={!isOpen}
        className={`fixed inset-y-14 left-0 z-20 flex w-80 flex-col border-r border-surface-border bg-surface shadow-2xl transition-transform duration-200 ease-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-14 items-center justify-between border-b border-surface-border px-4">
          <h2 className="text-sm font-medium text-copy-primary">Projects</h2>
          <Button aria-label="Close projects sidebar" onClick={onClose} size="icon" variant="ghost">
            <X />
          </Button>
        </div>

        <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1">
          <TabsList className="mx-4 mt-4 w-auto bg-subtle">
            <TabsTrigger value="my-projects">My Projects</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          <TabsContent value="my-projects" className="min-h-0 flex-1 overflow-auto">
            <ProjectList
              projects={projects.filter((project) => project.access === "owned")}
              onDeleteProject={onDeleteProject}
              onRenameProject={onRenameProject}
              selectedProjectId={selectedProjectId}
            />
          </TabsContent>
          <TabsContent value="shared" className="min-h-0 flex-1 overflow-auto">
            <ProjectList
              projects={projects.filter((project) => project.access === "shared")}
              onDeleteProject={onDeleteProject}
              onRenameProject={onRenameProject}
              selectedProjectId={selectedProjectId}
            />
          </TabsContent>
        </Tabs>

        <div className="border-t border-surface-border p-4">
          <Button className="w-full" onClick={onNewProject} variant="default">
            <Plus />
            New Project
          </Button>
        </div>
      </aside>
    </>
  )
}