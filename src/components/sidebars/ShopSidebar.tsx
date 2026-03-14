'use client'
import { LayoutDashboard, Package, PlusCircle, BarChart3, TicketPercent, Star, Store, ChevronRight } from 'lucide-react'
import Link from 'next/link'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '~/components/ui/sidebar'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '~/components/ui/collapsible'

const menuItems = [
  {
    title: 'Quản lý đơn hàng',
    icon: LayoutDashboard,
    url: '/shop/orders', 
  },
  {
    title: 'Quản lý sản phẩm',
    icon: Package,
    isActive: true,
    subItems: [
      {
        title: 'Tất cả sản phẩm',
        icon: Package,
        url: '/shop/products',
      },
      {
        title: 'Thêm mới sản phẩm',
        icon: PlusCircle,
        url: '/shop/products/new',
      },
    ],
  },
  {
    title: 'Doanh thu',
    icon: BarChart3,
    url: '/shop/revenue', 
  },
  {
    title: 'Mã giảm giá của Shop',
    icon: TicketPercent,
    url: '/shop/vouchers', 
  },
  {
    title: 'Quản lý đánh giá',
    icon: Star,
    url: '/shop/reviews', 
  },
  {
    title: 'Hồ sơ shop',
    icon: Store,
    url: '/shop/profile', 
  },
]

export function ShopSidebar() {
  return (
    <Sidebar variant='sidebar' collapsible='icon' className='border-r border-border'>
      <SidebarHeader className='p-4 border-b border-border'>
        <div className='flex items-center gap-2 px-1'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Store className='size-5' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold text-[#004643]'>Shop Manager</span>
            <span className='truncate text-xs text-muted-foreground'>Seller Dashboard</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu chính</SidebarGroupLabel>
          <SidebarMenu>
            {menuItems.map((item) =>
              item.subItems ? (
                <Collapsible key={item.title} asChild defaultOpen={item.isActive} className='group/collapsible'>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon className='size-4' />
                        <span>{item.title}</span>
                        <ChevronRight className='ml-auto size-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton asChild>
                              <Link href={subItem.url}>
                                <subItem.icon className='size-4' />
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <Link href={item.url}>
                      <item.icon className='size-4' />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ),
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
