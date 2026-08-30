"use client"

import type { Components } from "react-markdown"
import Markdown from "react-markdown"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SpecPreviewDialogProps {
  filename: string
  content: string | null
  isLoading: boolean
  error: string | null
  isOpen: boolean
  onClose: () => void
  onDownload: () => void
}

const markdownComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-3 text-xl font-semibold text-[#eef1f3]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-2 mt-5 text-lg font-semibold text-[#eef1f3]">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-base font-semibold text-[#eef1f3]">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 text-sm leading-relaxed text-[#98a1ab]">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="mb-3 list-disc space-y-1 pl-5 text-sm text-[#98a1ab]">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-5 text-sm text-[#98a1ab]">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-[#eef1f3]">{children}</strong>,
  a: ({ href, children }) => (
    <a className="text-[#35e0d0] underline underline-offset-2 hover:text-[#35e0d0]/80" href={href} rel="noreferrer" target="_blank">
      {children}
    </a>
  ),
  code: ({ children, className }) => {
    const isBlock = Boolean(className)

    if (isBlock) {
      return <code className="font-mono text-xs text-[#eef1f3]">{children}</code>
    }

    return (
      <code className="rounded-md bg-white/[0.04] px-1.5 py-0.5 font-mono text-xs text-[#35e0d0]">{children}</code>
    )
  },
  pre: ({ children }) => (
    <pre className="mb-3 overflow-x-auto rounded-xl border border-white/[0.08] bg-[#0c0e12] p-3 font-mono text-xs text-[#eef1f3]">
      {children}
    </pre>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-2 border-[#35e0d0]/40 pl-3 text-sm text-[#98a1ab]">
      {children}
    </blockquote>
  ),
}

export function SpecPreviewDialog({
  filename,
  content,
  isLoading,
  error,
  isOpen,
  onClose,
  onDownload,
}: SpecPreviewDialogProps) {
  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
      open={isOpen}
    >
      <DialogContent
        className="glow-dialog-panel max-h-[85vh] w-full max-w-3xl rounded-2xl p-5 sm:max-w-3xl"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation()
            onClose()
          }
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-base font-semibold text-[#eef1f3]">{filename}</DialogTitle>
          <DialogDescription className="text-xs text-[#98a1ab]">
            Preview of the generated technical specification.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[min(60vh,28rem)] rounded-xl border border-white/[0.08] bg-[#0c0e12]">
          <div className="p-4">
            {isLoading ? (
              <p className="text-sm text-[#98a1ab]">Loading specification…</p>
            ) : error ? (
              <p className="text-sm text-red-400">{error}</p>
            ) : content ? (
              <Markdown components={markdownComponents}>{content}</Markdown>
            ) : (
              <p className="text-sm text-[#98a1ab]">No specification content to display.</p>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="mt-2 flex flex-row justify-end gap-2 border-t border-white/[0.08] pt-3">
          <button
            onClick={onClose}
            type="button"
            className="h-9 rounded-xl border border-white/[0.08] bg-transparent px-4 text-xs font-medium text-[#98a1ab] transition-colors hover:bg-white/[0.04] hover:text-[#eef1f3]"
          >
            Close
          </button>
          <button
            disabled={isLoading || Boolean(error)}
            onClick={onDownload}
            type="button"
            className="glow-btn-cyan flex h-9 items-center justify-center rounded-xl px-4 text-xs font-semibold"
          >
            Download
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
