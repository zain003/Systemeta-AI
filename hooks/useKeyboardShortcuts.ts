import { useEffect } from "react"
import type { ReactFlowInstance } from "@xyflow/react"

interface UseKeyboardShortcutsOptions {
  reactFlow: Pick<ReactFlowInstance, "zoomIn" | "zoomOut" | "fitView"> | null
  handleUndo: () => void
  handleRedo: () => void
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  const tagName = target.tagName

  return tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT" || tagName === "BUTTON"
}

export function useKeyboardShortcuts({ reactFlow, handleUndo, handleRedo }: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key === "+" || event.key === "=") {
        event.preventDefault()
        reactFlow?.zoomIn({ duration: 180 })
        return
      }

      if (event.key === "-") {
        event.preventDefault()
        reactFlow?.zoomOut({ duration: 180 })
        return
      }

      const isModifierPressed = event.ctrlKey || event.metaKey

      if (isModifierPressed && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
        return
      }

      if (isModifierPressed && event.key.toLowerCase() === "y") {
        event.preventDefault()
        handleRedo()
        return
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [handleRedo, handleUndo, reactFlow])
}
