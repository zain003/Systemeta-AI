"use client"

import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
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
              <Button onClick={closeDialog} variant="ghost">
                Cancel
              </Button>
              <Button
                disabled={isLoading || !projectName.trim()}
                onClick={isCreate ? createProject : renameProject}
              >
                {isCreate ? "Create project" : "Save changes"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <label className="space-y-2 text-sm font-medium text-copy-secondary">
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
                value={projectName}
              />
            </label>
            {isCreate ? (
              <p className="text-xs text-copy-muted">
                Slug: <span className="font-mono text-copy-secondary">{slugPreview}</span>
              </p>
            ) : null}
          </div>
        </EditorDialog>
      </Dialog>

      <Dialog open={dialog === "delete"} onOpenChange={(open) => !open && closeDialog()}>
        <EditorDialog
          title="Delete project"
          description={`Delete ${selectedProject?.name ?? "this project"}? This mock action cannot be undone.`}
          actions={
            <>
              <Button onClick={closeDialog} variant="ghost">
                Cancel
              </Button>
              <Button disabled={isLoading} onClick={deleteProject} variant="destructive">
                Delete project
              </Button>
            </>
          }
        />
      </Dialog>
    </>
  )
}