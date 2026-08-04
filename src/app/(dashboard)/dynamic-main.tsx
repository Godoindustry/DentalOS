"use client"

import { motion } from "framer-motion"
import type { ReactNode } from "react"
import { useSidebar } from "@/lib/sidebar-context"

export function DynamicMain({ children }: { children: ReactNode }) {
  const { collapsed } = useSidebar()

  return (
    <motion.div
      animate={{ marginLeft: collapsed ? 72 : 256 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="flex-1"
    >
      {children}
    </motion.div>
  )
}
