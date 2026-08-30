"use client"

import { useState } from "react"
import Link from "next/link"
import { MoreHorizontal, Pencil, Plus, Search, Trash2, X } from "lucide-react"
import { useUser } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"
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

const AVATAR_COLORS = [
  { bg: "bg-[#35e0d0]/15", text: "text-[#35e0d0]", border: "border-[#35e0d0]/30" },
  { bg: "bg-amber-500/15", text: "text-amber-400", border: "border-amber-500/30" },
  { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  { bg: "bg-pink-500/15", text: "text-pink-400", border: "border-pink-500/30" },
  { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
]

function getProjectColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function ProjectList({
  projects,
  onRenameProject,
  onDeleteProject,
  selectedProjectId,
  searchQuery,
}: Pick<ProjectSidebarProps, "projects" | "onRenameProject" | "onDeleteProject" | "selectedProjectId"> & {
  searchQuery: string
}) {
  const filtered = projects.filter((p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
        <p className="text-xs text-[#5c636d]">{searchQuery ? "No matching projects" : "No projects yet"}</p>
      </div>
    )
  }

  return (
    <div className="space-y-1.5 px-3 py-2">
      {filtered.map((project, idx) => {
        const isSelected = selectedProjectId === project.id
        const color = getProjectColor(project.name)
        const initial = project.name.trim().charAt(0).toUpperCase() || "P"
        const mockTime = ["Edited 2m ago", "Edited 1d ago", "Edited 3d ago", "Edited 6d ago"][idx % 4]
        const mockNodes = [6, 2, 11, 4][idx % 4]

        return (
          <div
            className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
              isSelected
                ? "border border-[rgba(53,224,208,0.35)] bg-[rgba(53,224,208,0.09)] text-[#35e0d0] shadow-[0_0_16px_rgba(53,224,208,0.12)]"
                : "border border-transparent text-[#98a1ab] hover:border-white/[0.06] hover:bg-white/[0.04] hover:text-[#eef1f3]"
            }`}
            key={project.id}
          >
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border text-xs font-bold ${color.bg} ${color.text} ${color.border}`}
            >
              {initial}
            </div>

            <Link className="min-w-0 flex-1" href={`/editor/${project.id}`}>
              <p className={`truncate text-xs font-semibold ${isSelected ? "text-[#35e0d0]" : "text-[#eef1f3]"}`}>
                {project.name}
              </p>
              <p className="truncate text-[10px] text-[#5c636d]">
                {mockTime} · {mockNodes} nodes
              </p>
            </Link>

            {project.access === "owned" && onRenameProject && onDeleteProject ? (
              <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                <Button
                  aria-label={`Rename ${project.name}`}
                  className="h-6 w-6 text-[#98a1ab] hover:bg-white/[0.08] hover:text-[#eef1f3]"
                  onClick={() => onRenameProject(project)}
                  size="icon-xs"
                  variant="ghost"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  aria-label={`Delete ${project.name}`}
                  className="h-6 w-6 text-[#98a1ab] hover:bg-red-500/20 hover:text-red-400"
                  onClick={() => onDeleteProject(project)}
                  size="icon-xs"
                  variant="ghost"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ) : (
              <MoreHorizontal aria-hidden="true" className="h-3.5 w-3.5 text-[#5c636d] opacity-40 group-hover:opacity-100" />
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
  const [activeTab, setActiveTab] = useState<"owned" | "shared">("owned")
  const [searchQuery, setSearchQuery] = useState("")
  const { user } = useUser()

  const userName = user?.firstName || user?.fullName || "Nabeel"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <>
      {isOpen ? (
        <button
          aria-label="Close projects sidebar"
          className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          type="button"
        />
      ) : null}

      <aside
        aria-label="Projects"
        aria-hidden={!isOpen}
        className="flex h-[calc(100vh-96px)] w-72 flex-col overflow-hidden rounded-2xl bg-[#111318] shadow-2xl floating-glass-panel glow-border-right lg:w-80"
        style={{
          position: "fixed",
          top: "80px",
          bottom: "16px",
          left: "16px",
          right: "auto",
          zIndex: 40,
          transform: isOpen ? "translateX(0)" : "translateX(calc(-100% - 32px))",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-in-out",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
          <div>
            <h2 className="text-sm font-semibold text-[#eef1f3]">Projects</h2>
            <p className="text-[11px] text-[#5c636d]">{projects.length} workspaces</p>
          </div>
          <Button
            aria-label="Close projects sidebar"
            className="h-7 w-7 text-[#98a1ab] hover:bg-white/[0.06] hover:text-[#eef1f3]"
            onClick={onClose}
            size="icon-xs"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="px-3.5 pt-3">
          <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 transition-colors focus-within:border-[#35e0d0]/40 focus-within:ring-1 focus-within:ring-[#35e0d0]/20">
            <Search className="h-3.5 w-3.5 text-[#5c636d]" />
            <input
              className="w-full bg-transparent text-xs text-[#eef1f3] placeholder:text-[#5c636d] focus:outline-none"
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects…"
              type="text"
              value={searchQuery}
            />
          </div>
        </div>

        {/* Tabs: My Projects / Shared */}
        <div className="flex gap-1.5 px-3.5 pt-3">
          <button
            className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-all ${
              activeTab === "owned"
                ? "border border-[#35e0d0]/40 bg-[rgba(53,224,208,0.1)] text-[#35e0d0]"
                : "border border-transparent text-[#98a1ab] hover:bg-white/[0.04] hover:text-[#eef1f3]"
            }`}
            onClick={() => setActiveTab("owned")}
            type="button"
          >
            My Projects
          </button>
          <button
            className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-all ${
              activeTab === "shared"
                ? "border border-[#35e0d0]/40 bg-[rgba(53,224,208,0.1)] text-[#35e0d0]"
                : "border border-transparent text-[#98a1ab] hover:bg-white/[0.04] hover:text-[#eef1f3]"
            }`}
            onClick={() => setActiveTab("shared")}
            type="button"
          >
            Shared
          </button>
        </div>

        {/* Project List */}
        <div className="min-h-0 flex-1 overflow-y-auto pr-0.5">
          <ProjectList
            onDeleteProject={onDeleteProject}
            onRenameProject={onRenameProject}
            projects={projects.filter((p) => p.access === activeTab)}
            searchQuery={searchQuery}
            selectedProjectId={selectedProjectId}
          />
        </div>

        {/* Pinned New Project Button */}
        <div className="p-3.5 pb-2">
          <button
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#35e0d0]/50 bg-gradient-to-r from-[#35e0d0]/25 to-[#35e0d0]/10 py-2.5 text-xs font-semibold text-[#35e0d0] shadow-[0_0_20px_rgba(53,224,208,0.2)] transition-all hover:bg-[#35e0d0]/35 hover:shadow-[0_0_25px_rgba(53,224,208,0.3)] active:scale-[0.98]"
            onClick={onNewProject}
            type="button"
          >
            <Plus className="h-4 w-4" />
            <span>New Project</span>
          </button>
        </div>

        {/* Pinned Footer with User Info */}
        <div className="flex items-center justify-between border-t border-white/[0.08] px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-pink-500/20 text-[11px] font-bold text-pink-400 border border-pink-500/30">
              {userInitial}
            </div>
            <span className="truncate text-xs font-medium text-[#eef1f3]">{userName}</span>
          </div>
          <span className="shrink-0 text-[11px] text-[#5c636d]">1 issue</span>
        </div>
      </aside>
    </>
  )
}