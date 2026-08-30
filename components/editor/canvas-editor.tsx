"use client"

import { ClientSideSuspense } from "@liveblocks/react"

import { Canvas } from "@/components/editor/canvas"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

interface CanvasEditorProps {
  projectId: string
  pendingTemplate?: CanvasTemplate | null
  onTemplateHandled?: () => void
  isTemplateDialogOpen?: boolean
  manualSaveSignal?: number
  onSaveStateChange?: (nextState: { status: "idle" | "saving" | "saved" | "error"; error: string | null }) => void
}

export function CanvasEditor({
  projectId,
  pendingTemplate,
  onTemplateHandled,
  manualSaveSignal,
  onSaveStateChange,
}: CanvasEditorProps) {
  return (
    <div className="relative h-full w-full">
      <ClientSideSuspense fallback={<LoadingCanvas />}>
        <Canvas
          projectId={projectId}
          pendingTemplate={pendingTemplate}
          onTemplateHandled={onTemplateHandled}
          manualSaveSignal={manualSaveSignal}
          onSaveStateChange={onSaveStateChange}
        />
      </ClientSideSuspense>
    </div>
  )
}

function LoadingCanvas() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#08090c]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#35e0d0] border-t-transparent"></div>
        <p className="mt-2 text-sm text-[#98a1ab]">Loading canvas...</p>
      </div>
    </div>
  )
}
