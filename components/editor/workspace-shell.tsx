"use client"

import { useState } from "react"
import { Save, Share2 } from "lucide-react"
import { LiveMap, LiveObject } from "@liveblocks/core"
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react"

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
    <LiveblocksProvider
      authEndpoint={async () => {
        const response = await fetch("/api/liveblocks-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: project.id }),
        })

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.statusText}`)
        }

        return await response.json()
      }}
      throttle={16}
    >
      <RoomProvider
        id={project.id}
        initialPresence={{
          cursor: null,
          thinking: false,
        }}
        initialStorage={{
          flow: new LiveObject({
            nodes: new LiveMap(),
            edges: new LiveMap(),
          }),
        } as unknown as Liveblocks["Storage"]}
      >
        <main className="relative h-screen w-screen overflow-hidden bg-[#08090c] text-copy-primary select-none">
          <EditorNavbar
            aiSidebarOpen={isAiSidebarOpen}
            isSidebarOpen={isSidebarOpen}
            onAiSidebarToggle={() => setIsAiSidebarOpen((open) => !open)}
            onSidebarToggle={() => setIsSidebarOpen((open) => !open)}
            rightActions={
              <>
                <button
                  onClick={() => setManualSaveSignal((value) => value + 1)}
                  type="button"
                  className={`flex h-8 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors ${
                    saveState.status === "error"
                      ? "border-red-500/40 bg-red-500/10 text-red-400"
                      : "border-white/[0.08] bg-transparent text-[#98a1ab] hover:bg-white/[0.04] hover:text-[#eef1f3]"
                  }`}
                >
                  <Save className="h-3.5 w-3.5" />
                  <span>
                    {saveState.status === "saving"
                      ? "Saving..."
                      : saveState.status === "saved"
                      ? "Saved"
                      : saveState.status === "error"
                      ? "Retry save"
                      : "Save"}
                  </span>
                </button>
                <button
                  onClick={() => setIsTemplateDialogOpen(true)}
                  type="button"
                  className="flex h-8 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-transparent px-3 text-xs font-medium text-[#98a1ab] transition-colors hover:bg-white/[0.04] hover:text-[#eef1f3]"
                >
                  Templates
                </button>
                <button
                  onClick={() => setIsShareDialogOpen(true)}
                  type="button"
                  className="flex h-8 items-center gap-1.5 rounded-xl border border-white/[0.08] bg-transparent px-3 text-xs font-medium text-[#98a1ab] transition-colors hover:bg-white/[0.04] hover:text-[#eef1f3]"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share</span>
                </button>
              </>
            }
          >
            <span className="truncate text-xs font-normal text-[#98a1ab]">{project.name}</span>
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

          {/* Full-bleed Canvas */}
          <div className="absolute inset-0 h-full w-full">
            <CanvasEditor
              projectId={project.id}
              pendingTemplate={pendingTemplate}
              onTemplateHandled={() => setPendingTemplate(null)}
              isTemplateDialogOpen={isTemplateDialogOpen}
              manualSaveSignal={manualSaveSignal}
              onSaveStateChange={setSaveState}
            />
          </div>

          {/* Floating Left Project Sidebar */}
          <ProjectSidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
            onDeleteProject={projectDialogs.openDeleteDialog}
            onNewProject={projectDialogs.openCreateDialog}
            onRenameProject={projectDialogs.openRenameDialog}
            projects={projectDialogs.projects}
            selectedProjectId={project.id}
          />

          {/* Floating Right AI Workspace Sidebar */}
          <AISidebar
            isOpen={isAiSidebarOpen}
            onClose={() => setIsAiSidebarOpen(false)}
            roomId={project.id}
            projectId={project.id}
          />
        </main>
      </RoomProvider>
    </LiveblocksProvider>
  )
}
