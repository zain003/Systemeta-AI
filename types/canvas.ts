import type { Node, Edge } from "@xyflow/react"

export type CanvasNodeShape = "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  color?: string
  shape?: CanvasNodeShape
  size?: {
    width: number
    height: number
  }
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">

export interface CanvasEdgeData extends Record<string, unknown> {
  animated?: boolean
}

export type CanvasEdge = Edge<CanvasEdgeData, "canvasEdge">

export interface CanvasShapeOption {
  name: CanvasNodeShape
  label: string
  size: {
    width: number
    height: number
  }
}

export const NODE_COLORS = [
  { name: "indigo", fill: "#3b82f6", glow: "#60a5fa" },
  { name: "violet", fill: "#8b5cf6", glow: "#a78bfa" },
  { name: "emerald", fill: "#10b981", glow: "#34d399" },
  { name: "amber", fill: "#f59e0b", glow: "#fbbf24" },
  { name: "rose", fill: "#f43f5e", glow: "#fb7185" },
  { name: "cyan", fill: "#06b6d4", glow: "#67e8f9" },
  { name: "slate", fill: "#64748b", glow: "#94a3b8" },
  { name: "orange", fill: "#f97316", glow: "#fdba74" },
] as const

export const NODE_SHAPES: CanvasShapeOption[] = [
  { name: "rectangle", label: "Rectangle", size: { width: 180, height: 90 } },
  { name: "diamond", label: "Diamond", size: { width: 170, height: 150 } },
  { name: "circle", label: "Circle", size: { width: 110, height: 110 } },
  { name: "pill", label: "Pill", size: { width: 170, height: 70 } },
  { name: "cylinder", label: "Cylinder", size: { width: 170, height: 100 } },
  { name: "hexagon", label: "Hexagon", size: { width: 180, height: 120 } },
]
