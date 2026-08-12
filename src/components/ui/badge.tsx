import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary/15 text-primary shadow",
        secondary: "border-transparent bg-card text-muted-foreground",
        destructive: "border-transparent bg-[var(--clinical-red)]/15 text-[var(--clinical-red)] shadow",
        outline: "border-border text-muted-foreground",
        success: "border-transparent bg-[var(--clinical-emerald)]/15 text-[var(--clinical-emerald)]",
        warning: "border-transparent bg-[var(--clinical-amber)]/15 text-[var(--clinical-amber)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
