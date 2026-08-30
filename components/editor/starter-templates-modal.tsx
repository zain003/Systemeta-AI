"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CANVAS_TEMPLATES, type CanvasTemplate } from "@/components/editor/starter-templates"
import { type CanvasNode } from "@/types/canvas"

interface StarterTemplatesModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (template: CanvasTemplate) => void
}

function getTemplateBounds(nodes: CanvasNode[]) {
  if (nodes.length === 0) {
    return { minX: 0, minY: 0, width: 1, height: 1 }
  }

  const widths = nodes.map((node) => node.position.x + (node.data.size?.width ?? 160))
  const heights = nodes.map((node) => node.position.y + (node.data.size?.height ?? 90))
  const minX = Math.min(...nodes.map((node) => node.position.x))
  const minY = Math.min(...nodes.map((node) => node.position.y))
  const maxX = Math.max(...widths)
  const maxY = Math.max(...heights)

  return {
    minX,
    minY,
    width: maxX - minX || 1,
    height: maxY - minY || 1,
  }
}

function TemplatePreview({ template }: { template: CanvasTemplate }) {
  const bounds = getTemplateBounds(template.nodes)
  const padding = 24
  const width = 240
  const height = 160
  const scale = Math.min((width - padding * 2) / Math.max(bounds.width, 1), (height - padding * 2) / Math.max(bounds.height, 1), 1)

  const nodeMap = new Map(template.nodes.map((node) => [node.id, node]))

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-[170px] w-full rounded-[18px] border border-surface-border bg-[#14181d] shadow-inner shadow-black/10">
      <defs>
        <marker
          id="template-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="5"
          markerHeight="5"
          orient="auto"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#cbd5e1" />
        </marker>
      </defs>

      {template.edges.map((edge) => {
        const source = nodeMap.get(edge.source)
        const target = nodeMap.get(edge.target)

        if (!source || !target) {
          return null
        }

        const sourceWidth = source.data.size?.width ?? 160
        const sourceHeight = source.data.size?.height ?? 90
        const targetWidth = target.data.size?.width ?? 160
        const targetHeight = target.data.size?.height ?? 90

        const sourceX = (source.position.x - bounds.minX) * scale + padding + sourceWidth * scale / 2
        const sourceY = (source.position.y - bounds.minY) * scale + padding + sourceHeight * scale / 2
        const targetX = (target.position.x - bounds.minX) * scale + padding + targetWidth * scale / 2
        const targetY = (target.position.y - bounds.minY) * scale + padding + targetHeight * scale / 2

        return (
          <line
            key={edge.id}
            x1={sourceX}
            y1={sourceY}
            x2={targetX}
            y2={targetY}
            stroke="#cbd5e1"
            strokeWidth={2}
            opacity={1}
            markerEnd="url(#template-arrow)"
          />
        )
      })}

      {template.nodes.map((node) => {
        const nodeWidth = (node.data.size?.width ?? 160) * scale
        const nodeHeight = (node.data.size?.height ?? 90) * scale
        const x = (node.position.x - bounds.minX) * scale + padding
        const y = (node.position.y - bounds.minY) * scale + padding
        const fill = node.data.backgroundColor ?? "#1F1F1F"
        const textColor = node.data.textColor ?? "#EDEDED"
        const label = node.data.label ?? "Untitled"
        const shape = node.data.shape ?? "rectangle"

        const commonProps = {
          fill,
          stroke: "rgba(255,255,255,0.6)",
          strokeWidth: 1.5,
        }

        // Render shape based on type
        let shapeElement: React.ReactNode = null
        
        if (shape === "circle") {
          shapeElement = (
            <ellipse
              cx={x + nodeWidth / 2}
              cy={y + nodeHeight / 2}
              rx={nodeWidth / 2}
              ry={nodeHeight / 2}
              {...commonProps}
            />
          )
        } else if (shape === "diamond") {
          shapeElement = (
            <polygon
              points={`${x + nodeWidth / 2},${y} ${x + nodeWidth},${y + nodeHeight / 2} ${x + nodeWidth / 2},${y + nodeHeight} ${x},${y + nodeHeight / 2}`}
              {...commonProps}
            />
          )
        } else if (shape === "hexagon") {
          const offset = Math.min(nodeWidth * 0.25, 20)
          shapeElement = (
            <polygon
              points={`${x + offset},${y} ${x + nodeWidth - offset},${y} ${x + nodeWidth},${y + nodeHeight / 2} ${x + nodeWidth - offset},${y + nodeHeight} ${x + offset},${y + nodeHeight} ${x},${y + nodeHeight / 2}`}
              {...commonProps}
            />
          )
        } else if (shape === "cylinder") {
          const topHeight = nodeHeight * 0.15
          shapeElement = (
            <>
              <ellipse
                cx={x + nodeWidth / 2}
                cy={y + topHeight}
                rx={nodeWidth / 2}
                ry={topHeight}
                {...commonProps}
              />
              <rect
                x={x}
                y={y + topHeight}
                width={nodeWidth}
                height={nodeHeight - topHeight * 2}
                fill={fill}
                stroke="none"
              />
              <ellipse
                cx={x + nodeWidth / 2}
                cy={y + nodeHeight - topHeight}
                rx={nodeWidth / 2}
                ry={topHeight}
                fill={fill}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={1.5}
              />
              <line
                x1={x}
                y1={y + topHeight}
                x2={x}
                y2={y + nodeHeight - topHeight}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={1.5}
              />
              <line
                x1={x + nodeWidth}
                y1={y + topHeight}
                x2={x + nodeWidth}
                y2={y + nodeHeight - topHeight}
                stroke="rgba(255,255,255,0.6)"
                strokeWidth={1.5}
              />
            </>
          )
        } else if (shape === "pill") {
          shapeElement = (
            <rect
              x={x}
              y={y}
              width={nodeWidth}
              height={nodeHeight}
              rx={nodeHeight / 2}
              {...commonProps}
            />
          )
        } else {
          // Default rectangle
          shapeElement = (
            <rect
              x={x}
              y={y}
              width={nodeWidth}
              height={nodeHeight}
              rx={8}
              {...commonProps}
            />
          )
        }

        return (
          <g key={node.id}>
            {shapeElement}
            <text
              x={x + nodeWidth / 2}
              y={y + nodeHeight / 2}
              fill={textColor}
              fontSize={10}
              textAnchor="middle"
              dominantBaseline="middle"
              fontWeight={600}
            >
              {label}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function StarterTemplatesModal({ isOpen, onClose, onImport }: StarterTemplatesModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
      }
    }}>
      <DialogContent
        className="glow-dialog-panel max-h-[82vh] overflow-hidden rounded-2xl p-0"
        style={{ width: "min(68vw, 1000px)", maxWidth: "1000px" }}
      >
        <div className="flex max-h-[82vh] flex-col">
          <div className="border-b border-white/[0.08] px-6 py-4">
            <DialogHeader className="space-y-1 text-left">
              <DialogTitle className="text-lg font-semibold text-[#eef1f3]">
                Starter Templates
              </DialogTitle>
              <DialogDescription className="text-xs text-[#98a1ab]">
                Select a pre-built cloud architecture to import directly onto your canvas.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {CANVAS_TEMPLATES.map((template) => (
                <article
                  key={template.id}
                  className="flex min-w-[240px] flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3 transition-all hover:border-[#35e0d0]/40 hover:shadow-[0_0_24px_rgba(53,224,208,0.12)]"
                >
                  <div className="pb-2">
                    <TemplatePreview template={template} />
                  </div>

                  <div className="flex flex-1 flex-col gap-3 px-1 pb-1 pt-1">
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-[#eef1f3]">
                        {template.name}
                      </h3>
                      <p className="text-xs leading-relaxed text-[#98a1ab] break-words">
                        {template.description}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="glow-btn-cyan mt-auto flex h-9 w-full items-center justify-center rounded-xl text-xs font-semibold"
                      onClick={() => {
                        onImport(template)
                        onClose()
                      }}
                    >
                      Import template
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
