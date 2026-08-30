"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Download, FileText, Loader2, Sparkles } from "lucide-react"
import { useFeedMessages, useStorage } from "@liveblocks/react"
import { useRealtimeRun } from "@trigger.dev/react-hooks"

import { SpecPreviewDialog } from "@/components/editor/spec-preview-dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { specDownloadPath } from "@/lib/project-specs"
import { isValidAiChatMessage } from "@/types/tasks"

const AI_CHAT_FEED_ID = "ai-chat"

interface ProjectSpecItem {
  id: string
  createdAt: string
  filename: string
}

interface SpecsTabProps {
  projectId: string
  roomId: string
  isActive: boolean
}

function formatSpecCreatedAt(createdAt: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt))
}

function triggerSpecDownload(projectId: string, specId: string, filename: string) {
  const link = document.createElement("a")
  link.href = specDownloadPath(projectId, specId)
  link.download = filename
  link.rel = "noopener"
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export function SpecsTab({ projectId, roomId, isActive }: SpecsTabProps) {
  const [specs, setSpecs] = useState<ProjectSpecItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [selectedSpec, setSelectedSpec] = useState<ProjectSpecItem | null>(null)
  const [previewContent, setPreviewContent] = useState<string | null>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [previewError, setPreviewError] = useState<string | null>(null)

  const [isTriggering, setIsTriggering] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [specRunId, setSpecRunId] = useState<string | null>(null)
  const [specToken, setSpecToken] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const completedRunRef = useRef<string | null>(null)
  const flow = useStorage((root) => root.flow)
  const { messages: chatFeedMessages = [] } = useFeedMessages(AI_CHAT_FEED_ID)

  const { run: specRun } = useRealtimeRun(specRunId ?? undefined, {
    accessToken: specToken ?? undefined,
    enabled: !!specRunId && !!specToken,
    stopOnCompletion: true,
  })

  const specRunIsActive = useMemo(() => {
    if (!specRun) {
      return isTriggering
    }

    return !["CANCELED", "COMPLETED", "CRASHED", "FAILED", "EXPIRED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(
      specRun.status,
    )
  }, [specRun, isTriggering])

  useEffect(() => {
    if (
      !specRunId ||
      !specRun ||
      !["COMPLETED", "FAILED", "CRASHED", "CANCELED", "EXPIRED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(
        specRun.status,
      ) ||
      completedRunRef.current === specRunId
    ) {
      return
    }

    completedRunRef.current = specRunId
    const status = specRun.status

    queueMicrotask(() => {
      if (status === "COMPLETED") {
        setRefreshTrigger((prev) => prev + 1)
      } else {
        setGenerateError("Specification generation failed. Please try again.")
      }

      setSpecRunId(null)
      setSpecToken(null)
      setIsTriggering(false)
    })
  }, [specRun, specRunId])

  useEffect(() => {
    if (!isActive) {
      return
    }

    const controller = new AbortController()

    async function loadSpecs() {
      setIsLoading(true)
      setListError(null)

      try {
        const response = await fetch(`/api/projects/${projectId}/specs`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("The specification list could not be loaded.")
        }

        const payload = (await response.json()) as { specs?: ProjectSpecItem[] }

        if (!controller.signal.aborted) {
          setSpecs(Array.isArray(payload.specs) ? payload.specs : [])
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setListError(error instanceof Error ? error.message : "The specification list could not be loaded.")
          setSpecs([])
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    loadSpecs().catch(() => {
      // Error is handled in loadSpecs
    })

    return () => {
      controller.abort()
    }
  }, [isActive, projectId, refreshTrigger])

  useEffect(() => {
    if (!selectedSpec) {
      return
    }

    const controller = new AbortController()

    async function loadPreview(spec: ProjectSpecItem) {
      setIsPreviewLoading(true)
      setPreviewError(null)
      setPreviewContent(null)

      try {
        const response = await fetch(specDownloadPath(projectId, spec.id), {
          signal: controller.signal,
        })

        if (!response.ok) {
          throw new Error("The specification could not be loaded.")
        }

        const markdown = await response.text()
        setPreviewContent(markdown)
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        setPreviewError(error instanceof Error ? error.message : "The specification could not be loaded.")
      } finally {
        if (!controller.signal.aborted) {
          setIsPreviewLoading(false)
        }
      }
    }

    void loadPreview(selectedSpec)

    return () => {
      controller.abort()
    }
  }, [projectId, selectedSpec])

  const handleGenerateSpec = async () => {
    if (specRunIsActive || isTriggering) {
      return
    }

    setIsTriggering(true)
    setGenerateError(null)

    try {
      const nodesMap = flow?.nodes ?? {}
      const edgesMap = flow?.edges ?? {}

      const nodesArray = Object.values(nodesMap).map((node) => ({
        id: node.id,
        type: node.type,
        position: node.position,
        data: node.data,
      }))

      const edgesArray = Object.values(edgesMap).map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        animated: edge.animated,
      }))

      const chatHistory = chatFeedMessages.flatMap((msg) => {
        if (!isValidAiChatMessage(msg.data)) {
          return []
        }
        return [msg.data]
      })

      const specResponse = await fetch("/api/ai/spec", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId,
          chatHistory,
          nodes: nodesArray,
          edges: edgesArray,
        }),
      })

      if (!specResponse.ok) {
        const errPayload = (await specResponse.json().catch(() => ({}))) as { error?: string }
        throw new Error(errPayload.error || "Failed to trigger specification generation.")
      }

      const { runId } = (await specResponse.json()) as { runId?: string }

      if (!runId) {
        throw new Error("Missing run ID from specification trigger.")
      }

      const tokenResponse = await fetch("/api/ai/spec/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId }),
      })

      if (!tokenResponse.ok) {
        throw new Error("Failed to create specification access token.")
      }

      const { token } = (await tokenResponse.json()) as { token?: string }

      if (!token) {
        throw new Error("Missing token from specification token route.")
      }

      setSpecRunId(runId)
      setSpecToken(token)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to generate specification."
      setGenerateError(message)
      setIsTriggering(false)
    }
  }

  const closePreview = () => {
    setSelectedSpec(null)
    setPreviewContent(null)
    setPreviewError(null)
    setIsPreviewLoading(false)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-semibold text-[#eef1f3]">Specifications</h3>
          <p className="text-[10px] text-[#5c636d]">Export documentation from canvas</p>
        </div>

        <button
          className="flex items-center gap-1.5 rounded-xl border border-[#35e0d0]/50 bg-gradient-to-r from-[#35e0d0]/25 to-[#35e0d0]/10 px-3 py-1.5 text-xs font-medium text-[#35e0d0] shadow-[0_0_16px_rgba(53,224,208,0.2)] transition-all hover:bg-[#35e0d0]/35 active:scale-95 disabled:opacity-40"
          disabled={specRunIsActive}
          onClick={() => void handleGenerateSpec()}
          type="button"
        >
          {specRunIsActive ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Generating…</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5" />
              <span>Generate Spec</span>
            </>
          )}
        </button>
      </div>

      {specRunIsActive && (
        <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-[#35e0d0]/30 bg-[rgba(53,224,208,0.06)] px-3 py-2 text-xs font-medium text-[#35e0d0]">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#35e0d0] shadow-[0_0_8px_#35e0d0]" />
          <p className="truncate">Analyzing canvas and generating technical spec…</p>
        </div>
      )}

      {generateError && (
        <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
          {generateError}
        </div>
      )}

      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <div className="flex items-center gap-2 px-1 py-3 text-xs text-[#98a1ab]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Loading specs…
          </div>
        ) : listError ? (
          <p className="px-1 py-3 text-xs text-red-400">{listError}</p>
        ) : specs.length === 0 ? (
          <div className="flex h-48 flex-col items-center justify-center px-4 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#35e0d0] shadow-[0_0_15px_rgba(53,224,208,0.15)]">
              <FileText className="h-5 w-5" />
            </div>
            <p className="text-xs font-medium text-[#eef1f3]">No specs generated yet</p>
            <p className="mt-1 text-[11px] text-[#5c636d]">
              Click &ldquo;Generate Spec&rdquo; above to convert the canvas into a technical specification.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pr-2">
            {specs.map((spec) => (
              <div
                className="group flex w-full items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] p-2.5 text-left shadow-sm transition-all hover:border-[#35e0d0]/40 hover:bg-white/[0.05]"
                key={spec.id}
              >
                <button
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                  onClick={() => setSelectedSpec(spec)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      setSelectedSpec(spec)
                    }
                  }}
                  type="button"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#35e0d0]/30 bg-[#35e0d0]/10 text-[#35e0d0]">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-xs font-semibold text-[#eef1f3] group-hover:text-[#35e0d0]">
                      {spec.filename}
                    </p>
                    <p className="truncate text-[10px] text-[#5c636d]">
                      Generated {formatSpecCreatedAt(spec.createdAt)}
                    </p>
                  </div>
                </button>

                <Button
                  aria-label={`Download ${spec.filename}`}
                  className="h-7 w-7 text-[#98a1ab] hover:bg-white/[0.08] hover:text-[#eef1f3]"
                  onClick={() => triggerSpecDownload(projectId, spec.id, spec.filename)}
                  size="icon-xs"
                  type="button"
                  variant="ghost"
                >
                  <Download className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <SpecPreviewDialog
        content={previewContent}
        error={previewError}
        filename={selectedSpec?.filename ?? "Specification"}
        isLoading={isPreviewLoading}
        isOpen={selectedSpec !== null}
        onClose={closePreview}
        onDownload={() => {
          if (!selectedSpec) {
            return
          }

          triggerSpecDownload(projectId, selectedSpec.id, selectedSpec.filename)
        }}
      />
    </div>
  )
}

