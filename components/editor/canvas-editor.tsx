"use client"

import { LiveMap, LiveObject } from "@liveblocks/core"
import { LiveblocksProvider, RoomProvider, ClientSideSuspense } from "@liveblocks/react"

import { Canvas } from "@/components/editor/canvas"

interface CanvasEditorProps {
  roomId: string
}

export function CanvasEditor({ roomId }: CanvasEditorProps) {
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
        }}
        initialStorage={{
          flow: new LiveObject({
            nodes: new LiveMap(),
            edges: new LiveMap(),
          }),
        } as unknown as Liveblocks["Storage"]}
      >
        <ClientSideSuspense fallback={<LoadingCanvas />}>
          <Canvas />
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
