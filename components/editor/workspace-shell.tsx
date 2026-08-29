"use client"

import { useState } from "react"
import { Share2, Sparkles } from "lucide-react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import type { Project } from "@/components/editor/project-types"
import { Button } from "@/components/ui/button"

interface WorkspaceShellProps {
  project: {
    id: string
    name: string
  }
  projects: Project[]
}

export function WorkspaceShell({ project, projects }: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true)

  return (
    <main className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        aiSidebarOpen={isAiSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        onAiSidebarToggle={() => setIsAiSidebarOpen((open) => !open)}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        rightActions={
          <Button size="sm" variant="outline">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        }
      >
        <span className="truncate text-sm font-medium text-copy-primary">{project.name}</span>
      </EditorNavbar>

      <ProjectSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onDeleteProject={() => undefined}
        onNewProject={() => undefined}
        onRenameProject={() => undefined}
        projects={projects}
        selectedProjectId={project.id}
      />

      <section className="flex h-[calc(100vh-3.5rem)] pt-14">
        <div className="flex min-w-0 flex-1 items-center justify-center bg-base px-6 py-10">
          <div className="max-w-xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.28em] text-copy-faint">Workspace</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-copy-primary sm:text-4xl">
              {project.name}
            </h1>
            <p className="mt-3 text-sm text-copy-secondary">
              The design canvas and room tools will appear here.
            </p>
          </div>
        </div>

        <aside
          className={`overflow-hidden border-l border-surface-border bg-surface/80 transition-all duration-200 ${
            isAiSidebarOpen ? "w-80 opacity-100" : "w-0 border-l-0 opacity-0"
          }`}
        >
          <div
            className={`flex h-full w-80 items-center justify-center px-4 text-center text-sm text-copy-secondary transition-opacity duration-200 ${
              isAiSidebarOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            AI chat placeholder
          </div>
        </aside>
      </section>
    </main>
  )
}
