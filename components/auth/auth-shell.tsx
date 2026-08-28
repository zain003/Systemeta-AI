import type { ReactNode } from "react"
import { Bot, Braces, Network } from "lucide-react"

interface AuthShellProps {
  children: ReactNode
  mode: "sign-in" | "sign-up"
}

export function AuthShell({ children, mode }: AuthShellProps) {
  const action = mode === "sign-in" ? "Sign in" : "Create your account"
  const features = [
    {
      icon: Network,
      text: "Map services, data, and dependencies together.",
    },
    {
      icon: Bot,
      text: "Refine architecture with your team in real time.",
    },
    {
      icon: Braces,
      text: "Generate a technical specification when it is ready.",
    },
  ]

  return (
    <main className="grid min-h-screen bg-base text-copy-primary lg:grid-cols-[minmax(0,1fr)_minmax(30rem,0.82fr)]">
      <section className="relative hidden border-r border-surface-border px-12 py-10 lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div className="absolute inset-y-10 right-0 w-px bg-subtle-border" />
        <div>
          <div className="flex items-center gap-3 font-mono text-xs font-medium uppercase tracking-[0.14em] text-copy-secondary">
            <span className="h-2 w-2 rounded-full bg-brand shadow-[0_0_0_4px_var(--accent-primary-dim)]" />
            <span>Systemeta AI</span>
          </div>
          <div className="mt-24 max-w-xl border-l-2 border-brand pl-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand">
              Architecture workspace
            </p>
            <h1 className="mt-5 max-w-lg text-4xl font-semibold leading-[1.1] tracking-normal text-copy-primary xl:text-5xl">
              Design systems that stay understandable as they grow.
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-copy-secondary">
              A collaborative workspace for turning technical ideas into clear,
              living architecture.
            </p>
          </div>
          <ul className="mt-10 max-w-md space-y-5 text-sm leading-6 text-copy-muted">
            {features.map(({ icon: Icon, text }) => (
              <li className="flex items-start gap-4" key={text}>
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl border border-subtle-border bg-subtle text-brand">
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </span>
                <span className="pt-0.5">{text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-copy-faint">
          {action} to continue to your workspace.
        </p>
      </section>
      <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <p className="text-sm font-semibold tracking-wide text-brand">Systemeta AI</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}