import { SignUp } from "@clerk/nextjs"

import { clerkAppearance } from "@/components/auth/clerk-appearance"
import { AuthShell } from "@/components/auth/auth-shell"

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUp
        appearance={clerkAppearance}
        path="/sign-up"
        routing="path"
      />
    </AuthShell>
  )
}