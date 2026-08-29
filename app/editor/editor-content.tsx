"use client"

import { useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { useProjectDialogs } from "@/components/editor/use-project-dialogs"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import type { Project } from "@/components/editor/project-types"

interface EditorPageContentProps {
  initialProjects: Project[]
}

export function EditorPageContent({ initialProjects }: EditorPageContentProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const projectDialogs = useProjectDialogs(initialProjects)

  return (
    <main className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
      >
        <span className="truncate text-sm font-medium">Systemeta AI</span>
      </EditorNavbar>
      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onDeleteProject={projectDialogs.openDeleteDialog}
        onNewProject={projectDialogs.openCreateDialog}
        onRenameProject={projectDialogs.openRenameDialog}
        projects={projectDialogs.projects}
      />
      <section className="flex min-h-screen items-center justify-center px-6 pt-14">
        <div className="max-w-xl text-center">
          <h1 className="text-3xl font-semibold tracking-normal sm:text-4xl">
            Create a project or open an existing one
          </h1>
          <p className="mt-4 text-base text-copy-secondary">
            Start a new architecture workspace, or choose a project from the sidebar.
          </p>
          <Button className="mt-8" onClick={projectDialogs.openCreateDialog}>
            <Plus />
            New Project
          </Button>
        </div>
      </section>
      <ProjectDialogs {...projectDialogs} />
    </main>
  )
}
