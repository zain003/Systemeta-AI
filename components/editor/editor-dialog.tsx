import type { ReactNode } from "react"

import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface EditorDialogProps {
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
  actions?: ReactNode
}

export function EditorDialog({
  title,
  description,
  children,
  actions,
}: EditorDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        {description ? (
          <DialogDescription>{description}</DialogDescription>
        ) : null}
      </DialogHeader>
      {children}
      {actions ? <DialogFooter>{actions}</DialogFooter> : null}
    </DialogContent>
  )
}