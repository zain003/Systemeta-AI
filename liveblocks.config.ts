// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
import type { LiveMap, LiveObject } from "@liveblocks/core"

declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      isThinking?: boolean
    }

    Storage: {
      flow: LiveObject<{
        nodes: LiveMap<string, LiveObject<{
          id: string
          type?: "canvasNode"
          position: { x: number; y: number }
          data: {
            label: string
            color?: string
            shape?: "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"
            size?: { width: number; height: number }
          }
        }>>
        edges: LiveMap<string, LiveObject<{
          id: string
          source: string
          target: string
          animated?: boolean
        }>>
      }>
    }

    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        color: string
      }
    }

    RoomEvent: Record<string, never>

    ThreadMetadata: {
      x: number
      y: number
    }

    RoomInfo: {
      title: string
      url: string
    }
  }
}

export {}
