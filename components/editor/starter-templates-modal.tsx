"use client"

import { Button } from "@/components/ui/button"
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

        return <line key={edge.id} x1={sourceX} y1={sourceY} x2={targetX} y2={targetY} stroke="#cbd5e1" strokeWidth={1.5} strokeLinecap="round" opacity={0.9} />
      })}

      {template.nodes.map((node) => {
        const nodeWidth = (node.data.size?.width ?? 160) * scale
        const nodeHeight = (node.data.size?.height ?? 90) * scale
        const x = (node.position.x - bounds.minX) * scale + padding
        const y = (node.position.y - bounds.minY) * scale + padding
        const fill = node.data.backgroundColor ?? "#1F1F1F"
        const textColor = node.data.textColor ?? "#EDEDED"
        const label = node.data.label ?? "Untitled"

        const commonProps = {
          fill,
          stroke: "rgba(255,255,255,0.6)",
          strokeWidth: 1.1,
        }

        return (
          <g key={node.id}>
            {node.data.shape === "circle" ? (
              <ellipse cx={x + nodeWidth / 2} cy={y + nodeHeight / 2} rx={nodeWidth / 2} ry={nodeHeight / 2} {...commonProps} />
            ) : null}
            {node.data.shape === "diamond" ? (
              <polygon points={`${x + nodeWidth / 2},${y} ${x + nodeWidth},${y + nodeHeight / 2} ${x + nodeWidth / 2},${y + nodeHeight} ${x},${y + nodeHeight / 2}`} {...commonProps} />
            ) : null}
            {node.data.shape === "hexagon" ? (
              <polygon points={`${x + 20},${y} ${x + nodeWidth - 20},${y} ${x + nodeWidth},${y + nodeHeight / 2} ${x + nodeWidth - 20},${y + nodeHeight} ${x + 20},${y + nodeHeight} ${x},${y + nodeHeight / 2}`} {...commonProps} />
            ) : null}
            {node.data.shape === "cylinder" ? (
              <>
                <ellipse cx={x + nodeWidth / 2} cy={y} rx={nodeWidth / 2} ry={nodeHeight * 0.22} {...commonProps} />
                <rect x={x} y={y} width={nodeWidth} height={nodeHeight} rx={16} fill={fill} stroke="rgba(255,255,255,0.6)" strokeWidth={1.1} />
                <path d={`M ${x} ${y + nodeHeight * 0.22} Q ${x + nodeWidth / 2} ${y + nodeHeight * 0.42} ${x + nodeWidth} ${y + nodeHeight * 0.22}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.1} />
                <path d={`M ${x} ${y + nodeHeight * 0.78} Q ${x + nodeWidth / 2} ${y + nodeHeight * 0.96} ${x + nodeWidth} ${y + nodeHeight * 0.78}`} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={1.1} />
              </>
            ) : null}
            {node.data.shape === "pill" ? (
              <rect x={x} y={y} width={nodeWidth} height={nodeHeight} rx={nodeHeight / 2} {...commonProps} />
            ) : null}
            {node.data.shape === undefined || node.data.shape === "rectangle" ? (
              <rect x={x} y={y} width={nodeWidth} height={nodeHeight} rx={16} {...commonProps} />
            ) : null}
            <text x={x + nodeWidth / 2} y={y + nodeHeight / 2 + 4} fill={textColor} fontSize={10} textAnchor="middle" fontWeight={600}>{label}</text>
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
        className="max-h-[76vh] overflow-hidden rounded-[24px] border border-surface-border bg-[#111318]/96 p-0 shadow-[0_18px_56px_rgba(0,0,0,0.45)] backdrop-blur-md"
        style={{ width: "min(62vw, 960px)", maxWidth: "960px" }}
      >
        <div className="flex max-h-[76vh] flex-col">
          <div className="border-b border-surface-border px-5 py-4 sm:px-6">
            <DialogHeader className="space-y-2 text-left">
              <DialogTitle className="text-[clamp(1.7rem,2vw,2.4rem)] font-semibold tracking-[-0.04em] text-copy-primary">
                Starter templates
              </DialogTitle>
              <DialogDescription className="max-w-3xl text-base leading-relaxed text-copy-secondary">
                Start from a pre-built architecture instead of drawing from scratch.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="flex-1 overflow-hidden p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {CANVAS_TEMPLATES.map((template) => (
                <article
                  key={template.id}
                  className="flex min-w-[260px] flex-col overflow-hidden rounded-[20px] border border-surface-border bg-surface-elevated/80 shadow-[0_6px_20px_rgba(15,23,42,0.12)] transition-colors hover:border-accent-primary/40"
                >
                  <div className="p-3 pb-2">
                    <TemplatePreview template={template} />
                  </div>

                  <div className="flex flex-1 flex-col gap-3 px-4 pb-4 pt-2">
                    <div className="space-y-1.5">
                      <h3 className="text-[1.05rem] font-semibold text-copy-primary sm:text-[1.2rem]">
                        {template.name}
                      </h3>
                      <p className="text-[0.92rem] leading-relaxed text-copy-secondary break-words">
                        {template.description}
                      </p>
                    </div>

                    <Button
                      type="button"
                      className="mt-auto h-10 w-full rounded-xl text-sm font-medium"
                      onClick={() => {
                        onImport(template)
                        onClose()
                      }}
                    >
                      Import template
                    </Button>
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
