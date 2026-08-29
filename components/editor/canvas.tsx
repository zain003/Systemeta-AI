"use client"

import {
  Background,
  Controls,
  MiniMap,
  NodeResizer,
  ConnectionMode,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react"
import { LiveList, LiveMap, LiveObject, type LsonObject } from "@liveblocks/core"
import { useMutation } from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent as ReactDragEvent, type KeyboardEvent, type MouseEvent } from "react"

import {
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeData,
  type CanvasNodeShape,
} from "@/types/canvas"

const canvasNodeTypes = { canvasNode: CanvasNodeRenderer }

import "@xyflow/react/dist/style.css"

interface ShapeDragPayload {
  type: "shape"
  shape: CanvasNodeShape
  size: {
    width: number
    height: number
  }
}

interface ShapeVisualProps {
  shape: CanvasNodeShape
  width: number
  height: number
  fill: string
  label?: string
  selected?: boolean
  preview?: boolean
  onDoubleClick?: (event: MouseEvent<HTMLDivElement>) => void
}

function ShapeVisual({ shape, width, height, fill, label, selected = false, preview = false, onDoubleClick }: ShapeVisualProps) {
  const stroke = selected ? "#f8fafc" : "rgba(148, 163, 184, 0.9)"
  const isSvgShape = shape === "diamond" || shape === "hexagon" || shape === "cylinder"

  if (isSvgShape) {
    const path =
      shape === "diamond"
        ? "M 50 2 L 98 50 L 50 98 L 2 50 Z"
        : shape === "hexagon"
          ? "M 25 3 L 75 3 L 98 50 L 75 97 L 25 97 L 2 50 Z"
          : "M 5 16 C 5 8 95 8 95 16 L 95 84 C 95 92 5 92 5 84 Z"

    return (
      <div
        className={`relative ${preview ? "opacity-65" : ""}`}
        style={{ width, height, display: "flex", alignItems: "center", justifyContent: "center" }}
        onDoubleClick={onDoubleClick}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {shape === "cylinder" && <ellipse cx="50" cy="16" rx="45" ry="8" fill={fill} stroke={stroke} strokeWidth={selected ? 2 : 1.5} />}
          <path d={path} fill={fill} stroke={stroke} strokeWidth={selected ? 2 : 1.5} vectorEffect="non-scaling-stroke" />
          {shape === "cylinder" && <path d="M 5 84 C 5 92 95 92 95 84" fill="none" stroke={stroke} strokeWidth={selected ? 2 : 1.5} vectorEffect="non-scaling-stroke" />}
        </svg>
        {label && <ShapeLabel label={label} />}
      </div>
    )
  }

  return (
    <div
      className={`relative flex items-center justify-center border-2 text-center font-medium text-white shadow-lg ${preview ? "opacity-65" : ""}`}
      style={{
        width,
        height,
        background: `linear-gradient(135deg, ${fill}, rgba(15, 23, 42, 0.92))`,
        borderColor: stroke,
        boxShadow: selected ? `0 0 0 2px ${fill}` : "0 12px 24px rgba(15, 23, 42, 0.24)",
        borderRadius: shape === "circle" || shape === "pill" ? "9999px" : "16px",
      }}
      onDoubleClick={onDoubleClick}
      onMouseDown={(event) => event.stopPropagation()}
    >
      {label && <ShapeLabel label={label} />}
    </div>
  )
}

function ShapeLabel({ label }: { label: string }) {
  return <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3 text-center text-sm leading-tight tracking-wide text-white">{label}</div>
}

function CanvasNodeRenderer({ id, data, selected, width: measuredWidth, height: measuredHeight }: NodeProps<CanvasNode>) {
  const option = NODE_SHAPES.find((item) => item.name === data.shape) ?? NODE_SHAPES[0]
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data.label)
  const updateNodeData = useMutation(({ storage }, update: { id: string; data: CanvasNodeData }) => {
    const flow = storage.get("flow") as unknown

    if (!flow || typeof flow !== "object" || !(flow as { get?: unknown }).get || typeof (flow as { get: unknown }).get !== "function") {
      return
    }

    const node = (flow as { get: (key: "nodes") => { get: (id: string) => { set: (key: string, value: unknown) => void } | undefined } }).get("nodes").get(update.id)

    if (node) {
      node.set("data", update.data)
    }
  }, [])

  const finishEditing = () => {
    setIsEditing(false)
    if (draftLabel !== data.label) {
      updateNodeData({ id, data: { ...data, label: draftLabel } })
    }
  }

  const handleLabelChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const nextLabel = event.target.value
    setDraftLabel(nextLabel)
    updateNodeData({ id, data: { ...data, label: nextLabel } })
  }

  const handleLabelKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      setDraftLabel(data.label)
      setIsEditing(false)
    }
  }

  const handleResize = useCallback(
    (_event: unknown, params: { width: number; height: number }) => {
      updateNodeData({ id, data: { ...data, size: { width: params.width, height: params.height } } })
    },
    [data, id, updateNodeData],
  )
  const width = measuredWidth ?? data.size?.width ?? option.size.width
  const height = measuredHeight ?? data.size?.height ?? option.size.height

  return (
    <>
      <NodeResizer
        isVisible={selected}
        minWidth={80}
        minHeight={50}
        color="var(--accent-primary)"
        handleStyle={{ width: 8, height: 8, borderRadius: "3px", background: "var(--bg-surface)", border: "1px solid var(--accent-primary)" }}
        lineStyle={{ borderColor: "var(--accent-primary)" }}
        onResize={handleResize}
      />
      <ShapeVisual
        shape={data.shape ?? "rectangle"}
        width={width}
        height={height}
        fill={data.color ?? NODE_COLORS[0].fill}
        label={isEditing ? undefined : data.label || "Untitled"}
        selected={selected}
        onDoubleClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          setDraftLabel(data.label ?? "")
          setIsEditing(true)
        }}
      />
      {isEditing && (
        <textarea
          autoFocus
          value={draftLabel}
          onChange={handleLabelChange}
          onBlur={finishEditing}
          onKeyDown={handleLabelKeyDown}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          className="nodrag nopan absolute inset-1 z-20 resize-none overflow-hidden rounded-md border border-accent-primary bg-surface/90 px-3 py-2 text-center text-sm leading-tight text-copy-primary outline-none"
          placeholder="Untitled"
          aria-label="Node label"
          style={{ inset: 6 }}
        />
      )}
    </>
  )
}

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
  })
  const { screenToFlowPosition } = useReactFlow()
  const nodeCounter = useRef(0)
  const [draggingShape, setDraggingShape] = useState<ShapeDragPayload | null>(null)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null)

  const migrateLegacyFlowStorage = useMutation(({ storage }) => {
    const storedFlow = storage.get("flow") as unknown

    if (!storedFlow || typeof storedFlow !== "object") {
      return
    }

    const flow = storedFlow as {
      get?: unknown
      set?: unknown
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

    const liveFlow = flow as {
      get: (key: "nodes" | "edges") => unknown
      set: (key: "nodes" | "edges", value: unknown) => void
    }

    const nodes = liveFlow.get("nodes") as unknown
    const edges = liveFlow.get("edges") as unknown

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

      liveFlow.set("nodes", migratedNodes)
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

      liveFlow.set("edges", migratedEdges)
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

  const handleShapeDragStart = (event: ReactDragEvent<HTMLButtonElement>, shape: CanvasNodeShape) => {
    const option = NODE_SHAPES.find((item) => item.name === shape)
    const payload: ShapeDragPayload = {
      type: "shape",
      shape,
      size: option?.size ?? { width: 180, height: 90 },
    }

    event.dataTransfer.effectAllowed = "copy"
    event.dataTransfer.setData("application/x-systemeta-shape", JSON.stringify(payload))
    setDraggingShape(payload)
    setDragPreview({ x: event.clientX, y: event.clientY })
  }

  const handleDragOver = useCallback((event: ReactDragEvent<HTMLDivElement>) => {
    if (event.dataTransfer.types.includes("application/x-systemeta-shape")) {
      event.preventDefault()
      event.dataTransfer.dropEffect = "copy"
      setDragPreview({ x: event.clientX, y: event.clientY })
    }
  }, [])

  useEffect(() => {
    if (!draggingShape) {
      return
    }

    const handleWindowDragOver = (event: globalThis.DragEvent) => {
      if (!event.dataTransfer || !event.dataTransfer.types.includes("application/x-systemeta-shape")) {
        return
      }

      event.preventDefault()
      setDragPreview({ x: event.clientX, y: event.clientY })
    }

    const clearDragPreview = () => {
      setDraggingShape(null)
      setDragPreview(null)
    }

    window.addEventListener("dragover", handleWindowDragOver, true)
    window.addEventListener("dragend", clearDragPreview, true)

    return () => {
      window.removeEventListener("dragover", handleWindowDragOver, true)
      window.removeEventListener("dragend", clearDragPreview, true)
    }
  }, [draggingShape])

  const handleDragEnd = useCallback(() => {
    setDraggingShape(null)
    setDragPreview(null)
  }, [])

  const handleDrop = useCallback(
    (event: ReactDragEvent<HTMLDivElement>) => {
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

      setDraggingShape(null)
      setDragPreview(null)
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
        nodeTypes={canvasNodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background color="#333" gap={16} size={1} />
        <Controls position="bottom-left" className="canvas-controls" />
        <MiniMap position="bottom-right" className="canvas-minimap" />
      </ReactFlow>

      {draggingShape && dragPreview && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2" style={{ left: dragPreview.x, top: dragPreview.y }}>
          <ShapeVisual
            shape={draggingShape.shape}
            width={draggingShape.size.width}
            height={draggingShape.size.height}
            fill={NODE_COLORS[0].fill}
            label=""
            preview
          />
        </div>
      )}

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 rounded-full border border-surface-border bg-surface/85 px-3 py-2 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2">
          {NODE_SHAPES.map((shape) => (
            <button
              key={shape.name}
              type="button"
              draggable
              onDragStart={(event) => handleShapeDragStart(event, shape.name)}
              onDragEnd={handleDragEnd}
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
