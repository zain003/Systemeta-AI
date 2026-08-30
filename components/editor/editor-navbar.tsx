"use client"

import type { ReactNode } from "react"
import { PanelLeftClose, PanelLeftOpen, Sparkles } from "lucide-react"
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
    <nav className="fixed left-4 right-4 top-4 z-50 flex h-14 items-center justify-between px-4 bg-[#111318] shadow-2xl floating-glass-panel">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          aria-label={isSidebarOpen ? "Close projects sidebar" : "Open projects sidebar"}
          className="h-8 w-8 text-[#98a1ab] hover:bg-white/[0.06] hover:text-[#eef1f3]"
          onClick={onSidebarToggle}
          size="icon-sm"
          variant="ghost"
        >
          <SidebarIcon className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#35e0d0] to-[#128a80] shadow-[0_0_14px_rgba(53,224,208,0.4)]">
            <Sparkles className="h-3.5 w-3.5 text-[#08090c]" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-[#eef1f3]">Systemeta AI</span>
        </div>

        <div className="hidden min-w-0 items-center border-l border-white/[0.08] pl-3 sm:flex">
          {children}
        </div>
      </div>

      <div className="flex min-w-0 items-center justify-end gap-2">
        {rightActions}
        {onAiSidebarToggle ? (
          <button
            aria-label={aiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-xl px-3.5 text-xs font-medium transition-all select-none ${
              aiSidebarOpen
                ? "border border-[#35e0d0]/60 bg-gradient-to-r from-[#35e0d0]/25 to-[#35e0d0]/10 text-[#35e0d0] shadow-[0_0_18px_rgba(53,224,208,0.25)]"
                : "border border-white/[0.08] bg-transparent text-[#98a1ab] hover:bg-white/[0.04] hover:text-[#eef1f3]"
            }`}
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onAiSidebarToggle()
            }}
            type="button"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Architect</span>
          </button>
        ) : null}
        <div className="ml-1 flex items-center">
          <UserButton />
        </div>
      </div>
    </nav>
  )
}