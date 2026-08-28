import { SignIn } from "@clerk/nextjs"

import { clerkAppearance } from "@/components/auth/clerk-appearance"
import { AuthShell } from "@/components/auth/auth-shell"

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <SignIn
        appearance={clerkAppearance}
        path="/sign-in"
        routing="path"
      />
    </AuthShell>
  )
}