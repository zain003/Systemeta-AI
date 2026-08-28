import { dark } from "@clerk/ui/themes"

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorBackground: "var(--bg-surface)",
    colorDanger: "var(--state-error)",
    colorInputBackground: "var(--bg-elevated)",
    colorInputText: "var(--text-primary)",
    colorNeutral: "var(--text-secondary)",
    colorPrimary: "var(--accent-primary)",
    colorText: "var(--text-primary)",
    colorTextSecondary: "var(--text-secondary)",
  },
  elements: {
    card: "w-full max-w-md rounded-3xl border border-surface-border bg-surface p-8 shadow-none sm:p-10",
    formButtonPrimary: "h-11 rounded-xl bg-brand font-semibold text-base hover:bg-brand/90",
    formFieldInput: "h-11 rounded-xl border-surface-border bg-elevated text-copy-primary placeholder:text-copy-muted focus:border-brand focus:ring-brand",
    formFieldLabel: "font-medium text-copy-secondary",
    footerActionLink: "font-medium text-brand hover:text-brand/80",
    headerSubtitle: "text-copy-secondary",
    headerTitle: "text-xl font-semibold tracking-normal text-copy-primary",
    socialButtonsBlockButton: "h-11 rounded-xl border-surface-border bg-elevated font-medium text-copy-primary hover:bg-subtle",
    dividerLine: "bg-subtle-border",
    dividerText: "text-copy-faint",
    rootBox: "w-full",
  },
}