"use client"

import { useState } from "react"

import { EditorNavbar } from "@/components/editor/editor-navbar"
import { ProjectSidebar } from "@/components/editor/project-sidebar"


export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

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
      />
      <section className="flex min-h-screen items-center justify-center px-6 pt-14">
        <h1 className="text-center text-5xl font-semibold tracking-normal sm:text-7xl">
          Systemeta AI
        </h1>
      </section>
    </main>
  )
}
