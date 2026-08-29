"use client"

import {
  Background,
  Controls,
  MiniMap,
  ConnectionMode,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react"
import { LiveList, LiveMap, LiveObject, type LsonObject } from "@liveblocks/core"
import { useMutation } from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useCallback, useEffect, useRef, type DragEvent } from "react"

import {
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeShape,
} from "@/types/canvas"

import "@xyflow/react/dist/style.css"

interface ShapeDragPayload {
  type: "shape"
  shape: CanvasNodeShape
  size: {
    width: number
    height: number
  }
}

function CanvasNodeRenderer({ data, selected }: NodeProps<CanvasNode>) {
  const fill = data.color ?? NODE_COLORS[0].fill
  const width = data.size?.width ?? 180
  const height = data.size?.height ?? 90

  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-xl border-2 text-center font-medium text-white shadow-lg"
      style={{
        width,
        height,
        background: `linear-gradient(135deg, ${fill}, rgba(15, 23, 42, 0.92))`,
        borderColor: selected ? "#f8fafc" : "rgba(148, 163, 184, 0.9)",
        boxShadow: selected ? `0 0 0 2px ${fill}` : "0 12px 24px rgba(15, 23, 42, 0.24)",
        borderRadius: data.shape === "circle" ? "9999px" : data.shape === "pill" ? "9999px" : data.shape === "diamond" ? "0px" : data.shape === "hexagon" ? "18px" : "16px",
        clipPath:
          data.shape === "diamond"
            ? "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)"
            : data.shape === "hexagon"
              ? "polygon(25% 6%, 75% 6%, 100% 50%, 75% 94%, 25% 94%, 0% 50%)"
              : "none",
      }}
    >
      <div className="px-3 text-sm leading-tight tracking-wide" style={{ color: "#f8fafc" }}>
        {data.label || "Untitled"}
      </div>
    </div>
  )
}

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
  })
  const { screenToFlowPosition } = useReactFlow()
  const nodeCounter = useRef(0)

  const migrateLegacyFlowStorage = useMutation(({ storage }) => {
    const storedFlow = storage.get("flow") as unknown

    if (!storedFlow || typeof storedFlow !== "object") {
      return
    }

    const flow = storedFlow as {
      get?: (key: "nodes" | "edges") => unknown
      set?: (key: "nodes" | "edges", value: unknown) => void
      nodes?: unknown
      edges?: unknown
    }

    if (typeof flow.get !== "function" || typeof flow.set !== "function") {
      const migratedFlow = new LiveObject({
        nodes: new LiveMap<string, LiveObject<LsonObject>>(),
        edges: new LiveMap<string, LiveObject<LsonObject>>(),
      })

      const migrateCollection = (collection: unknown, target: LiveMap<string, LiveObject<LsonObject>>) => {
        const values = collection instanceof LiveList ? collection.toJSON() : Array.isArray(collection) ? collection : []

        values.forEach((value) => {
          if (!value || typeof value !== "object") {
            return
          }

          const item = value as Record<string, unknown>
          const itemId = typeof item.id === "string" ? item.id : null

          if (itemId) {
            target.set(itemId, new LiveObject(item as LsonObject))
          }
        })
      }

      migrateCollection(flow.nodes, migratedFlow.get("nodes"))
      migrateCollection(flow.edges, migratedFlow.get("edges"))
      storage.set("flow", migratedFlow as unknown as Liveblocks["Storage"]["flow"])
      return
    }

    const nodes = flow.get("nodes") as unknown
    const edges = flow.get("edges") as unknown

    if (nodes instanceof LiveList) {
      const legacyNodes = nodes as unknown as LiveList<LiveObject<LsonObject>>
      const migratedNodes = new LiveMap<string, LiveObject<LsonObject>>()

      legacyNodes.forEach((node) => {
        const plainNode = node instanceof LiveObject ? node.toJSON() : node
        const nodeId = typeof plainNode.id === "string" ? plainNode.id : null

        if (nodeId) {
          migratedNodes.set(nodeId, new LiveObject(plainNode as LsonObject))
        }
      })

      flow.set("nodes", migratedNodes as unknown as typeof nodes)
      flow.set("nodes", migratedNodes)
    }

    if (edges instanceof LiveList) {
      const legacyEdges = edges as unknown as LiveList<LiveObject<LsonObject>>
      const migratedEdges = new LiveMap<string, LiveObject<LsonObject>>()

      legacyEdges.forEach((edge) => {
        const plainEdge = edge instanceof LiveObject ? edge.toJSON() : edge
        const edgeId = typeof plainEdge.id === "string" ? plainEdge.id : null

        if (edgeId) {
          migratedEdges.set(edgeId, new LiveObject(plainEdge as LsonObject))
        }
      })

      flow.set("edges", migratedEdges as unknown as typeof edges)
      flow.set("edges", migratedEdges)
    }
  }, [])

  useEffect(() => {
    migrateLegacyFlowStorage()
  }, [migrateLegacyFlowStorage])

  const createNodeFromShape = useCallback(
    (payload: ShapeDragPayload, pointerX: number, pointerY: number) => {
      const option = NODE_SHAPES.find((item) => item.name === payload.shape) ?? NODE_SHAPES[0]
      const position = screenToFlowPosition({ x: pointerX, y: pointerY })
      const color = NODE_COLORS[0]
      const id = `${payload.shape}-${Date.now()}-${nodeCounter.current++}`

      const nextNode: CanvasNode = {
        id,
        type: "canvasNode",
        position,
        data: {
          label: "",
          color: color.fill,
          shape: payload.shape,
          size: payload.size ?? option.size,
        },
        style: {
          width: payload.size?.width ?? option.size.width,
          height: payload.size?.height ?? option.size.height,
        },
      }

      onNodesChange([
        {
          type: "add",
          item: nextNode,
        },
      ])
    },
    [nodeCounter, onNodesChange, screenToFlowPosition],
  )

  const handleShapeDragStart = (event: DragEvent<HTMLButtonElement>, shape: CanvasNodeShape) => {
    const option = NODE_SHAPES.find((item) => item.name === shape)
    const payload: ShapeDragPayload = {
      type: "shape",
      shape,
      size: option?.size ?? { width: 180, height: 90 },
    }

    event.dataTransfer.effectAllowed = "copy"
    event.dataTransfer.setData("application/x-systemeta-shape", JSON.stringify(payload))
  }

  const handleDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes("application/x-systemeta-shape")) {
      event.preventDefault()
      event.dataTransfer.dropEffect = "copy"
    }
  }, [])

  const handleDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      const serializedPayload = event.dataTransfer.getData("application/x-systemeta-shape")

      if (!serializedPayload) {
        return
      }

      event.preventDefault()

      try {
        const payload = JSON.parse(serializedPayload) as ShapeDragPayload

        if (payload.type === "shape" && NODE_SHAPES.some((item) => item.name === payload.shape)) {
          createNodeFromShape(payload, event.clientX, event.clientY)
        }
      } catch {
        return
      }
    },
    [createNodeFromShape],
  )

  return (
    <div className="relative h-full w-full flex-1" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={{ canvasNode: CanvasNodeRenderer }}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background color="#333" gap={16} size={1} />
        <Controls position="bottom-left" className="canvas-controls" />
        <MiniMap position="bottom-right" className="canvas-minimap" />
      </ReactFlow>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-surface-border bg-surface/85 px-3 py-2 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {NODE_SHAPES.map((shape) => (
            <button
              key={shape.name}
              type="button"
              draggable
              onDragStart={(event) => handleShapeDragStart(event, shape.name)}
              className="flex h-12 w-12 select-none items-center justify-center rounded-full border border-surface-border bg-surface-muted text-lg text-copy-primary transition hover:border-accent-primary hover:bg-surface-elevated"
              title={shape.label}
              aria-label={`Add ${shape.label}`}
            >
              {shape.name === "rectangle" && "▭"}
              {shape.name === "diamond" && "◇"}
              {shape.name === "circle" && "◯"}
              {shape.name === "pill" && "▱"}
              {shape.name === "cylinder" && "◫"}
              {shape.name === "hexagon" && "⬡"}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  )
}
