"use client"

import { useEffect, useRef } from "react"

import { Dialog } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { EditorDialog } from "@/components/editor/editor-dialog"
import type { ProjectDialog } from "@/components/editor/use-project-dialogs"
import type { Project } from "@/components/editor/project-types"

interface ProjectDialogsProps {
  createProject: () => void
  deleteProject: () => void
  dialog: ProjectDialog
  closeDialog: () => void
  isLoading: boolean
  projectName: string
  renameProject: () => void
  selectedProject: Project | null
  setProjectName: (name: string) => void
  slugPreview: string
}

export function ProjectDialogs({
  createProject,
  deleteProject,
  dialog,
  closeDialog,
  isLoading,
  projectName,
  renameProject,
  selectedProject,
  setProjectName,
  slugPreview,
}: ProjectDialogsProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (dialog === "rename") {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [dialog])

  const isCreate = dialog === "create"
  const isRename = dialog === "rename"

  return (
    <>
      <Dialog open={isCreate || isRename} onOpenChange={(open) => !open && closeDialog()}>
        <EditorDialog
          title={isCreate ? "Create project" : "Rename project"}
          description={
            isCreate
              ? "Give your architecture workspace a clear name."
              : `Update the name for ${selectedProject?.name ?? "this project"}.`
          }
          actions={
            <>
              <button
                onClick={closeDialog}
                type="button"
                className="h-9 rounded-xl border border-white/[0.08] bg-transparent px-4 text-xs font-medium text-[#98a1ab] transition-colors hover:bg-white/[0.04] hover:text-[#eef1f3]"
              >
                Cancel
              </button>
              <button
                disabled={isLoading || !projectName.trim()}
                onClick={isCreate ? createProject : renameProject}
                type="button"
                className="glow-btn-cyan flex h-9 items-center justify-center rounded-xl px-4 text-xs font-semibold"
              >
                {isLoading ? "Processing..." : isCreate ? "Create project" : "Save changes"}
              </button>
            </>
          }
        >
          <div className="space-y-4 pt-1">
            <label className="block space-y-2 text-xs font-medium text-[#eef1f3]">
              <span>Project name</span>
              <Input
                ref={isRename ? inputRef : undefined}
                autoFocus={isCreate}
                onChange={(event) => setProjectName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    if (isCreate) createProject()
                    else renameProject()
                  }
                }}
                placeholder="e.g. Cloud Payments Gateway"
                value={projectName}
                className="h-10 rounded-xl border-white/[0.08] bg-white/[0.03] px-3.5 text-sm text-[#eef1f3] placeholder:text-[#5c636d] focus-visible:border-[#35e0d0]/60 focus-visible:ring-1 focus-visible:ring-[#35e0d0]/30"
              />
            </label>
            {isCreate ? (
              <p className="text-xs text-[#98a1ab]">
                Slug: <span className="font-mono font-semibold text-[#35e0d0]">{slugPreview}</span>
              </p>
            ) : null}
          </div>
        </EditorDialog>
      </Dialog>

      <Dialog open={dialog === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <EditorDialog
          title="Delete project"
          description={`Delete ${selectedProject?.name ?? "this project"}? This action cannot be undone.`}
          actions={
            <>
              <button
                onClick={closeDialog}
                type="button"
                className="h-9 rounded-xl border border-white/[0.08] bg-transparent px-4 text-xs font-medium text-[#98a1ab] transition-colors hover:bg-white/[0.04] hover:text-[#eef1f3]"
              >
                Cancel
              </button>
              <button
                disabled={isLoading}
                onClick={deleteProject}
                type="button"
                className="flex h-9 items-center justify-center rounded-xl border border-red-500/60 bg-gradient-to-r from-red-500/25 to-red-500/10 px-4 text-xs font-semibold text-red-400 shadow-[0_0_18px_rgba(239,68,68,0.25)] transition-all hover:bg-red-500/30 hover:border-red-500 hover:shadow-[0_0_24px_rgba(239,68,68,0.4)] active:scale-[0.98] disabled:border-white/[0.08] disabled:bg-white/[0.03] disabled:text-[#5c636d]"
              >
                {isLoading ? "Deleting..." : "Delete project"}
              </button>
            </>
          }
        />
      </Dialog>
    </>
  )
}