'use client'
import { Sliders , Users, Store, Package, UserPlus, ShoppingBag, CheckCircle, Shirt, Sparkles, Laptop, Home, Dumbbell, UtensilsCrossed, ShoppingCart, Award, Ticket, ChevronRight } from 'lucide-react'
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
    title: 'Người dùng',
    icon: Users,
    url: '/admin/users', 
  },
  {
    title: 'Đơn hàng',
    icon: ShoppingCart,
    url: '/admin/orders', 
  },
  {
    title: 'Shops',
    icon: Store,
    isActive: true,
    subItems: [
      {
        title: 'Duyệt shop',
        icon: UserPlus,
        url: '/admin/shops/new',
      },
      {
        title: 'Quản lí shops',
        icon: Package,
        url: '/admin/shops',
      },
    ],
  },
  {
    title: 'Sản phẩm',
    icon: ShoppingBag,
    isActive: true,
    subItems: [
      {
        title: 'Duyệt sản phẩm',
        icon: CheckCircle,
        url: '/admin/products/new',
      },
      {
        title: 'Quản lí sản phẩm',
        icon: Shirt,
        url: '/admin/products',
      },
    ],
  },
  {
    title: 'Thương hiệu',
    icon: Award,
    url: '/admin/brands', 
  },
  {
    title: 'Szone Vouchers',
    icon: Ticket,
    url: '/admin/vouchers', 
  },
]

export function AdminSidebar() {
  return (
    <Sidebar variant='sidebar' collapsible='icon' className='border-r border-border'>
      <SidebarHeader className='p-4 border-b border-border'>
        <div className='flex items-center gap-2 px-1'>
          <div className='flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Sliders className='size-5' />
          </div>
          <div className='grid flex-1 text-left text-sm leading-tight'>
            <span className='truncate font-semibold text-[#004643]'>Szone Manager</span>
            <span className='truncate text-xs text-muted-foreground'>Admin Dashboard</span>
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