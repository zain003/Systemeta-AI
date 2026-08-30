import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1 text-sm text-[#eef1f3] placeholder:text-[#5c636d] outline-none transition-colors focus-visible:border-[#35e0d0]/60 focus-visible:ring-1 focus-visible:ring-[#35e0d0]/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
      {...props}
    />
  )
}

export { Input }
