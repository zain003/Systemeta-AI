import Link from "next/link"
import { LockKeyhole } from "lucide-react"

export function AccessDenied() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-base px-6 text-copy-primary">
      <div className="flex w-full max-w-md flex-col items-center rounded-3xl border border-surface-border bg-surface p-8 text-center shadow-2xl">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-surface-border bg-subtle text-accent-primary">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold">Access denied</h1>
        <p className="mt-3 text-sm text-copy-secondary">
          You don&apos;t have access to this project or it no longer exists.
        </p>
        <Link
          className="mt-6 inline-flex items-center justify-center rounded-lg border border-transparent bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
          href="/editor"
        >
          Back to editor
        </Link>
      </div>
    </main>
  )
}
