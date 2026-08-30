"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type CanvasSaveStatus = "idle" | "saving" | "saved" | "error"

interface UseCanvasAutosaveOptions {
  projectId?: string
  nodes: unknown[]
  edges: unknown[]
  enabled?: boolean
  debounceMs?: number
}

export function useCanvasAutosave({
  projectId,
  nodes,
  edges,
  enabled = true,
  debounceMs = 700,
}: UseCanvasAutosaveOptions) {
  const [status, setStatus] = useState<CanvasSaveStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const lastSnapshotRef = useRef<string>("")
  const isSavingRef = useRef(false)

  const saveNow = useCallback(async () => {
    if (!enabled || !projectId) {
      return false
    }

    const nextSnapshot = JSON.stringify({ nodes, edges })

    if (isSavingRef.current && lastSnapshotRef.current === nextSnapshot) {
      return false
    }

    isSavingRef.current = true
    setStatus("saving")
    setError(null)

    try {
      const response = await fetch(`/api/projects/${projectId}/canvas`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: nextSnapshot,
      })

      if (!response.ok) {
        let message = "Unable to save canvas"
        try {
          const payload = (await response.json()) as { error?: string }
          message = payload.error ?? message
        } catch {
          // ignore JSON parsing fallback
        }

        throw new Error(message)
      }

      lastSnapshotRef.current = nextSnapshot
      setStatus("saved")
      return true
    } catch (saveError) {
      setStatus("error")
      setError(saveError instanceof Error ? saveError.message : "Unable to save canvas")
      return false
    } finally {
      isSavingRef.current = false
    }
  }, [edges, enabled, nodes, projectId])

  useEffect(() => {
    if (!enabled || !projectId) {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
      return
    }

    const hasContent = nodes.length > 0 || edges.length > 0

    if (!hasContent && !lastSnapshotRef.current) {
      return
    }

    const nextSnapshot = JSON.stringify({ nodes, edges })

    if (nextSnapshot === lastSnapshotRef.current) {
      return
    }

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = window.setTimeout(() => {
      void saveNow()
    }, debounceMs)

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [debounceMs, edges, enabled, nodes, projectId, saveNow])

  return {
    status,
    error,
    saveNow,
  }
}
