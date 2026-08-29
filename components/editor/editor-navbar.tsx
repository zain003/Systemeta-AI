"use client"

import type { ReactNode } from "react"
import { PanelLeftClose, PanelLeftOpen } from "lucide-react"
import { UserButton } from "@clerk/nextjs"

import { Button } from "@/components/ui/button"

interface EditorNavbarProps {
  isSidebarOpen: boolean
  onSidebarToggle: () => void
  children?: ReactNode
  rightActions?: ReactNode
  aiSidebarOpen?: boolean
  onAiSidebarToggle?: () => void
}

export function EditorNavbar({
  isSidebarOpen,
  onSidebarToggle,
  children,
  rightActions,
  aiSidebarOpen = false,
  onAiSidebarToggle,
}: EditorNavbarProps) {
  const SidebarIcon = isSidebarOpen ? PanelLeftClose : PanelLeftOpen

  return (
    <nav className="fixed inset-x-0 top-0 z-30 flex h-14 items-center border-b border-surface-border bg-surface px-4">
      <div className="flex min-w-0 flex-1 items-center gap-3">
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
      <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
        {rightActions}
        {onAiSidebarToggle ? (
          <Button
            aria-label={aiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            className="hidden lg:inline-flex"
            onClick={onAiSidebarToggle}
            size="sm"
            variant={aiSidebarOpen ? "default" : "outline"}
          >
            AI
          </Button>
        ) : null}
        <UserButton />
      </div>
    </nav>
  )
}