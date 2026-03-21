'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '~/components/ui/tabs'
import OrderTable from '~/components/shop/OrderTable'

const TABS = [
  { value: 'AWAITING_CONFIRMATION', label: 'Chờ xác nhận' },
  { value: 'PREPARING', label: 'Chờ lấy hàng' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERY_COMPLETED', label: 'Giao thành công' },
  { value: 'DELIVERY_FAILED', label: 'Giao thất bại' },
  { value: 'CANCELLED', label: 'Đã hủy' },
  { value: 'RETURNED', label: 'Trả hàng/Hoàn tiền' },
]

export default function OrderTabs() {
  const [activeTab, setActiveTab] = useState('AWAITING_CONFIRMATION')

  return (
    <div className='w-full'>
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0'>
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className='relative rounded-none border-b-2 border-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none transition-none focus-visible:ring-0 data-[state=active]:border-[#004643] data-[state=active]:text-[#004643] data-[state=active]:shadow-none'
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {TABS.map((tab) => (
          <TabsContent key={tab.value} value={tab.value} className='mt-6'>
            <OrderTable status={tab.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
