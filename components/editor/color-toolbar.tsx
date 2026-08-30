"use client"

import { NODE_COLORS } from "@/types/canvas"
import { MouseEvent } from "react"

interface ColorToolbarProps {
  x: number
  y: number
  currentBackgroundColor?: string
  onColorSelect: (backgroundColor: string, textColor: string) => void
  isVisible?: boolean
}

export function ColorToolbar({ x, y, currentBackgroundColor, onColorSelect, isVisible = true }: ColorToolbarProps) {
  if (!isVisible) {
    return null
  }

  const handleSwatchClick = (event: MouseEvent<HTMLButtonElement>, backgroundColor: string, textColor: string) => {
    event.preventDefault()
    event.stopPropagation()
    onColorSelect(backgroundColor, textColor)
  }

  // Calculate toolbar width (8 swatches × 32px + gaps + padding)
  const toolbarWidth = 280
  const safeX = Math.max(140, Math.min(x, window.innerWidth - 140))

  return (
    <div
      className="pointer-events-auto fixed rounded-lg border border-surface-border bg-surface/95 px-3 py-2 shadow-2xl backdrop-blur-sm"
      style={{
        left: `${safeX}px`,
        top: `${y}px`,
        transform: "translateX(-50%) translateY(-100%) translateY(-20px)",
        zIndex: 30,
        visibility: isVisible ? "visible" : "hidden",
        pointerEvents: isVisible ? "auto" : "none",
        willChange: "transform",
        maxWidth: `${toolbarWidth}px`,
      }}
    >
      <div className="flex gap-2">
        {NODE_COLORS.map((color) => {
          const isActive = currentBackgroundColor === color.fill

          return (
            <button
              key={color.name}
              type="button"
              onClick={(event) => handleSwatchClick(event, color.fill, color.text)}
              className="nodrag nopan flex-shrink-0 h-8 w-8 rounded-full border-2 transition-all hover:scale-125"
              style={{
                backgroundColor: color.fill,
                borderColor: isActive ? color.text : "rgba(255, 255, 255, 0.15)",
                boxShadow: isActive
                  ? `0 0 16px ${color.text}, inset 0 0 0 1.5px ${color.text}`
                  : `0 0 2px rgba(0, 0, 0, 0.5)`,
                cursor: "pointer",
              }}
              title={color.name}
              aria-label={`${color.name} color`}
              onMouseDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
              onPointerDown={(event) => {
                event.preventDefault()
                event.stopPropagation()
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
