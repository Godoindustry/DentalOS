"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useSidebar } from "@/lib/sidebar-context"

export function DynamicMain({ children }: { children: ReactNode }) {
  const { collapsed, isMobile } = useSidebar()

  return (
    <motion.div
      animate={{ marginLeft: isMobile ? 0 : collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1 min-w-0"
    >
      {children}
    </motion.div>
  )
}
