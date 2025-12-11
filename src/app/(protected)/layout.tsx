import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/AppSidebar"
import { Separator } from "@/components/ui/separator"

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b border-white/10 px-4 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-10">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-white">AI Trading Platform</span>
                    </div>
                </header>
                <main className="flex-1 p-6 bg-slate-950">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    )
}
