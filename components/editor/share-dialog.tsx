"use client"

import { useCallback, useEffect, useState } from "react"
import { Copy, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface Collaborator {
  id: string
  email: string
  displayName?: string
  avatarUrl?: string
}

interface ShareDialogProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
  projectName: string
  isOwner: boolean
}

export function ShareDialog({
  isOpen,
  onClose,
  projectId,
  projectName,
  isOwner,
}: ShareDialogProps) {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([])
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [loadingCollaborators, setLoadingCollaborators] = useState(false)

  const projectUrl = typeof window !== "undefined" ? `${window.location.origin}/editor/${projectId}` : ""

  const loadCollaborators = useCallback(async () => {
    setLoadingCollaborators(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`)
      if (response.ok) {
        const data = (await response.json()) as Collaborator[]
        setCollaborators(data)
      }
    } catch (error) {
      console.error("Failed to load collaborators:", error)
    } finally {
      setLoadingCollaborators(false)
    }
  }, [projectId])

  useEffect(() => {
    if (isOpen) {
      void Promise.resolve().then(loadCollaborators)
    }
  }, [isOpen, loadCollaborators])

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !isOwner) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/collaborators`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      })

      if (response.ok) {
        setEmail("")
        await loadCollaborators()
      }
    } catch (error) {
      console.error("Failed to invite collaborator:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRemove(collaboratorId: string, collaboratorEmail: string) {
    if (!isOwner) return

    try {
      const response = await fetch(
        `/api/projects/${projectId}/collaborators/${encodeURIComponent(collaboratorEmail)}`,
        { method: "DELETE" }
      )

      if (response.ok) {
        await loadCollaborators()
      }
    } catch (error) {
      console.error("Failed to remove collaborator:", error)
    }
  }

  function copyProjectLink() {
    navigator.clipboard.writeText(projectUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Share {projectName}</DialogTitle>
          <DialogDescription>
            {isOwner ? "Invite collaborators to design on this project in real-time." : "View active collaborators on this project."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-1">
          {/* Project Link */}
          <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-3">
            <p className="mb-2 text-xs font-medium text-[#eef1f3]">Project Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={projectUrl}
                readOnly
                className="h-8 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-2.5 text-xs text-[#eef1f3] focus:outline-none"
              />
              <button
                type="button"
                onClick={copyProjectLink}
                className="flex h-8 items-center gap-1.5 rounded-lg border border-[#35e0d0]/50 bg-gradient-to-r from-[#35e0d0]/20 to-[#35e0d0]/10 px-3 text-xs font-semibold text-[#35e0d0] shadow-[0_0_12px_rgba(53,224,208,0.2)] transition-all hover:bg-[#35e0d0]/30 hover:shadow-[0_0_16px_rgba(53,224,208,0.35)] active:scale-[0.98]"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>{copied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
          </div>

          {/* Invite Form */}
          {isOwner && (
            <form onSubmit={handleInvite} className="space-y-2">
              <label className="text-xs font-medium text-[#eef1f3]">Invite by email</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="h-9 rounded-xl border-white/[0.08] bg-white/[0.03] px-3 text-xs text-[#eef1f3] placeholder:text-[#5c636d] focus-visible:border-[#35e0d0]/50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="glow-btn-cyan flex h-9 items-center justify-center rounded-xl px-4 text-xs font-semibold"
                >
                  {isLoading ? "Adding..." : "Add"}
                </button>
              </div>
            </form>
          )}

          {/* Collaborators List */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#eef1f3]">Collaborators</label>
            {loadingCollaborators ? (
              <div className="py-2 text-xs text-[#98a1ab]">Loading collaborators...</div>
            ) : collaborators.length === 0 ? (
              <div className="py-2 text-xs text-[#98a1ab]">No invited collaborators yet</div>
            ) : (
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-2.5 transition-colors hover:border-white/[0.12]"
                  >
                    {collaborator.avatarUrl ? (
                      <img
                        src={collaborator.avatarUrl}
                        alt={collaborator.displayName || collaborator.email}
                        className="h-7 w-7 rounded-full border border-white/[0.1]"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[#35e0d0]/30 to-[#35e0d0]/10 text-xs font-bold text-[#35e0d0]">
                        {(collaborator.displayName || collaborator.email).charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      {collaborator.displayName && (
                        <p className="truncate text-xs font-medium text-[#eef1f3]">
                          {collaborator.displayName}
                        </p>
                      )}
                      <p className="truncate text-xs text-[#98a1ab]">{collaborator.email}</p>
                    </div>
                    {isOwner && (
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => handleRemove(collaborator.id, collaborator.email)}
                        aria-label={`Remove ${collaborator.email}`}
                        className="h-7 w-7 rounded-lg text-[#98a1ab] hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
