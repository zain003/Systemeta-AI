import type { ReactNode } from "react"
import { FileText, Network, Sparkles } from "lucide-react"

interface AuthShellProps {
  children: ReactNode
  mode: "sign-in" | "sign-up"
}

export function AuthShell({ children, mode }: AuthShellProps) {
  const action = mode === "sign-in" ? "Sign in" : "Create your account"
  const features = [
    {
      icon: Network,
      title: "Real-time Collaboration",
      text: "Multi-user canvas with live presence, shared cursor tracking, and node autosave.",
    },
    {
      icon: Sparkles,
      title: "AI System Architect",
      text: "Turn natural language prompts into complete, professionally connected cloud designs.",
    },
    {
      icon: FileText,
      title: "Instant Tech Specs",
      text: "Generate and download markdown architecture documents and implementation guides.",
    },
  ]

  return (
    <main className="relative grid min-h-screen bg-[#08090c] text-[#eef1f3] selection:bg-[#35e0d0]/30 selection:text-[#35e0d0] lg:grid-cols-[minmax(0,1.15fr)_minmax(28rem,0.85fr)]">
      {/* Background Radial Glow Accent */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,rgba(53,224,208,0.12)_0%,transparent_70%)] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[450px] w-[450px] rounded-full bg-[radial-gradient(circle,rgba(53,224,208,0.08)_0%,transparent_70%)] blur-3xl" />

      {/* Left Showcase Panel */}
      <section className="relative hidden border-r border-white/[0.08] px-12 py-12 lg:flex lg:flex-col lg:justify-between xl:px-20">
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#35e0d0] to-[#128a80] shadow-[0_0_18px_rgba(53,224,208,0.4)]">
              <Sparkles className="h-4.5 w-4.5 text-[#08090c]" />
            </div>
            <span className="text-base font-bold tracking-tight text-[#eef1f3]">Systemeta AI</span>
          </div>

          {/* Hero Pitch */}
          <div className="mt-20 max-w-xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#35e0d0]/30 bg-[rgba(53,224,208,0.08)] px-3.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#35e0d0] shadow-[0_0_16px_rgba(53,224,208,0.15)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#35e0d0] shadow-[0_0_6px_#35e0d0]" />
              <span>Architecture Workspace</span>
            </div>

            <h1 className="mt-6 text-4xl font-bold leading-[1.12] tracking-tight text-[#eef1f3] xl:text-5xl">
              Design cloud systems that scale effortlessly.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-[#98a1ab]">
              A collaborative workspace for architects and engineering teams to turn ideas into structured, living system designs.
            </p>
          </div>

          {/* Feature Highlights */}
          <ul className="mt-10 max-w-lg space-y-4">
            {features.map(({ icon: Icon, title, text }) => (
              <li
                key={title}
                className="flex items-start gap-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3.5 transition-all hover:border-[#35e0d0]/30 hover:bg-white/[0.04]"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#35e0d0]/30 bg-[rgba(53,224,208,0.08)] text-[#35e0d0] shadow-[0_0_12px_rgba(53,224,208,0.12)]">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-semibold text-[#eef1f3]">{title}</h2>
                  <p className="mt-0.5 text-xs text-[#98a1ab] leading-relaxed">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer Note */}
        <p className="mt-8 text-xs text-[#5c636d]">
          {action} to continue to your workspace.
        </p>
      </section>

      {/* Right Auth Component Panel */}
      <section className="relative flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          <div className="mb-6 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#35e0d0] to-[#128a80] shadow-[0_0_14px_rgba(53,224,208,0.4)]">
              <Sparkles className="h-4 w-4 text-[#08090c]" />
            </div>
            <span className="text-sm font-bold text-[#eef1f3]">Systemeta AI</span>
          </div>

          <div className="rounded-2xl shadow-[0_24px_70px_rgba(0,0,0,0.8),0_0_32px_rgba(53,224,208,0.12)]">
            {children}
          </div>
        </div>
      </section>
    </main>
  )
}