"use client"

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
} from "@xyflow/react"
import { useMutation } from "@liveblocks/react"
import { useState, useRef, useEffect, type ChangeEvent, type KeyboardEvent } from "react"
import type { CanvasEdge } from "@/types/canvas"

const EDGE_MARKER_ID_PREFIX = "arrowhead-marker-"

export function CanvasEdgeRenderer(props: EdgeProps<CanvasEdge>) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
  } = props

  const [isEditingLabel, setIsEditingLabel] = useState(false)
  const [draftLabel, setDraftLabel] = useState(data?.label ?? "")
  const [isHovered, setIsHovered] = useState(false)
  const labelInputRef = useRef<HTMLInputElement>(null)

  const updateEdgeData = useMutation(({ storage }, update: { id: string; label: string }) => {
    const flow = storage.get("flow") as unknown

    if (!flow || typeof flow !== "object" || !(flow as { get?: unknown }).get || typeof (flow as { get: unknown }).get !== "function") {
      return
    }

    const edge = (flow as { get: (key: "edges") => { get: (id: string) => { set: (key: string, value: unknown) => void } | undefined } }).get("edges").get(update.id)

    if (edge) {
      edge.set("data", { label: update.label })
    }
  }, [])

  const handleLabelChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextLabel = event.target.value
    setDraftLabel(nextLabel)
    updateEdgeData({ id, label: nextLabel })
  }

  const handleLabelKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      event.preventDefault()
      event.stopPropagation()
      setDraftLabel(data?.label ?? "")
      setIsEditingLabel(false)
    } else if (event.key === "Enter") {
      event.preventDefault()
      event.stopPropagation()
      setIsEditingLabel(false)
    }
  }

  const finishEditing = () => {
    setIsEditingLabel(false)
    if (draftLabel !== (data?.label ?? "")) {
      updateEdgeData({ id, label: draftLabel })
    }
  }

  const handleDoubleClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    setDraftLabel(data?.label ?? "")
    setIsEditingLabel(true)
  }

  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus()
      labelInputRef.current.select()
    }
  }, [isEditingLabel])

  // Get the path for the edge with orthogonal routing
  // Creates strict right-angle routing like draw.io with sharp corners
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 0,
  })

  // Determine edge styling - more prominent dimming/brightening
  const isActive = selected || isHovered
  const strokeColor = isActive ? "#f1f5f9" : "#cbd5e1"
  const strokeWidth = isActive ? 2 : 1.5
  const baseOpacity = isActive ? 1 : 0.6
  const markerId = `${EDGE_MARKER_ID_PREFIX}${id}`

  return (
    <>
      {/* SVG markers definition - must be in main SVG context */}
      <defs>
        <marker
          id={markerId}
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <path
            d="M0,0 L0,6 L9,3 z"
            fill={strokeColor}
            opacity={baseOpacity}
            style={{
              transition: "all 200ms ease-in-out",
            }}
          />
        </marker>
      </defs>

      {/* Edge path with arrowhead */}
      <BaseEdge
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          opacity: baseOpacity,
          transition: "all 200ms ease-in-out",
          markerEnd: `url(#${markerId})`,
        }}
        interactionWidth={18}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleDoubleClick}
      />

      {/* Edge label using EdgeLabelRenderer */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan"
        >
          {isEditingLabel ? (
            <input
              ref={labelInputRef}
              type="text"
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
              onClick={(event) => {
                event.stopPropagation()
              }}
              className="rounded-full border border-accent-primary bg-surface/95 px-2 py-1 text-xs font-medium text-copy-primary outline-none shadow-lg"
              placeholder="Add label..."
              aria-label="Edge label"
            />
          ) : data?.label && data.label.trim() ? (
            <div
              className="nodrag nopan cursor-pointer rounded-full border border-surface-border bg-surface/85 px-2 py-1 text-xs font-medium text-copy-primary shadow-md transition hover:border-accent-primary hover:bg-surface-elevated"
              onDoubleClick={handleDoubleClick}
              onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
            >
              {data.label}
            </div>
          ) : !isEditingLabel && isActive ? (
            <div
              className="nodrag nopan cursor-pointer text-xs font-medium text-copy-tertiary transition"
              onDoubleClick={handleDoubleClick}
              onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
            >
              Add label...
            </div>
          ) : null}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}
