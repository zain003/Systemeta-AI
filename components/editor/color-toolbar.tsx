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

  // Calculate safe X coordinate for 340px width panel so it stays in viewport
  const safeX = typeof window !== "undefined" ? Math.max(180, Math.min(x, window.innerWidth - 180)) : x

  return (
    <div
      className="pointer-events-auto fixed rounded-[14px] border border-white/[0.08] bg-[#111318] px-3 py-2 shadow-[0_8px_24px_rgba(0,0,0,0.4),0_0_20px_rgba(53,224,208,0.12)] backdrop-blur-xl"
      style={{
        left: `${safeX}px`,
        top: `${y}px`,
        transform: "translateX(-50%) translateY(-100%) translateY(-16px)",
        zIndex: 35,
        visibility: isVisible ? "visible" : "hidden",
        pointerEvents: isVisible ? "auto" : "none",
        willChange: "transform",
        width: "max-content",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <div className="flex items-center gap-2">
        {NODE_COLORS.map((color) => {
          const isActive = currentBackgroundColor === color.fill

          return (
            <button
              key={color.name}
              type="button"
              onClick={(event) => handleSwatchClick(event, color.fill, color.text)}
              className="nodrag nopan h-7 w-7 shrink-0 rounded-full border-2 transition-all hover:scale-125 active:scale-95"
              style={{
                backgroundColor: color.fill,
                borderColor: isActive ? color.text : "rgba(255, 255, 255, 0.18)",
                boxShadow: isActive
                  ? `0 0 16px ${color.text}, inset 0 0 0 1.5px ${color.text}`
                  : `0 0 4px rgba(0, 0, 0, 0.5)`,
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
