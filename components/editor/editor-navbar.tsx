"use client"

import type { ReactNode } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  children?: ReactNode
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  children,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <nav className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-surface-border bg-surface px-4">
      <div className="flex min-w-0 flex-1 items-center">
        <Button
          aria-label={isSidebarOpen ? "Close projects sidebar" : "Open projects sidebar"}
          onClick={onSidebarToggle}
          size="icon"
          variant="ghost"
        >
          <SidebarIcon />
        </Button>
      </div>
      <div className="flex min-w-0 flex-1 items-center justify-center">
        {children}
      </div>
      <div aria-hidden="true" className="flex min-w-0 flex-1" />
    </nav>
  )
}