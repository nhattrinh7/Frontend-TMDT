'use client'

import { useState, useEffect } from 'react'
import { Loader2, Package } from 'lucide-react'
import { toast } from 'sonner'
import { useBoundStore } from '~/zustand/store'
import { useInfiniteScroll } from '~/hooks/useInfiniteScroll'
import { getUserOrdersPaginatedAPI, cancelOrderAPI } from '~/apiRequests/order.apiRequest'
import type { UserOrder } from '~/apiRequests/order.apiRequest'
import OrderCard from '~/app/(private)/profile/OrderCard'
import OrderDeliveryTimelineDialog from '~/app/(private)/profile/OrderDeliveryTimelineDialog'

const ORDER_TABS = [
  { id: 'AWAITING_CONFIRMATION', label: 'Chờ xác nhận' },
  { id: 'PREPARING', label: 'Đang chuẩn bị' },
  { id: 'SHIPPING', label: 'Đang giao' },
  { id: 'DELIVERY_COMPLETED', label: 'Giao thành công' },
  { id: 'DELIVERY_FAILED', label: 'Giao thất bại' },
  { id: 'CANCELLED', label: 'Đã hủy' },
  { id: 'RETURNED', label: 'Trả hàng/Hoàn tiền' },
] as const

type OrderStatusTab = typeof ORDER_TABS[number]['id']

const ORDERS_PER_PAGE = 10

export default function MyOrders() {
  const user = useBoundStore((state) => state.user)
  const [activeStatus, setActiveStatus] = useState<OrderStatusTab>('AWAITING_CONFIRMATION')
  const [orders, setOrders] = useState<UserOrder[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [isTimelineOpen, setIsTimelineOpen] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null)

  const buildQueryParams = (status: OrderStatusTab) => {
    if (status === 'RETURNED') {
      return { status: 'DELIVERY_COMPLETED', returnStatus: 'REFUNDED' }
    }
    return { status }
  }

  const filterReturnedOrders = (items: UserOrder[], status: OrderStatusTab) => {
    if (status !== 'RETURNED') return items
    return items
      .map((order) => ({
        ...order,
        orderItems: order.orderItems.filter((item) => item.returnStatus === 'REFUNDED'),
      }))
      .filter((order) => order.orderItems.length > 0)
  }

  // Load thêm đơn hàng khi scroll xuống
  const loadMoreOrders = async () => {
    if (!user?.id || !cursor || loadingMore) return
    try {
      setLoadingMore(true)
      const res = await getUserOrdersPaginatedAPI(user.id, {
        ...buildQueryParams(activeStatus),
        cursor,
        limit: ORDERS_PER_PAGE,
      })

      const nextItems = filterReturnedOrders(res.data || [], activeStatus)
      setOrders(prev => [...prev, ...nextItems])
      setCursor(res.meta?.nextCursor || null)
      setHasMore(res.meta?.hasMore || false)
    } catch {
      toast.error('Không thể tải thêm đơn hàng')
    } finally {
      setLoadingMore(false)
    }
  }

  // Sentinel infinite scroll
  const { sentinelRef } = useInfiniteScroll({
    onLoadMore: loadMoreOrders,
    hasMore,
    isLoading: loadingMore,
  })

  // Load orders khi chuyển tab hoặc mount
  useEffect(() => {
    if (!user?.id) return
    const loadOrders = async () => {
      try {
        setIsLoading(true)
        setOrders([])
        setCursor(null)
        setHasMore(false)

        const res = await getUserOrdersPaginatedAPI(user.id, {
          ...buildQueryParams(activeStatus),
          limit: ORDERS_PER_PAGE,
        })

        setOrders(filterReturnedOrders(res.data || [], activeStatus))
        setCursor(res.meta?.nextCursor || null)
        setHasMore(res.meta?.hasMore || false)
      } catch {
        toast.error('Không thể tải đơn hàng')
      } finally {
        setIsLoading(false)
      }
    }
    loadOrders()
  }, [activeStatus, user?.id])

  const handleTabChange = (status: OrderStatusTab) => {
    if (status === activeStatus) return
    setActiveStatus(status)
  }

  // Hủy đơn hàng
  const handleCancelOrder = async (orderId: string, reason?: string) => {
    try {
      await cancelOrderAPI(orderId, reason)
      // Xóa đơn hàng vừa hủy khỏi danh sách
      setOrders(prev => prev.filter((o) => o.id !== orderId))
      toast.success('Đã hủy đơn hàng thành công')
    } catch {
      toast.error('Không thể hủy đơn hàng. Vui lòng thử lại.')
    }
  }

  const handleOpenTimeline = (orderId: string) => {
    setSelectedOrderId(orderId)
    setIsTimelineOpen(true)
  }

  return (
    <div className='bg-white rounded-2xl shadow-lg overflow-hidden'>
      {/* Header */}
      <div className='px-6 py-5 border-b border-gray-100'>
        <h2 className='text-xl font-bold text-gray-800'>Đơn Mua</h2>
      </div>

      {/* Sub-tabs */}
      <div className='border-b border-gray-100 overflow-x-auto'>
        <div className='flex min-w-max'>
          {ORDER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`relative px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors ${
                activeStatus === tab.id
                  ? 'text-[#004643]'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
              {/* Active indicator */}
              {activeStatus === tab.id && (
                <span className='absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#004643] rounded-t-full' />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className='p-5 min-h-[400px]'>
        {isLoading ? (
          <div className='flex flex-col items-center justify-center py-16'>
            <Loader2 className='w-8 h-8 animate-spin text-[#004643]' />
            <p className='mt-3 text-sm text-gray-500'>Đang tải đơn hàng...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16'>
            <div className='w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4'>
              <Package className='w-10 h-10 text-gray-300' />
            </div>
            <p className='text-gray-500'>Chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className='space-y-4'>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                activeStatus={activeStatus}
                onCancelOrder={handleCancelOrder}
                onViewTimeline={handleOpenTimeline}
              />
            ))}

            {/* Sentinel cho infinite scroll */}
            {hasMore && (
              <div ref={sentinelRef} className='flex justify-center py-4'>
                {loadingMore && <Loader2 className='w-6 h-6 animate-spin text-[#004643]' />}
              </div>
            )}
          </div>
        )}
      </div>

      <OrderDeliveryTimelineDialog
        open={isTimelineOpen}
        onOpenChange={setIsTimelineOpen}
        orderId={selectedOrderId}
      />
    </div>
  )
}
