import { Sidebar } from "@/components/layout/sidebar"
import { Header } from "@/components/layout/header"
import { SidebarProvider } from "@/lib/sidebar-context"
import { DynamicMain } from "./dynamic-main"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <DynamicMain>
          <Header />
          <main className="flex-1 p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </DynamicMain>
      </div>
    </SidebarProvider>
  )
}
