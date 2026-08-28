"use client"

import { FolderOpen, Plus, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

interface ProjectSidebarProps {
  isOpen: boolean
  onClose: () => void
  onNewProject?: () => void
}

function EmptyProjectsState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <FolderOpen className="h-8 w-8 text-copy-faint" />
      <p className="text-sm text-copy-muted">No projects yet</p>
    </div>
  )
}

export function ProjectSidebar({
  isOpen,
  onClose,
  onNewProject,
}: ProjectSidebarProps) {
  return (
    <aside
      aria-label="Projects"
      aria-hidden={!isOpen}
      className={`fixed inset-y-14 left-0 z-20 flex w-80 flex-col border-r border-surface-border bg-surface shadow-2xl transition-transform duration-200 ease-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex h-14 items-center justify-between border-b border-surface-border px-4">
        <h2 className="text-sm font-medium text-copy-primary">Projects</h2>
        <Button
          aria-label="Close projects sidebar"
          onClick={onClose}
          size="icon"
          variant="ghost"
        >
          <X />
        </Button>
      </div>

      <Tabs defaultValue="my-projects" className="flex min-h-0 flex-1">
        <TabsList className="mx-4 mt-4 w-auto bg-subtle">
          <TabsTrigger value="my-projects">My Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent value="my-projects" className="min-h-0 flex-1 overflow-auto">
          <EmptyProjectsState />
        </TabsContent>
        <TabsContent value="shared" className="min-h-0 flex-1 overflow-auto">
          <EmptyProjectsState />
        </TabsContent>
      </Tabs>

      <div className="border-t border-surface-border p-4">
        <Button className="w-full" onClick={onNewProject} variant="default">
          <Plus />
          New Project
        </Button>
      </div>
    </aside>
  )
}