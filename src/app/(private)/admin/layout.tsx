import type React from 'react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '~/components/ui/sidebar'
import { AdminSidebar } from '~/app/components/admin-sidebar'
import { Separator } from '~/components/ui/separator'
import { ChatSidebar } from '~/app/components/chat-sidebar'

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className={'font-sans antialiased'}>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset className='pr-12'>
          {' '}
          {/* Thêm padding-right để tránh bị cột icon đè lên */}
          <header className='flex h-16 shrink-0 items-center gap-2 border-b px-4 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12'>
            <div className='flex items-center gap-2'>
              <SidebarTrigger className='-ml-1' />
              <Separator orientation='vertical' className='mr-2 h-4' />
              <span className='text-sm font-medium text-muted-foreground'>Dashboard</span>
            </div>
          </header>
          <main>{children}</main>
        </SidebarInset>
        <ChatSidebar />
      </SidebarProvider>
    </div>
  )
}
