import { dark } from "@clerk/ui/themes"

export const clerkAppearance = {
  theme: dark,
  variables: {
    colorBackground: "#111318",
    colorDanger: "#ef4444",
    colorInputBackground: "rgba(255, 255, 255, 0.03)",
    colorInputText: "#eef1f3",
    colorNeutral: "#98a1ab",
    colorPrimary: "#35e0d0",
    colorText: "#eef1f3",
    colorTextSecondary: "#98a1ab",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "glow-dialog-panel w-full max-w-md rounded-2xl p-8 sm:p-10",
    formButtonPrimary:
      "glow-btn-cyan h-10 rounded-xl font-semibold transition-all",
    formFieldInput:
      "h-10 rounded-xl border border-white/[0.08] bg-white/[0.03] text-[#eef1f3] placeholder:text-[#5c636d] focus:border-[#35e0d0] focus:ring-1 focus:ring-[#35e0d0]/30 transition-colors",
    formFieldLabel: "text-xs font-medium text-[#98a1ab]",
    footerActionLink: "font-medium text-[#35e0d0] hover:text-[#35e0d0]/80",
    headerSubtitle: "text-xs text-[#98a1ab]",
    headerTitle: "text-xl font-bold tracking-tight text-[#eef1f3]",
    socialButtonsBlockButton:
      "h-10 rounded-xl border border-white/[0.08] bg-white/[0.02] font-medium text-[#eef1f3] hover:bg-white/[0.05] hover:border-white/[0.14] transition-colors",
    dividerLine: "bg-white/[0.08]",
    dividerText: "text-xs text-[#5c636d]",
    rootBox: "w-full",
    userButtonPopoverCard:
      "glow-dialog-panel rounded-2xl p-2",
    userButtonPopoverActionButton:
      "rounded-xl hover:bg-white/[0.04] text-[#98a1ab] hover:text-[#eef1f3] transition-colors",
    userButtonPopoverActionButtonText: "text-xs font-medium text-[#eef1f3]",
    userButtonPopoverActionButtonIcon: "text-[#35e0d0]",
    userButtonPopoverFooter: "border-t border-white/[0.08] pt-2",
    userProfileModalContent:
      "glow-dialog-panel rounded-2xl overflow-hidden",
    modalBackdrop: "bg-black/75 backdrop-blur-sm",
    modalContent:
      "glow-dialog-panel rounded-2xl overflow-hidden",
  },
}