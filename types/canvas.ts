import type { Node, Edge } from "@xyflow/react"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color?: string
  shape?: "rectangle" | "circle" | "diamond"
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">

export interface CanvasEdgeData extends Record<string, unknown> {
  animated?: boolean
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">
