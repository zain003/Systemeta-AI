"use client"

import { Background, Controls, MiniMap, ConnectionMode, ReactFlow } from "@xyflow/react"
import { useLiveblocksFlow } from "@liveblocks/react-flow"

import type { CanvasEdge, CanvasNode } from "@/types/canvas"

import "@xyflow/react/dist/style.css"

export function Canvas() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useLiveblocksFlow<CanvasNode, CanvasEdge>({
    suspense: true,
  })

  return (
    <div className="h-full w-full flex-1">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        connectionMode={ConnectionMode.Loose}
        fitView
      >
        <Background color="#333" gap={16} size={1} />
        <Controls className="bg-surface border border-surface-border rounded-lg" />
        <MiniMap className="bg-surface border border-surface-border rounded-lg" />
      </ReactFlow>
    </div>
  )
}
