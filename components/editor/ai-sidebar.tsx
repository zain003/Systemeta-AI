"use client"

import { useRef, useState } from "react"
import { Bot, Download, FileText, Sparkles, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

const starterPrompts = [
  "Design an e-commerce backend",
  "Create a chat app architecture",
  "Build a CI/CD pipeline",
]

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  content: string
}

interface AISidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const [activeTab, setActiveTab] = useState("architect")
  const [draft, setDraft] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

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

  const handleSubmit = () => {
    const content = draft.trim()
    if (!content) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
    }

    const assistantMessage: ChatMessage = {
      id: `assistant-${Date.now() + 1}`,
      role: "assistant",
      content:
        "I can turn that into an architecture proposal, break it into system boundaries, and map the related flows across the canvas.",
    }

    setMessages((current) => [...current, userMessage, assistantMessage])
    setDraft("")
  }

  return (
    <aside
      className={cn(
        "overflow-hidden border-l border-surface-border bg-surface/95 shadow-[-12px_0_32px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-all duration-200 ease-out",
        isOpen ? "w-80 opacity-100" : "w-0 border-l-0 opacity-0"
      )}
    >
      <div
        className={cn(
          "flex h-full w-80 flex-col transition-opacity duration-200",
          isOpen ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-surface-border bg-subtle text-brand">
              <Bot className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-copy-primary">AI Workspace</p>
              <p className="truncate text-xs text-copy-muted">Collaborate with Ghost AI</p>
            </div>
          </div>

          <Button aria-label="Close AI sidebar" onClick={onClose} size="icon-sm" variant="ghost">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Tabs
          className="flex min-h-0 flex-1 flex-col"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="mx-4 mt-4 w-auto bg-subtle">
            <TabsTrigger
              className="data-[active]:bg-accent data-[active]:text-accent-foreground data-[active]:shadow-sm"
              value="architect"
            >
              AI Architect
            </TabsTrigger>
            <TabsTrigger
              className="data-[active]:bg-accent data-[active]:text-accent-foreground data-[active]:shadow-sm"
              value="specs"
            >
              Specs
            </TabsTrigger>
          </TabsList>

          <TabsContent className="mt-0 flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3" value="architect">
            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden rounded-2xl border border-surface-border bg-base/50 p-3">
              {messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center px-4 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-subtle text-brand">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium text-copy-primary">Turn your idea into a system design.</p>
                  <p className="mt-1 text-xs text-copy-muted">
                    Describe the architecture, flows, or deployment model you want to model.
                  </p>

                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        className="rounded-full border border-surface-border bg-subtle px-3 py-1.5 text-xs font-medium text-ai-text transition-colors hover:border-brand/40 hover:text-brand"
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
                <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto pr-1">
                  {messages.map((message) => (
                    <div
                      className={cn(
                        "flex w-full",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                      key={message.id}
                    >
                      <div
                        className={cn(
                          "max-w-[85%] rounded-2xl border px-3 py-2 text-sm leading-relaxed shadow-sm",
                          message.role === "user"
                            ? "border-brand/50 bg-accent-dim text-copy-primary"
                            : "border-surface-border bg-elevated text-copy-primary"
                        )}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-3 rounded-2xl border border-surface-border bg-subtle p-2">
              <Textarea
                className="min-h-[72px] max-h-[160px] resize-none border-0 bg-transparent px-2 py-2 text-sm text-copy-primary placeholder:text-copy-muted focus-visible:border-0 focus-visible:ring-0"
                onChange={(event) => handleDraftChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault()
                    handleSubmit()
                  }
                }}
                placeholder="Describe the system you want to design..."
                ref={textareaRef}
                value={draft}
              />

              <div className="mt-2 flex items-center justify-between gap-3 px-2 pb-1">
                <p className="text-[10px] uppercase tracking-[0.14em] text-copy-muted">Press Enter to send</p>
                <Button
                  className="h-8 px-3"
                  disabled={!draft.trim()}
                  onClick={handleSubmit}
                  size="sm"
                >
                  Send
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent className="mt-0 flex min-h-0 flex-1 flex-col px-4 pb-4 pt-3" value="specs">
            <div className="mb-4 flex justify-end">
              <Button className="h-8 px-3" size="sm">
                Generate Spec
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 overflow-y-auto">
              <div className="w-full rounded-2xl border border-surface-border bg-elevated p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl border border-surface-border bg-subtle text-brand">
                    <FileText className="h-4 w-4" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-semibold text-copy-primary">System Design Spec</h3>
                      <Button aria-label="Download generated spec" disabled size="icon-sm" variant="ghost">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>

                    <p className="mt-2 text-sm leading-relaxed text-copy-secondary">
                      API gateway, event stream orchestration, user-facing service mesh, and deployment
                      boundaries for a multi-region SaaS architecture.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </aside>
  )
}
