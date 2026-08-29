// Define Liveblocks types for your application
// https://liveblocks.io/docs/api-reference/liveblocks-react#Typing-your-data
declare global {
  interface Liveblocks {
    Presence: {
      cursor: { x: number; y: number } | null
      isThinking?: boolean
    }

    Storage: {
      flow: {
        nodes: { id: string; position: { x: number; y: number }; data: { label: string; color?: string; shape?: "rectangle" | "circle" | "diamond" } }[]
        edges: { id: string; source: string; target: string; animated?: boolean }[]
      }
    }

    UserMeta: {
      id: string
      info: {
        name: string
        avatar: string
        color: string
      }
    }

    RoomEvent: {}

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
