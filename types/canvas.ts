import type { Node, Edge } from "@xyflow/react"

export type CanvasNodeShape = "rectangle" | "diamond" | "circle" | "pill" | "cylinder" | "hexagon"

export interface CanvasNodeData extends Record<string, unknown> {
  label: string
  backgroundColor?: string
  textColor?: string
  shape?: CanvasNodeShape
  size?: {
    width: number
    height: number
  }
}

export type CanvasNode = Node<CanvasNodeData, "canvasNode">

export interface CanvasEdgeData extends Record<string, unknown> {
  animated?: boolean
  label?: string
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
  { name: "neutral", fill: "#1F1F1F", text: "#EDEDED" },
  { name: "blue", fill: "#10233D", text: "#52A8FF" },
  { name: "purple", fill: "#2E1938", text: "#BF7AF0" },
  { name: "orange", fill: "#331B00", text: "#FF990A" },
  { name: "red", fill: "#3C1618", text: "#FF6166" },
  { name: "pink", fill: "#3A1726", text: "#F75F8F" },
  { name: "green", fill: "#0F2E18", text: "#62C073" },
  { name: "teal", fill: "#062822", text: "#0AC7B4" },
] as const

export const NODE_SHAPES: CanvasShapeOption[] = [
  { name: "rectangle", label: "Rectangle", size: { width: 180, height: 90 } },
  { name: "diamond", label: "Diamond", size: { width: 170, height: 150 } },
  { name: "circle", label: "Circle", size: { width: 110, height: 110 } },
  { name: "pill", label: "Pill", size: { width: 170, height: 70 } },
  { name: "cylinder", label: "Cylinder", size: { width: 170, height: 100 } },
  { name: "hexagon", label: "Hexagon", size: { width: 180, height: 120 } },
]
