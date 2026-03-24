'use client'

import { useEffect } from 'react'
import { getShopByOwnerIdAPI } from '~/apiRequests/shop.apiRequest'
import { useBoundStore } from '~/zustand/store'
import OrderTabs from '~/app/(private)/shop/orders/OrderTabs'


export default function OrdersPage() {
  const setShop = useBoundStore((state) => state.setShop)

  useEffect(() => {
    const fetchShopInfo = async () => {
      const shop = await getShopByOwnerIdAPI()
      setShop(shop)
    }
    fetchShopInfo()
  }, [setShop])

  return (
    <div className='flex flex-col gap-6 p-6'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-bold text-[#004643]'>Quản lý đơn hàng</h1>
      </div>
      
      {/* Dynamic Order Tabs Component */}
      <OrderTabs />
    </div>
  )
}
