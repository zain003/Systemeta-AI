"use client"

import { useCallback, useEffect, useState } from "react"
import { Copy, Trash2, X } from "lucide-react"

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

  useEffect(() => {
    if (isOpen) {
      loadCollaborators()
    }
  }, [isOpen])

  async function loadCollaborators() {
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
  }

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
            {isOwner ? "Invite others to collaborate on this project" : "View collaborators on this project"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project Link */}
          <div className="rounded-lg border border-surface-border bg-surface/50 p-3">
            <p className="text-xs font-medium text-copy-faint mb-2">Project Link</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={projectUrl}
                readOnly
                className="flex-1 rounded border border-surface-border bg-surface px-2 py-1 text-xs text-copy-secondary"
              />
              <Button size="sm" variant="outline" onClick={copyProjectLink}>
                <Copy className="h-4 w-4" />
                {copied ? "Copied!" : "Copy"}
              </Button>
            </div>
          </div>

          {/* Invite Form */}
          {isOwner && (
            <form onSubmit={handleInvite} className="space-y-2">
              <label className="text-xs font-medium text-copy-faint">Invite by email</label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="collaborator@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="text-xs"
                />
                <Button type="submit" size="sm" disabled={isLoading || !email.trim()}>
                  {isLoading ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>
          )}

          {/* Collaborators List */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-copy-faint">Collaborators</label>
            {loadingCollaborators ? (
              <div className="text-xs text-copy-secondary py-2">Loading...</div>
            ) : collaborators.length === 0 ? (
              <div className="text-xs text-copy-secondary py-2">No collaborators yet</div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className="flex items-center gap-3 rounded-lg border border-surface-border bg-surface/50 p-2"
                  >
                    {collaborator.avatarUrl && (
                      <img
                        src={collaborator.avatarUrl}
                        alt={collaborator.displayName || collaborator.email}
                        className="h-6 w-6 rounded-full"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      {collaborator.displayName && (
                        <p className="text-xs font-medium text-copy-primary truncate">
                          {collaborator.displayName}
                        </p>
                      )}
                      <p className="text-xs text-copy-secondary truncate">{collaborator.email}</p>
                    </div>
                    {isOwner && (
                      <Button
                        size="icon-xs"
                        variant="ghost"
                        onClick={() => handleRemove(collaborator.id, collaborator.email)}
                        aria-label={`Remove ${collaborator.email}`}
                      >
                        <Trash2 className="h-4 w-4" />
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
