"use client"

import {
  Background,
  Handle,
  MiniMap,
  NodeResizeControl,
  ConnectionMode,
  Position,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type NodeProps,
} from "@xyflow/react"
import { LiveList, LiveMap, LiveObject, type LsonObject } from "@liveblocks/core"
import { useCanRedo, useCanUndo, useMutation, useRedo, useUndo } from "@liveblocks/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"
import { Minus, Plus, Redo2, ScanSearch, Undo2 } from "lucide-react"
import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent as ReactDragEvent, type KeyboardEvent, type MouseEvent } from "react"
import { createPortal } from "react-dom"

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"

import {
  NODE_COLORS,
  NODE_SHAPES,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeData,
  type CanvasNodeShape,
} from "@/types/canvas"
import { ColorToolbar } from "@/components/editor/color-toolbar"
import { CanvasEdgeRenderer } from "@/components/editor/canvas-edge"
import type { CanvasTemplate } from "@/components/editor/starter-templates"

import "@xyflow/react/dist/style.css"

interface ConnectionState {
  active: boolean
  sourceNodeId: string | null
  sourceHandleId: string | null
}

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
  textColor?: string
  label?: string
  selected?: boolean
  preview?: boolean
  onDoubleClick?: (event: MouseEvent<HTMLDivElement>) => void
}

function ShapeVisual({ shape, width, height, fill, textColor, label, selected = false, preview = false, onDoubleClick }: ShapeVisualProps) {
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
      >
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {shape === "cylinder" && <ellipse cx="50" cy="16" rx="45" ry="8" fill={fill} stroke={stroke} strokeWidth={selected ? 2 : 1.5} />}
          <path d={path} fill={fill} stroke={stroke} strokeWidth={selected ? 2 : 1.5} vectorEffect="non-scaling-stroke" />
          {shape === "cylinder" && <path d="M 5 84 C 5 92 95 92 95 84" fill="none" stroke={stroke} strokeWidth={selected ? 2 : 1.5} vectorEffect="non-scaling-stroke" />}
        </svg>
        {label && <ShapeLabel label={label} textColor={textColor} />}
      </div>
    )
  }

  return (
    <div
      className={`relative flex items-center justify-center border-2 text-center font-medium shadow-lg ${preview ? "opacity-65" : ""}`}
      style={{
        width,
        height,
        background: `linear-gradient(135deg, ${fill}, rgba(15, 23, 42, 0.92))`,
        borderColor: stroke,
        color: textColor || "#ffffff",
        boxShadow: selected ? `0 0 0 2px ${fill}` : "0 12px 24px rgba(15, 23, 42, 0.24)",
        borderRadius: shape === "circle" || shape === "pill" ? "9999px" : "16px",
      }}
      onDoubleClick={onDoubleClick}
    >
      {label && <ShapeLabel label={label} textColor={textColor} />}
    </div>
  )
}

function ShapeLabel({ label, textColor }: { label: string; textColor?: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-3 text-center text-sm leading-tight tracking-wide"
      style={{ color: textColor || "#ffffff" }}
    >
      {label}
    </div>
  )
}

function CanvasNodeRenderer({
  id,
  data,
  selected,
  width: measuredWidth,
  height: measuredHeight,
  connectionState,
}: NodeProps<CanvasNode> & { connectionState?: ConnectionState }) {
  const option = NODE_SHAPES.find((item) => item.name === data.shape) ?? NODE_SHAPES[0]
  const [isEditing, setIsEditing] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data.label ?? "")
  const [hoveredTargetHandle, setHoveredTargetHandle] = useState<string | null>(null)
  const [toolbarPos, setToolbarPos] = useState<{ x: number; y: number } | null>(null)
  const nodeContainerRef = useRef<HTMLDivElement>(null)

  // Update toolbar position whenever the node is selected or properties change
  const updateToolbarPosition = useCallback(() => {
    if (selected && nodeContainerRef.current) {
      const rect = nodeContainerRef.current.getBoundingClientRect()
      // Only set if container is visible in viewport
      if (rect.width > 0 && rect.height > 0) {
        setToolbarPos({
          x: rect.left + rect.width / 2,
          y: rect.top,
        })
      }
    }
  }, [selected])

  // Update position on selection, mount, and periodically while selected
  useEffect(() => {
    updateToolbarPosition()

    if (!selected) {
      return
    }

    // Update position on window resize
    const handleResize = () => updateToolbarPosition()
    window.addEventListener("resize", handleResize)

    // Use animation frame to update position continuously while panning/zooming
    let animationFrameId: number
    const updateLoop = () => {
      updateToolbarPosition()
      animationFrameId = requestAnimationFrame(updateLoop)
    }
    animationFrameId = requestAnimationFrame(updateLoop)

    return () => {
      window.removeEventListener("resize", handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [selected, updateToolbarPosition])

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

  const handleColorChange = (backgroundColor: string, textColor: string) => {
    updateNodeData({
      id,
      data: {
        ...data,
        backgroundColor,
        textColor,
      },
    })
  }

  const finishEditing = () => {
    setIsEditing(false)
    if (draftLabel !== (data.label ?? "")) {
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
      setDraftLabel(data.label ?? "")
      setIsEditing(false)
    }
  }

  const handleResize = useCallback(
    (_event: unknown, params: { width: number; height: number }) => {
      const nextSize = {
        width: Math.max(80, params.width),
        height: Math.max(50, params.height),
      }
      updateNodeData({ id, data: { ...data, size: nextSize } })
    },
    [data, id, updateNodeData],
  )

  const width = measuredWidth ?? data.size?.width ?? option.size.width
  const height = measuredHeight ?? data.size?.height ?? option.size.height
  const labelText = data.label?.trim() ? data.label : "Untitled"

  const renderHandle = (type: "source" | "target", position: Position, side: string) => {
    const handleId = `${id}-${type}-${side}`
    const isSourceNode = connectionState?.active && connectionState.sourceNodeId === id
    const isHovered = connectionState?.active && hoveredTargetHandle === handleId
    const isVisible = selected || isSourceNode || (connectionState?.active && type === "target") || isHovered
    const opacity = isHovered || selected || isSourceNode ? 1 : connectionState?.active ? 0.35 : 0.25

    return (
      <Handle
        key={`${type}-${side}`}
        id={handleId}
        type={type}
        position={position}
        isConnectable
        onMouseEnter={(event) => {
          if (type === "target" && connectionState?.active) {
            event.stopPropagation()
            setHoveredTargetHandle(handleId)
          }
        }}
        onMouseLeave={(event) => {
          if (type === "target" && connectionState?.active) {
            event.stopPropagation()
            if (hoveredTargetHandle === handleId) {
              setHoveredTargetHandle(null)
            }
          }
        }}
        className="!h-3 !w-3 !rounded-full !border-2 !border-white !bg-white"
        style={{
          opacity,
          visibility: isVisible ? "visible" : "hidden",
          boxShadow: isHovered || selected || isSourceNode ? "0 0 0 2px rgba(255,255,255,0.24)" : "none",
          transform: "translate(-50%, -50%)",
          zIndex: 30,
        }}
      />
    )
  }

  return (
    <div ref={nodeContainerRef}>
      {renderHandle("target", Position.Left, "left")}
      {renderHandle("source", Position.Left, "left")}
      {renderHandle("target", Position.Right, "right")}
      {renderHandle("source", Position.Right, "right")}
      {renderHandle("target", Position.Top, "top")}
      {renderHandle("source", Position.Top, "top")}
      {renderHandle("target", Position.Bottom, "bottom")}
      {renderHandle("source", Position.Bottom, "bottom")}
      {selected && (
        <>
          <NodeResizeControl
            position="top-left"
            minWidth={80}
            minHeight={50}
            keepAspectRatio
            color="#ffffff"
            style={{ width: 10, height: 10, borderRadius: "9999px", background: "#ffffff", border: "1px solid rgba(255,255,255,0.9)", cursor: "nwse-resize" }}
            onResize={handleResize}
          />
          <NodeResizeControl
            position="top-right"
            minWidth={80}
            minHeight={50}
            keepAspectRatio
            color="#ffffff"
            style={{ width: 10, height: 10, borderRadius: "9999px", background: "#ffffff", border: "1px solid rgba(255,255,255,0.9)", cursor: "nesw-resize" }}
            onResize={handleResize}
          />
          <NodeResizeControl
            position="bottom-left"
            minWidth={80}
            minHeight={50}
            keepAspectRatio
            color="#ffffff"
            style={{ width: 10, height: 10, borderRadius: "9999px", background: "#ffffff", border: "1px solid rgba(255,255,255,0.9)", cursor: "nesw-resize" }}
            onResize={handleResize}
          />
          <NodeResizeControl
            position="bottom-right"
            minWidth={80}
            minHeight={50}
            keepAspectRatio
            color="#ffffff"
            style={{ width: 10, height: 10, borderRadius: "9999px", background: "#ffffff", border: "1px solid rgba(255,255,255,0.9)", cursor: "nwse-resize" }}
            onResize={handleResize}
          />
          <NodeResizeControl
            position="left"
            minWidth={80}
            minHeight={50}
            resizeDirection="horizontal"
            color="transparent"
            style={{ width: 14, height: 14, border: "1px solid transparent", background: "transparent", cursor: "ew-resize", opacity: 0 }}
            onResize={handleResize}
          />
          <NodeResizeControl
            position="right"
            minWidth={80}
            minHeight={50}
            resizeDirection="horizontal"
            color="transparent"
            style={{ width: 14, height: 14, border: "1px solid transparent", background: "transparent", cursor: "ew-resize", opacity: 0 }}
            onResize={handleResize}
          />
          <NodeResizeControl
            position="top"
            minWidth={80}
            minHeight={50}
            resizeDirection="vertical"
            color="transparent"
            style={{ width: 14, height: 14, border: "1px solid transparent", background: "transparent", cursor: "ns-resize", opacity: 0 }}
            onResize={handleResize}
          />
          <NodeResizeControl
            position="bottom"
            minWidth={80}
            minHeight={50}
            resizeDirection="vertical"
            color="transparent"
            style={{ width: 14, height: 14, border: "1px solid transparent", background: "transparent", cursor: "ns-resize", opacity: 0 }}
            onResize={handleResize}
          />
        </>
      )}
      <ShapeVisual
        shape={data.shape ?? "rectangle"}
        width={width}
        height={height}
        fill={data.backgroundColor ?? NODE_COLORS[0].fill}
        textColor={data.textColor ?? NODE_COLORS[0].text}
        label={isEditing ? undefined : labelText}
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
          onMouseDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          onPointerDown={(event) => {
            event.preventDefault()
            event.stopPropagation()
          }}
          className="nodrag nopan absolute inset-1 z-20 resize-none overflow-hidden rounded-md border border-accent-primary bg-surface/90 px-3 py-2 text-center text-sm leading-tight text-copy-primary outline-none"
          placeholder="Untitled"
          aria-label="Node label"
          style={{ inset: 6 }}
        />
      )}
      {selected && toolbarPos &&
        createPortal(
          <ColorToolbar
            x={toolbarPos.x}
            y={toolbarPos.y}
            currentBackgroundColor={data.backgroundColor}
            onColorSelect={handleColorChange}
          />,
          document.body,
        )}
    </div>
  )
}

interface CanvasProps {
  pendingTemplate?: CanvasTemplate | null
  onTemplateHandled?: () => void
}

function NextLogoMark() {
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#111111] text-lg font-semibold text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]">
      N
    </div>
  )
}

function CanvasInner({ pendingTemplate, onTemplateHandled }: CanvasProps) {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
  })
  const reactFlow = useReactFlow()
  const { screenToFlowPosition } = reactFlow
  const canUndo = useCanUndo()
  const canRedo = useCanRedo()
  const undo = useUndo()
  const redo = useRedo()
  const nodeCounter = useRef(0)
  const [draggingShape, setDraggingShape] = useState<ShapeDragPayload | null>(null)
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null)
  const [connectionState, setConnectionState] = useState<ConnectionState>({
    active: false,
    sourceNodeId: null,
    sourceHandleId: null,
  })
  const canvasNodeTypes = useMemo(
    () => ({
      canvasNode: (props: NodeProps<CanvasNode>) => <CanvasNodeRenderer {...props} connectionState={connectionState} />,
    }),
    [connectionState],
  )

  const canvasEdgeTypes = useMemo(
    () => ({
      canvasEdge: CanvasEdgeRenderer,
    }),
    [],
  )

  // Wrap onConnect to ensure edges use the canvasEdge type
  const handleConnect = useCallback(
    (connection: { source: string; target: string; sourceHandle?: string | null; targetHandle?: string | null }) => {
      // Call the original onConnect, which handles edge creation via Liveblocks
      // The edge will be created with the canvasEdge type by default
      onConnect({
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle ?? null,
        targetHandle: connection.targetHandle ?? null,
      })
    },
    [onConnect],
  )

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
      const defaultColor = NODE_COLORS[0]
      const id = `${payload.shape}-${Date.now()}-${nodeCounter.current++}`

      const nextNode: CanvasNode = {
        id,
        type: "canvasNode",
        position,
        data: {
          label: "",
          backgroundColor: defaultColor.fill,
          textColor: defaultColor.text,
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

  const handleConnectStart = useCallback((_: unknown, params: { nodeId?: string | null; handleId?: string | null }) => {
    setConnectionState({
      active: true,
      sourceNodeId: params.nodeId ?? null,
      sourceHandleId: params.handleId ?? null,
    })
  }, [])

  const handleConnectEnd = useCallback(() => {
    setConnectionState({
      active: false,
      sourceNodeId: null,
      sourceHandleId: null,
    })
  }, [])

  const isValidConnection = useCallback((connection: { source: string; target: string; sourceHandleId?: string | null; targetHandleId?: string | null }) => {
    if (!connection.source || !connection.target) {
      return false
    }

    return connection.source !== connection.target
  }, [])

  const handleZoomIn = useCallback(() => {
    reactFlow?.zoomIn({ duration: 180 })
  }, [reactFlow])

  const handleZoomOut = useCallback(() => {
    reactFlow?.zoomOut({ duration: 180 })
  }, [reactFlow])

  const handleFitView = useCallback(() => {
    reactFlow?.fitView({ duration: 180, padding: 0.2 })
  }, [reactFlow])

  const handleUndo = useCallback(() => {
    if (canUndo) {
      undo()
    }
  }, [canUndo, undo])

  const handleRedo = useCallback(() => {
    if (canRedo) {
      redo()
    }
  }, [canRedo, redo])

  const importTemplate = useCallback(
    (template: CanvasTemplate) => {
      const currentNodes = nodes ?? []
      const currentEdges = edges ?? []

      onNodesChange(
        currentNodes.map((node) => ({
          type: "remove",
          id: node.id,
        })),
      )
      onEdgesChange(
        currentEdges.map((edge) => ({
          type: "remove",
          id: edge.id,
        })),
      )

      const nextNodes = template.nodes.map((node) => ({
        ...node,
        type: "canvasNode" as const,
      }))
      const nextEdges = template.edges.map((edge) => ({
        ...edge,
        type: "canvasEdge" as const,
      }))

      window.requestAnimationFrame(() => {
        onNodesChange(
          nextNodes.map((node) => ({
            type: "add",
            item: node,
          })),
        )
        onEdgesChange(
          nextEdges.map((edge) => ({
            type: "add",
            item: edge,
          })),
        )

        window.requestAnimationFrame(() => {
          reactFlow?.fitView({ duration: 180, padding: 0.25 })
        })
      })
    },
    [edges, nodes, onEdgesChange, onNodesChange, reactFlow],
  )

  useEffect(() => {
    if (!pendingTemplate) {
      return
    }

    importTemplate(pendingTemplate)
    onTemplateHandled?.()
  }, [importTemplate, onTemplateHandled, pendingTemplate])

  useKeyboardShortcuts({
    reactFlow,
    handleUndo,
    handleRedo,
  })

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
    <div className="relative h-full w-full flex-1 overflow-hidden" onDragOver={handleDragOver} onDrop={handleDrop}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onConnectStart={handleConnectStart}
        onConnectEnd={handleConnectEnd}
        isValidConnection={isValidConnection}
        nodeTypes={canvasNodeTypes}
        edgeTypes={canvasEdgeTypes}
        nodesConnectable
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background color="#333" gap={16} size={1} />
        <MiniMap position="bottom-right" className="canvas-minimap" />
      </ReactFlow>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-24">
        <div className="relative h-full w-full">
          <div className="pointer-events-auto absolute bottom-4 left-4 flex items-end gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-surface-border bg-surface/85 text-white shadow-lg backdrop-blur-sm">
              <NextLogoMark />
            </div>

            <div className="flex items-center overflow-hidden rounded-full border border-surface-border bg-surface/85 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-1 p-1">
                <button
                  type="button"
                  aria-label="Zoom out"
                  onClick={handleZoomOut}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-copy-primary transition hover:bg-surface-elevated hover:text-brand"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Fit view"
                  onClick={handleFitView}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-copy-primary transition hover:bg-surface-elevated hover:text-brand"
                >
                  <ScanSearch className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Zoom in"
                  onClick={handleZoomIn}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-copy-primary transition hover:bg-surface-elevated hover:text-brand"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              <div className="h-8 w-px bg-surface-border/80" />

              <div className="flex items-center gap-1 p-1">
                <button
                  type="button"
                  aria-label="Undo"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-copy-primary transition hover:bg-surface-elevated hover:text-brand disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-copy-primary"
                >
                  <Undo2 className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Redo"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-copy-primary transition hover:bg-surface-elevated hover:text-brand disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent disabled:hover:text-copy-primary"
                >
                  <Redo2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-surface-border bg-surface/85 px-3 py-2 shadow-lg backdrop-blur-sm">
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
      </div>

      {draggingShape && dragPreview && (
        <div className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2" style={{ left: dragPreview.x, top: dragPreview.y }}>
          <ShapeVisual
            shape={draggingShape.shape}
            width={draggingShape.size.width}
            height={draggingShape.size.height}
            fill={NODE_COLORS[0].fill}
            textColor={NODE_COLORS[0].text}
            label=""
            preview
          />
        </div>
      )}
    </div>
  )
}

export function Canvas({ pendingTemplate, onTemplateHandled }: CanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasInner pendingTemplate={pendingTemplate} onTemplateHandled={onTemplateHandled} />
    </ReactFlowProvider>
  )
}
