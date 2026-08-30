"use client"

import { useState } from "react"
import { Save, Share2 } from "lucide-react"

import { AISidebar } from "@/components/editor/ai-sidebar"
import { CanvasEditor } from "@/components/editor/canvas-editor"
import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectDialogs } from "@/components/editor/project-dialogs"
import { ProjectSidebar } from "@/components/editor/project-sidebar"
import { ShareDialog } from "@/components/editor/share-dialog"
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal"
import type { CanvasTemplate } from "@/components/editor/starter-templates"
import type { Project } from "@/components/editor/project-types"
import { useProjectDialogs } from "@/components/editor/use-project-dialogs"
import { Button } from "@/components/ui/button"

interface WorkspaceShellProps {
  project: {
    id: string
    name: string
  }
  projects: Project[]
  isOwner?: boolean
  userId?: string
}

export function WorkspaceShell({ project, projects, isOwner = false }: WorkspaceShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [pendingTemplate, setPendingTemplate] = useState<CanvasTemplate | null>(null)
  const [manualSaveSignal, setManualSaveSignal] = useState(0)
  const [saveState, setSaveState] = useState<{ status: "idle" | "saving" | "saved" | "error"; error: string | null }>({
    status: "idle",
    error: null,
  })
  const projectDialogs = useProjectDialogs(projects)

  return (
    <main className="min-h-screen bg-base text-copy-primary">
      <EditorNavbar
        aiSidebarOpen={isAiSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        onAiSidebarToggle={() => setIsAiSidebarOpen((open) => !open)}
        onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
        rightActions={
          <>
            <Button
              onClick={() => setManualSaveSignal((value) => value + 1)}
              size="sm"
              variant={saveState.status === "error" ? "destructive" : "outline"}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              <span>{saveState.status === "saving" ? "Saving..." : saveState.status === "saved" ? "Saved" : saveState.status === "error" ? "Retry save" : "Save"}</span>
            </Button>
            <Button onClick={() => setIsTemplateDialogOpen(true)} size="sm" variant="outline">
              Templates
            </Button>
            <Button onClick={() => setIsShareDialogOpen(true)} size="sm" variant="outline">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </>
        }
      >
        <span className="truncate text-sm font-medium text-copy-primary">{project.name}</span>
      </EditorNavbar>

      <StarterTemplatesModal
        isOpen={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onImport={(template) => {
          setPendingTemplate(template)
          setIsTemplateDialogOpen(false)
        }}
      />

      <ShareDialog
        isOpen={isShareDialogOpen}
        onClose={() => setIsShareDialogOpen(false)}
        projectId={project.id}
        projectName={project.name}
        isOwner={isOwner}
      />

      <ProjectDialogs {...projectDialogs} />

      <section className="flex h-[calc(100vh-3.5rem)] pt-14">
        <ProjectSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onDeleteProject={projectDialogs.openDeleteDialog}
          onNewProject={projectDialogs.openCreateDialog}
          onRenameProject={projectDialogs.openRenameDialog}
          projects={projectDialogs.projects}
          selectedProjectId={project.id}
        />

        <div className="relative min-w-0 flex-1">
          <CanvasEditor
            roomId={project.id}
            projectId={project.id}
            pendingTemplate={pendingTemplate}
            onTemplateHandled={() => setPendingTemplate(null)}
            isTemplateDialogOpen={isTemplateDialogOpen}
            manualSaveSignal={manualSaveSignal}
            onSaveStateChange={setSaveState}
          />
        </div>

        <AISidebar isOpen={isAiSidebarOpen} onClose={() => setIsAiSidebarOpen(false)} />
      </section>
    </main>
  )
}
