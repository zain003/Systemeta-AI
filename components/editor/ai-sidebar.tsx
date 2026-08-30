"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Loader2, Send, Sparkles, X } from "lucide-react"
import { useCreateFeed, useCreateFeedMessage, useFeedMessages, useOthers } from "@liveblocks/react"
import { useUser } from "@clerk/nextjs"
import { useRealtimeRun } from "@trigger.dev/react-hooks"

import { SpecsTab } from "@/components/editor/specs-tab"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { type AiChatMessage, isValidAiChatMessage, isValidAiStatusMessage } from "@/types/tasks"

const AI_STATUS_FEED_ID = "ai-status-feed"
const AI_CHAT_FEED_ID = "ai-chat"

interface PresenceUser {
  id?: string
  connectionId: number
  presence?: {
    cursor?: { x: number; y: number } | null
    thinking?: boolean
  }
}

const starterPrompts = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

interface AISidebarProps {
  isOpen: boolean
  onClose: () => void
  roomId: string
  projectId: string
}

function formatChatTimestamp(timestamp: number) {
  const date = new Date(timestamp)
  const formatter = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })

  return formatter.format(date)
}

export function AISidebar({ isOpen, onClose, roomId, projectId }: AISidebarProps) {
  const [activeTab, setActiveTab] = useState("architect")
  const [draft, setDraft] = useState("")
  const [sendError, setSendError] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [runId, setRunId] = useState<string | null>(null)
  const [publicToken, setPublicToken] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const completionLoggedRef = useRef<string | null>(null)
  const { user } = useUser()
  const createFeed = useCreateFeed()
  const createFeedMessage = useCreateFeedMessage()
  const others = useOthers((users) => users as readonly PresenceUser[])
  const { messages: statusMessages = [] } = useFeedMessages(AI_STATUS_FEED_ID)
  const { messages: chatMessages = [] } = useFeedMessages(AI_CHAT_FEED_ID)
  const { run } = useRealtimeRun(runId ?? undefined, {
    accessToken: publicToken ?? undefined,
    enabled: !!runId && !!publicToken,
    stopOnCompletion: true,
  })
  const runIsActive = useMemo(() => {
    if (!run) {
      return false
    }

    return !["CANCELED", "COMPLETED", "CRASHED", "FAILED", "EXPIRED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(run.status)
  }, [run])
  const isGenerating = useMemo(() => isSending || runIsActive || others.some((user) => user.presence?.thinking === true && user.id === "ai-architect"), [isSending, others, runIsActive])

  useEffect(() => {
    void createFeed(AI_CHAT_FEED_ID, { metadata: { name: "AI Chat" } }).catch(() => {
      // Ignore duplicate feed-creation attempts; the room can safely reuse this feed.
    })
  }, [createFeed])

  useEffect(() => {
    if (!runId || !run) {
      return
    }

    const isTerminal = ["COMPLETED", "FAILED", "CRASHED", "CANCELED", "EXPIRED", "TIMED_OUT", "SYSTEM_FAILURE"].includes(run.status)

    if (!isTerminal || completionLoggedRef.current === runId) {
      return
    }

    completionLoggedRef.current = runId

    const finalMessage = run.status === "COMPLETED"
      ? "Design update complete. The canvas changes are now visible to everyone in the room."
      : `The design run did not finish successfully (${run.status.toLowerCase()}). Please try again.`

    void createFeedMessage(AI_CHAT_FEED_ID, {
      sender: "AI Architect",
      role: "assistant",
      content: finalMessage,
      timestamp: Date.now(),
    }).catch(() => undefined)

    queueMicrotask(() => {
      setRunId(null)
      setPublicToken(null)
      setIsSending(false)
    })
  }, [createFeedMessage, run, runId])

  const validChatMessages = useMemo<AiChatMessage[]>(
    () => {
      if (!Array.isArray(chatMessages)) return []
      return chatMessages.flatMap((message) => {
        if (!message || !isValidAiChatMessage(message.data)) {
          return []
        }

        return [message.data]
      })
    },
    [chatMessages],
  )

  const latestStatus = useMemo(() => {
    if (!Array.isArray(statusMessages) || statusMessages.length === 0) {
      return isGenerating ? "AI is thinking…" : "AI is ready to help."
    }

    const latest = statusMessages[statusMessages.length - 1]
    if (!latest) {
      return isGenerating ? "AI is thinking…" : "AI is ready to help."
    }

    const payload = latest.data
    if (isValidAiStatusMessage(payload)) {
      return payload.text ?? "AI is thinking…"
    }

    return isGenerating ? "AI is thinking…" : "AI is ready to help."
  }, [isGenerating, statusMessages])

  const syncTextareaHeight = (value: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = "auto"
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, 72), 160)
    textarea.style.height = `${nextHeight}px`

    if (!value.trim()) {
      textarea.style.height = "72px"
    }
  }

  const handleDraftChange = (value: string) => {
    setDraft(value)
    syncTextareaHeight(value)
  }

  const handleSubmit = async () => {
    const content = draft.trim()
    if (!content || isSending || runIsActive) return

    const sender = user?.fullName || user?.firstName || user?.username || "You"

    setIsSending(true)
    setSendError(null)

    // eslint-disable-next-line react-hooks/purity -- Date.now() is safe in async event handlers
    const timestamp = Date.now()

    try {
      await createFeedMessage(AI_CHAT_FEED_ID, {
        sender,
        role: "user",
        content,
        timestamp,
      })

      const designResponse = await fetch("/api/ai/design", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: content, roomId, projectId }),
      })

      if (!designResponse.ok) {
        const errorText = await designResponse.text()
        throw new Error(errorText || "The design request could not be submitted.")
      }

      const designPayload = (await designResponse.json()) as { runId?: string }

      if (!designPayload.runId) {
        throw new Error("The design request did not return a run ID.")
      }

      const tokenResponse = await fetch("/api/ai/design/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId: designPayload.runId }),
      })

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text()
        throw new Error(errorText || "The design run token could not be created.")
      }

      const tokenPayload = (await tokenResponse.json()) as { token?: string }

      if (!tokenPayload.token) {
        throw new Error("The design run token was missing.")
      }

      completionLoggedRef.current = null
      setRunId(designPayload.runId)
      setPublicToken(tokenPayload.token)
      setDraft("")
      syncTextareaHeight("")
    } catch (error) {
      const nextError = error instanceof Error ? error.message : "Your message could not be sent. Please try again."
      setSendError(nextError)
      // eslint-disable-next-line react-hooks/purity -- Date.now() is safe in async event handlers
      const errorTimestamp = Date.now()
      await createFeedMessage(AI_CHAT_FEED_ID, {
        sender: "AI Architect",
        role: "assistant",
        content: `The request failed: ${nextError}`,
        timestamp: errorTimestamp,
      }).catch(() => undefined)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <aside
      aria-label="AI Workspace"
      aria-hidden={!isOpen}
      className="flex h-[calc(100vh-96px)] w-[360px] flex-col overflow-hidden rounded-2xl bg-[#111318] shadow-2xl floating-glass-panel glow-border-left"
      style={{
        position: "fixed",
        top: "80px",
        bottom: "16px",
        right: "16px",
        left: "auto",
        width: "360px",
        zIndex: 40,
        transform: isOpen ? "translateX(0)" : "translateX(calc(100% + 32px))",
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? "auto" : "none",
        transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.2s ease-in-out",
      }}
    >
      <div className="flex h-full w-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3.5">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-[#eef1f3]">AI Workspace</h2>
            <p className="text-[11px] text-[#98a1ab]">Collaborate with Systemeta AI</p>
          </div>

          <Button
            aria-label="Close AI sidebar"
            className="h-7 w-7 text-[#98a1ab] hover:bg-white/[0.06] hover:text-[#eef1f3]"
            onClick={onClose}
            size="icon-xs"
            variant="ghost"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* 3 Pill Tabs: Architect / Chat / Specs */}
        <div className="flex gap-1.5 px-3.5 pt-3">
          <button
            className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-all ${
              activeTab === "architect"
                ? "border border-[#35e0d0]/40 bg-[rgba(53,224,208,0.1)] text-[#35e0d0] shadow-[0_0_12px_rgba(53,224,208,0.12)]"
                : "border border-transparent text-[#98a1ab] hover:bg-white/[0.04] hover:text-[#eef1f3]"
            }`}
            onClick={() => setActiveTab("architect")}
            type="button"
          >
            Architect
          </button>
          <button
            className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-all ${
              activeTab === "chat"
                ? "border border-[#35e0d0]/40 bg-[rgba(53,224,208,0.1)] text-[#35e0d0] shadow-[0_0_12px_rgba(53,224,208,0.12)]"
                : "border border-transparent text-[#98a1ab] hover:bg-white/[0.04] hover:text-[#eef1f3]"
            }`}
            onClick={() => setActiveTab("chat")}
            type="button"
          >
            Chat
          </button>
          <button
            className={`flex-1 rounded-xl py-1.5 text-xs font-medium transition-all ${
              activeTab === "specs"
                ? "border border-[#35e0d0]/40 bg-[rgba(53,224,208,0.1)] text-[#35e0d0] shadow-[0_0_12px_rgba(53,224,208,0.12)]"
                : "border border-transparent text-[#98a1ab] hover:bg-white/[0.04] hover:text-[#eef1f3]"
            }`}
            onClick={() => setActiveTab("specs")}
            type="button"
          >
            Specs
          </button>
        </div>

        {activeTab !== "specs" ? (
          <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3.5 pt-3">
            {/* Glowing Status Pill */}
            <div className="mb-3 flex items-center gap-2.5 rounded-xl border border-[#35e0d0]/25 bg-[rgba(53,224,208,0.06)] px-3 py-2">
              <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[#35e0d0] shadow-[0_0_8px_#35e0d0]" />
              <p className="flex-1 truncate text-xs font-medium text-[#35e0d0]">
                {runIsActive ? latestStatus : "Ready — describe a system to generate"}
              </p>
              {runIsActive && <Loader2 className="h-3.5 w-3.5 animate-spin text-[#35e0d0]" />}
            </div>

            {/* Chat / Messages Box */}
            <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3">
              {validChatMessages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-3 text-center">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#35e0d0] shadow-[0_0_15px_rgba(53,224,208,0.15)]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium text-[#eef1f3]">Turn your idea into a system design</p>
                  <p className="mt-1 text-[11px] text-[#5c636d]">
                    Describe services, databases, and APIs to design on canvas.
                  </p>

                  <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                    {starterPrompts.map((prompt) => (
                      <button
                        className="rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-[#98a1ab] transition-colors hover:border-[#35e0d0]/40 hover:text-[#35e0d0]"
                        key={prompt}
                        onClick={() => handleDraftChange(prompt)}
                        type="button"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col gap-2.5 overflow-y-auto pr-1">
                  {validChatMessages.map((message, index) => (
                    <div
                      className={cn("flex w-full", message.role === "user" ? "justify-end" : "justify-start")}
                      key={`${message.sender}-${message.timestamp}-${index}`}
                    >
                      <div
                        className={cn(
                          "max-w-[88%] px-3.5 py-2.5 text-xs leading-relaxed shadow-sm",
                          message.role === "user"
                            ? "rounded-2xl rounded-tr-sm border border-[#35e0d0]/40 bg-gradient-to-br from-[#35e0d0]/25 to-[#35e0d0]/10 text-[#eef1f3] shadow-[0_0_16px_rgba(53,224,208,0.1)]"
                            : "rounded-2xl rounded-tl-sm border border-white/[0.08] bg-white/[0.04] text-[#eef1f3]"
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between gap-2 text-[9px] uppercase tracking-[0.1em] text-[#5c636d]">
                          <span className="font-medium text-[#98a1ab]">{message.sender}</span>
                          <span>{formatChatTimestamp(message.timestamp)}</span>
                        </div>
                        <p className="whitespace-pre-wrap break-words">{message.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Composer */}
            <div className="mt-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-3 transition-colors focus-within:border-[#35e0d0]/40 focus-within:shadow-[0_0_16px_rgba(53,224,208,0.12)]">
              <Textarea
                className="min-h-[56px] max-h-[140px] resize-none border-0 bg-transparent p-0 text-xs text-[#eef1f3] placeholder:text-[#5c636d] focus-visible:border-0 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSending || runIsActive}
                onChange={(event) => handleDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    if (!isSending && !runIsActive) {
                      void handleSubmit()
                    }
                  }
                }}
                placeholder={runIsActive || isSending ? "AI is currently designing..." : "Describe the system you want to design..."}
                ref={textareaRef}
                value={draft}
              />

              <div className="mt-2 flex items-center justify-between pt-1">
                {sendError ? (
                  <span className="truncate text-[10px] text-red-400">{sendError}</span>
                ) : (
                  <span className="text-[10px] text-[#5c636d]">Shift+Enter for newline</span>
                )}

                <button
                  aria-label="Send prompt"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-[#35e0d0] text-[#08090c] shadow-[0_0_14px_rgba(53,224,208,0.35)] transition-all hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
                  disabled={!draft.trim() || isSending || runIsActive}
                  onClick={() => void handleSubmit()}
                  type="button"
                >
                  {isSending || runIsActive ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col px-3.5 pb-3.5 pt-3">
            <SpecsTab isActive={activeTab === "specs"} projectId={projectId} roomId={roomId} />
          </div>
        )}
      </div>
    </aside>
  )
}
