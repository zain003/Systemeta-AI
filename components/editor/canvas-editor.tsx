"use client"

import { LiveMap, LiveObject } from "@liveblocks/core"
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react"

import { Canvas } from "@/components/editor/canvas"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

interface CanvasEditorProps {
  roomId: string
  projectId: string
  pendingTemplate?: CanvasTemplate | null
  onTemplateHandled?: () => void
  isTemplateDialogOpen?: boolean
  manualSaveSignal?: number
  onSaveStateChange?: (nextState: { status: "idle" | "saving" | "saved" | "error"; error: string | null }) => void
}

export function CanvasEditor({
  roomId,
  projectId,
  pendingTemplate,
  onTemplateHandled,
  isTemplateDialogOpen = false,
  manualSaveSignal,
  onSaveStateChange,
}: CanvasEditorProps) {
  return (
    <LiveblocksProvider
      authEndpoint={async () => {
        const response = await fetch("/api/liveblocks-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: roomId }),
        })

        if (!response.ok) {
          throw new Error(`Authentication failed: ${response.statusText}`)
        }

        return await response.json()
      }}
      throttle={16}
    >
      <RoomProvider
        id={roomId}
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
        <ClientSideSuspense fallback={<LoadingCanvas />}>
          <Canvas
            projectId={projectId}
            pendingTemplate={pendingTemplate}
            onTemplateHandled={onTemplateHandled}
            isTemplateDialogOpen={isTemplateDialogOpen}
            manualSaveSignal={manualSaveSignal}
            onSaveStateChange={onSaveStateChange}
          />
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  )
}

function LoadingCanvas() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-base">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-accent-primary border-t-transparent"></div>
        <p className="mt-2 text-sm text-copy-secondary">Loading canvas...</p>
      </div>
    </div>
  )
}
